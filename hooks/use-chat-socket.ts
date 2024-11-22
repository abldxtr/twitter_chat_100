import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { User, Message, Chat } from "@prisma/client";
import { useSocket } from "@/provider/socket-provider";

type ChatSocketProps = {
  addKey: string;
  updateKey: string;
  queryKey: string;
  typeKey: string;
  stoptypekey: string;
};

export const useChatSocket = ({
  addKey,
  updateKey,
  queryKey,
  typeKey,
  stoptypekey,
}: ChatSocketProps) => {
  const { socket, setTypingUser, typingUser } = useSocket();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!socket) {
      return;
    }

    socket.on(addKey, (message: any) => {
      queryClient.setQueryData([queryKey], (oldData: any) => {
        if (!oldData || !oldData.pages || oldData.pages.length === 0) {
          return {
            pages: [
              {
                items: [message],
              },
            ],
          };
        }

        const newData = [...oldData.pages];

        newData[0] = {
          ...newData[0],
          items: [message, ...newData[0].items],
        };

        return {
          ...oldData,
          pages: newData,
        };
      });
      // queryClient.invalidateQueries({ queryKey: ["userList"] });
    });

    socket.on(
      typeKey,
      ({ isTyping, userId }: { isTyping: boolean; userId: string }) => {
        console.log(` is typing: ${isTyping}`);
        setTypingUser({ isTyping, userId });
      }
    );

    socket.on(
      stoptypekey,
      ({ isTyping, userId }: { isTyping: boolean; userId: string }) => {
        console.log(`stop typing: ${isTyping}`);
        setTypingUser({ isTyping, userId });
      }
    );

    return () => {
      socket.off(addKey);
      socket.off(typeKey);
    };
  }, [queryClient, addKey, queryKey, socket, typeKey, stoptypekey]);
};
