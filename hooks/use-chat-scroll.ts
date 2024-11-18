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
  const UpdateMssRead = useCallback(
    async (messageId: string) => {
      startTransition(async () => {
        updateOptimisticMessages(messageId);
        try {
          const response = await fetch("/api/messages/update-status", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ messageId }),
          });

          // return { success: true };
        } catch (error) {
          console.error("Error updating message status:", error);
          // return { success: false };
        }
      });
    },
    [router]
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
              // UpdateMssRead(messageId).then(() => {
              startTransition(async () => {
                queryClient.invalidateQueries({
                  queryKey: [`${queryKey}`, "uerList"],
                });
              });
              // });
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
      updateLastSeen({ userId: first?.id! });
    };
  }, [shouldLoadMore, loadMore, chatRef, UpdateMssRead]);
};
