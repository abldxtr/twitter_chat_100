import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { User, Message, Chat } from "@prisma/client";
import { useSocket } from "@/provider/socket-provider";
import { MessageData } from "@/lib/definitions";
import { useGlobalContext } from "@/context/globalContext";

type ChatSocketProps = {
  addKey: string;
  updateKey: string;
  queryKey: string;
  typeKey: string;
  stoptypekey: string;
  userId: string;
  chatId: string;
};

export const useChatSocket = ({
  addKey,
  updateKey,
  queryKey,
  typeKey,
  stoptypekey,
  userId,
  chatId,
}: ChatSocketProps) => {
  const { socket, setTypingUser, typingUser } = useSocket();
  const queryClient = useQueryClient();
  const { final, setFinal } = useGlobalContext();

  useEffect(() => {
    if (!socket) {
      return;
    }

    // socket.on(addKey, (message: MessageData) => {
    //   queryClient.setQueryData([queryKey], (oldData: any) => {
    //     if (!oldData || !oldData.pages || oldData.pages.length === 0) {
    //       return {
    //         pages: [
    //           {
    //             items: [message],
    //           },
    //         ],
    //       };
    //     }

    //     const newData = [...oldData.pages];

    //     newData[0] = {
    //       ...newData[0],
    //       items: [message, ...newData[0].items],
    //     };

    //     return {
    //       ...oldData,
    //       pages: newData,
    //     };
    //   });
    //   // queryClient.invalidateQueries({ queryKey: ["userList"] });
    // });

    socket.on(userId, (message: MessageData) => {
      console.log("fanl userId sec", final);
      setFinal((prevFinal) => {
        const existingChatIndex = prevFinal.findIndex(
          (item) => Object.keys(item)[0] === message.chatId
        );

        if (existingChatIndex !== -1) {
          const updatedFinal = [...prevFinal];
          const chatId = Object.keys(updatedFinal[existingChatIndex])[0];
          updatedFinal[existingChatIndex] = {
            [chatId]: [...updatedFinal[existingChatIndex][chatId], message],
          };
          return updatedFinal;
        } else {
          return [...prevFinal, { [message.chatId]: [message] }];
        }
      });
      console.log("fanl userId sec", final);

      queryClient.invalidateQueries({ queryKey: ["userList"] });

      if (message.chatId === chatId) {
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
      }
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
      socket.off(stoptypekey);
    };
  }, [queryClient, addKey, queryKey, socket, typeKey, stoptypekey]);
};
