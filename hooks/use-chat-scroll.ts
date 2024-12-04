import { useGlobalContext } from "@/context/globalContext";
import { MessageData, user } from "@/lib/definitions";
import { useSocket } from "@/provider/socket-provider";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useRef,
} from "react";

type ChatScrollProps = {
  chatRef: React.RefObject<HTMLDivElement>;
  bottomRef: React.RefObject<HTMLDivElement>;
  shouldLoadMore: boolean;
  loadMore: () => void;
  setGoDown: Dispatch<SetStateAction<boolean>>;
  first: user | undefined;
  queryKey: string;
  other: string;
};

export const useChatScroll = ({
  chatRef,
  bottomRef,
  shouldLoadMore,
  loadMore,
  setGoDown,
  first,
  queryKey,
  other,
}: ChatScrollProps) => {
  const queryClient = useQueryClient();
  const { setUnreadMessages, setFinal } = useGlobalContext();
  const { socket } = useSocket();

  const seenMessagesRef = useRef<Set<string>>(new Set());
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const updateMessageStatusMutation = useMutation({
    mutationFn: async (messageIds: string[]) => {
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

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [queryKey] });
      socket.emit(`${other}:update`);
    },
    onError: (error) => {
      console.error("Error updating message status:", error);
    },
  });

  const updateMessageStatus = useCallback(
    (messageIds: string[]) => {
      updateMessageStatusMutation.mutate(messageIds, {
        onSuccess: () => {
          setUnreadMessages((prev) =>
            prev.filter((item) => !messageIds.includes(item.id))
          );
        },
      });
    },
    [updateMessageStatusMutation, setUnreadMessages]
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
      // setUnreadMessages((prev) => prev.filter((item) => item.id !== messageId));
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
    [scheduleUpdate, setFinal]
  );

  useEffect(() => {
    const topDiv = chatRef?.current;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const messageId = entry.target.id;
            const messageStatus = entry.target.getAttribute("data-status");
            const currentUser =
              entry.target.getAttribute("data-user") === "true";
            const chatId = entry.target.getAttribute("data-chat-id");

            if (messageStatus === "SENT" && !currentUser && chatId) {
              markMessageAsSeen(messageId, chatId);
            }
          }
        });
      },
      { threshold: 0.5 }
    );

    const handleScroll = () => {
      if (topDiv) {
        const distanceFromTop =
          topDiv.scrollHeight + topDiv.scrollTop - topDiv.clientHeight;
        const distanceFromBottom = topDiv.scrollTop;

        setGoDown(distanceFromBottom < 0);

        if (distanceFromTop < 100 && shouldLoadMore) {
          loadMore();
        }
      }
    };

    const messageElements = Array.from(
      document.querySelectorAll(".message-item")
    );
    messageElements.forEach((el) => observer.observe(el));

    topDiv?.addEventListener("scroll", handleScroll);

    return () => {
      messageElements.forEach((el) => observer.unobserve(el));
      topDiv?.removeEventListener("scroll", handleScroll);
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      observer.disconnect();
    };
  }, [shouldLoadMore, loadMore, chatRef, markMessageAsSeen, setGoDown]);

  return { markMessageAsSeen };
};
