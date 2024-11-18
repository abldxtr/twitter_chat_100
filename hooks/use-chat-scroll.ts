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
  count,
  setGoDown,
  first,
  queryKey,
}: ChatScrollProps) => {
  const [isPending, startTransition] = useTransition();
  const queryClient = useQueryClient();
  const {
    setUnreadCount,
    unreadCount,
    unreadMessages,
    setUnreadMessages,
    setUnreadCountMenue,
    unreadCountMenue,
  } = useGlobalContext();

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
        queryClient.invalidateQueries({
          queryKey: [queryKey],
        });
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
    (messageId: string) => {
      seenMessagesRef.current.add(messageId);
      setUnreadMessages((prev) =>
        prev.filter((item) => item.id !== messageId)
      );
      scheduleUpdate();
    },
    [scheduleUpdate]
  );

  const UpdateMssRead = useCallback(
    async (messageId: string) => {
      try {
        setUnreadMessages((prev) =>
          prev.filter((item) => item.id !== messageId)
        );
        const response = await fetch("/api/messages/update-status", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ messageId }),
        });
        if (!response.ok) {
          throw new Error("Failed to update message status");
        }
        queryClient.invalidateQueries({
          queryKey: [queryKey],
        });
      } catch (error) {
        console.error("Error updating message status:", error);
      }
    },
    [setUnreadMessages, queryClient, queryKey]
  );

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

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const messageId = entry.target.id;
            const messageStatus = entry.target.getAttribute("data-status");
            const currentUser =
              entry.target.getAttribute("data-user") === "true";

            if (messageStatus === "SENT" && !currentUser) {
              console.log("first if");
              console.log("unreadMessages", unreadMessages);
              console.log("messageId", messageId);
              markMessageAsSeen(messageId);

              // const messageExists = unreadMessages.some((item) =>
              //   console.log(item.id === messageId)
              // );
              // if (messageExists) {
              // console.log("second if");

              // UpdateMssRead(messageId);
              // }
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

    topDiv?.addEventListener("scroll", handleScroll);

    return () => {
      messageElements.forEach((el) => observer.unobserve(el));

      topDiv?.removeEventListener("scroll", handleScroll);
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      // updateLastSeen({ userId: first?.id! });
    };
  }, [shouldLoadMore, loadMore, chatRef, UpdateMssRead, markMessageAsSeen]);

  return { optimisticMessages, unreadCount };
};

// const UpdateMssRead = async (messageId: string) => {
//   // setUnreadMessages(unreadMessages.filter((item) => item.id !== messageId));
//   startTransition(async () => {
//     try {
//       updateOptimisticMessages(messageId);
//       const response = await fetch("/api/messages/update-status", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({ messageId }),
//       });
//       // queryClient.invalidateQueries({
//       //   queryKey: [`${queryKey}`, "uerList"],
//       // });

//       // return { success: true };
//     } catch (error) {
//       console.error("Error updating message status:", error);
//       // return { success: false };
//     }
//   });
// };
