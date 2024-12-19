"use client";

import React, {
  createContext,
  useContext,
  useCallback,
  useEffect,
  useRef,
  ReactNode,
  useState,
} from "react";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { useGlobalContext } from "@/context/globalContext";
import { useSocket } from "@/provider/socket-provider";

type ChatSeenContextType = {
  markMessageAsSeen: (messageId: string, chatId: string) => void;
  pendingUpdates: number;
  qkey: string;
  setQKey: React.Dispatch<React.SetStateAction<string>>;
  oth: string;
  setOth: React.Dispatch<React.SetStateAction<string>>;
};

const ChatSeenContext = createContext<ChatSeenContextType | undefined>(
  undefined
);

type ChatSeenProviderProps = {
  children: ReactNode;
  // queryKey: string;
  // other: string;
};

export const ChatSeenProvider: React.FC<ChatSeenProviderProps> = ({
  children,
}) => {
  const queryClient = useQueryClient();
  const { setFinal } = useGlobalContext();
  const { socket } = useSocket();
  const [qkey, setQKey] = useState("");
  const [oth, setOth] = useState("");

  const [pendingUpdates, setPendingUpdates] = useState(0);
  const seenMessagesRef = useRef(new Set<string>());
  const updateTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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
      // console.log("Batch update successful");
      console.log("Batch update successful", { qkey, oth });

      queryClient.invalidateQueries({ queryKey: [qkey] });
      socket.emit("update", { qkey, oth });
      setPendingUpdates(0);
    },
    onError: (error) => {
      console.error("Error updating message status:", error);
      // Retry logic could be implemented here
    },
  });

  const updateMessageStatus = useCallback(() => {
    const messageIds = Array.from(seenMessagesRef.current);
    if (messageIds.length > 0) {
      console.log("Sending batch update for messages:", messageIds);
      updateMessageStatusMutation.mutate(messageIds);
      seenMessagesRef.current.clear();
    }
  }, [updateMessageStatusMutation]);

  const scheduleUpdate = useCallback(() => {
    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current);
    }
    updateTimeoutRef.current = setTimeout(() => {
      updateMessageStatus();
    }, 2000);
  }, [updateMessageStatus]);

  const markMessageAsSeen = useCallback(
    (messageId: string, chatId: string) => {
      if (!seenMessagesRef.current.has(messageId)) {
        seenMessagesRef.current.add(messageId);
        setPendingUpdates((prev) => prev + 1);
        console.log("Marking message as seen (not sent yet):", messageId);

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
      }
    },
    [setFinal, scheduleUpdate]
  );

  useEffect(() => {
    return () => {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
      updateMessageStatus();
    };
  }, [updateMessageStatus]);

  return (
    <ChatSeenContext.Provider
      value={{ markMessageAsSeen, pendingUpdates, qkey, setQKey, oth, setOth }}
    >
      {children}
    </ChatSeenContext.Provider>
  );
};

export const useChatSeen = () => {
  const context = useContext(ChatSeenContext);
  if (context === undefined) {
    throw new Error("useChatSeen must be used within a ChatSeenProvider");
  }
  return context;
};
