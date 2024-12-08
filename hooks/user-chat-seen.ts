import { useGlobalContext } from "@/context/globalContext";
import { useSocket } from "@/provider/socket-provider";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { useCallback, useEffect, useRef } from "react";
import { useInView } from "react-intersection-observer";

type ChatSeenProps = {
  queryKey: string;
  other: string;
};

export const useChatSeen = ({ queryKey, other }: ChatSeenProps) => {
  const queryClient = useQueryClient();
  const { setUnreadMessages, setFinal } = useGlobalContext();
  const { socket } = useSocket();

  const seenMessagesRef = useRef(new Set<string>());
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const { ref, inView } = useInView({
    threshold: 0.5,
    triggerOnce: true,
  });

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
      console.log("onSuccess onSuccess onSuccess");
      queryClient.invalidateQueries({ queryKey: [queryKey] });
      // io.emit(`${data.other}:update`, { queryKey: data.queryKey });

      socket.emit("update", { queryKey, other });
    },
    onError: (error) => {
      console.error("Error updating message status:", error);
    },
  });

  const updateMessageStatus = useCallback(
    (messageIds: string[]) => {
      console.log("Updating message status for:", messageIds);

      updateMessageStatusMutation.mutate(messageIds, {
        onSuccess: () => {
          // setUnreadMessages((prev) =>
          //   prev.filter((item) => !messageIds.includes(item.id))
          // );
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
        console.log("Scheduled update for messages:", seenMessagesRef.current);
        updateMessageStatus(messageIds);
        seenMessagesRef.current.clear();
      }
    }, 2000);
  }, [updateMessageStatus]);

  const markMessageAsSeen = useCallback(
    (messageId: string, chatId: string) => {
      seenMessagesRef.current.add(messageId);
      console.log("Marking message as seen:", messageId);

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
    const messageElements = document.querySelectorAll(".message-item");
    messageElements.forEach((el) => {
      // const messageId = el.id;
      const messageId = el.getAttribute("data-messid")!;

      const messageStatus = el.getAttribute("data-status");
      const currentUser = el.getAttribute("data-user") === "true";
      const chatId = el.getAttribute("data-chat-id");
      console.log("el", el);
      console.log("inView", inView);

      if (inView && messageStatus === "SENT" && !currentUser && chatId) {
        console.log("Message came into view:", messageId);
        markMessageAsSeen(messageId, chatId);
      }
    });
  }, [inView, markMessageAsSeen]);

  return { ref, markMessageAsSeen };
};
