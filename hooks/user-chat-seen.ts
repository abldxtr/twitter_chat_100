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
  queryKey: string;
};

export const useChatSeen = ({ queryKey }: ChatScrollProps) => {
  const queryClient = useQueryClient();
  const { setUnreadMessages, setFinal } = useGlobalContext();
  const { socket } = useSocket();

  const seenMessagesRef = useRef(new Set<string>());
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

      socket.emit("update");
    },
    onError: (error) => {
      console.error("Error updating message status:", error);
    },
  });

  const updateMessageStatus = (messageIds: string[]) => {
    console.log("messageIds", messageIds);

    updateMessageStatusMutation.mutate(messageIds, {
      onSuccess: () => {
        setUnreadMessages((prev) =>
          prev.filter((item) => !messageIds.includes(item.id))
        );
      },
    });
  };

  const scheduleUpdate = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    timerRef.current = setTimeout(() => {
      const messageIds = Array.from(seenMessagesRef.current);
      if (messageIds.length > 0) {
        console.log("seenMessagesRef.current", seenMessagesRef.current);
        updateMessageStatus(messageIds);
        seenMessagesRef.current.clear();
      }
    }, 2000);
  };

  const markMessageAsSeen = (messageId: string, chatId: string) => {
    seenMessagesRef.current.add(messageId);
    // console.log("********", seenMessagesRef.current);

    scheduleUpdate();
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
  };
  const createObserver = () => {
    return new IntersectionObserver(
      (entries) => {
        console.log(entries);
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const messageElement = entry.target;
            const messageId = entry.target.id;
            const messageStatus = entry.target.getAttribute("data-status");
            const currentUser =
              entry.target.getAttribute("data-user") === "true";
            const chatId = entry.target.getAttribute("data-chat-id");

            if (messageStatus === "SENT" && !currentUser && chatId) {
              console.log("if if if if ");
              markMessageAsSeen(messageId, chatId);
              seenMessagesRef.current.add(messageId);
            }
          }
        });
      },
      { threshold: 0.5 }
    );
  };

  useEffect(() => {
    const observer = createObserver();
    const messageElements = Array.from(
      document.querySelectorAll(".message-item")
    );
    messageElements.forEach((el) => observer.observe(el));

    return () => {
      messageElements.forEach((el) => {
        observer.unobserve(el);
        seenMessagesRef.current.delete(el.id); // Updated: Remove message from seenMessages
      });
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      observer.disconnect();
    };
  }, []);

  //   return { markMessageAsSeen };
};
