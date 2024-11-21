import { useGlobalContext } from "@/context/globalContext";
import { updateLastSeen } from "@/lib/actions";
import { MessageData, user } from "@/lib/definitions";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useOptimistic,
  useRef,
  useState,
  useTransition,
} from "react";

type ChatScrollProps = {
  chatRef: React.RefObject<HTMLDivElement>;
  bottomRef: React.RefObject<HTMLDivElement>;
  shouldLoadMore: boolean;
  loadMore: () => void;
  count: number;
  setGoDown: Dispatch<SetStateAction<boolean>>;
  first: user | undefined;
  queryKey: string;
};

export const useChatScroll = ({
  chatRef,
  bottomRef,
  shouldLoadMore,
  loadMore,
  setGoDown,
  first,
  queryKey,
}: ChatScrollProps) => {
  const [isPending, startTransition] = useTransition();
  const queryClient = useQueryClient();
  console.log("queryClient", queryClient);
  const { unreadCount, unreadMessages, setUnreadMessages, setFinal, final } =
    useGlobalContext();

  const [optimisticMessages, updateOptimisticMessages] = useOptimistic<
    MessageData[]
  >(
    unreadMessages,
    // @ts-ignore
    (state: MessageData[], messageId: string) =>
      state.filter((item) => item.id !== messageId)
  );

  const router = useRouter();
  const seenMessagesRef = useRef<Set<string>>(new Set());
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const updateMessageStatus = useCallback(
    async (messageIds: string[]) => {
      try {
        const response = await fetch("/api/messages/update-status", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ messageIds }),
        });
        if (!response.ok) {
          throw new Error("Failed to update message status");
        }

        Promise.all([
          queryClient.invalidateQueries({
            queryKey: [queryKey],
          }),
          queryClient.invalidateQueries({
            queryKey: ["userList"],
          }),
        ]);
        setUnreadMessages((prev) =>
          prev.filter((item) => !messageIds.includes(item.id))
        );
      } catch (error) {
        console.error("Error updating message status:", error);
      }
    },
    [queryClient, queryKey, setUnreadMessages]
  );

  const scheduleUpdate = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    timerRef.current = setTimeout(() => {
      const messageIds = Array.from(seenMessagesRef.current);
      if (messageIds.length > 0) {
        updateMessageStatus(messageIds);
        seenMessagesRef.current.clear();
      }
    }, 2000);
  }, [updateMessageStatus]);

  const markMessageAsSeen = useCallback(
    (messageId: string, chatId: string) => {
      seenMessagesRef.current.add(messageId);
      setUnreadMessages((prev) => prev.filter((item) => item.id !== messageId));
      setFinal((prevFinal) =>
        prevFinal
          .map((chatObj) => {
            if (Object.keys(chatObj)[0] === chatId) {
              const messages = chatObj[chatId].filter(
                (msg) => msg.id !== messageId
              );
              return { [chatId]: messages };
            }
            return chatObj;
          })
          .filter((chatObj) => Object.values(chatObj)[0].length > 0)
      );
      scheduleUpdate();
    },
    [scheduleUpdate]
  );
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const messageId = entry.target.id;
          const messageStatus = entry.target.getAttribute("data-status");
          const currentUser = entry.target.getAttribute("data-user") === "true";
          const chatId = entry.target.getAttribute("data-chat-id");

          if (messageStatus === "SENT" && !currentUser && chatId) {
            markMessageAsSeen(messageId, chatId);
          }
        }
      });
    },
    { threshold: 0.5 }
  );

  const messageElements = Array.from(
    document.querySelectorAll(".message-item")
  );

  messageElements.forEach((el) => observer.observe(el));

  useEffect(() => {
    const topDiv = chatRef?.current;

    const handleScroll = () => {
      if (topDiv) {
        const distanceFromTop =
          topDiv?.scrollHeight + topDiv.scrollTop - topDiv.clientHeight;
        const distanceFromBottom = topDiv.scrollTop;

        distanceFromBottom < 0 ? setGoDown(true) : setGoDown(false);

        if (distanceFromTop === 0 && shouldLoadMore) {
          loadMore();
        }
      }
    };

    topDiv?.addEventListener("scroll", handleScroll);

    return () => {
      messageElements.forEach((el) => observer.unobserve(el));

      topDiv?.removeEventListener("scroll", handleScroll);
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [shouldLoadMore, loadMore, chatRef, markMessageAsSeen]);

  return { optimisticMessages, unreadCount };
};
