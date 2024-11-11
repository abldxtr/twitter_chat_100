"use client";

import {
  Dispatch,
  SetStateAction,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { io as ClientIO } from "socket.io-client";

type SocketContextType = {
  socket: any | null;
  isConnected: boolean;
  typingUser: typing;
  setTypingUser: Dispatch<SetStateAction<typing>>;
};

export type typing = {
  isTyping: boolean;
  userId: string;
};

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
  typingUser: { isTyping: false, userId: "" },
  setTypingUser: () => {},
});

export const useSocket = () => {
  return useContext(SocketContext);
};

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [typingUser, setTypingUser] = useState<typing>({
    isTyping: false,
    userId: "",
  });

  useEffect(() => {
    const socketInstance = new (ClientIO as any)(
      process.env.NEXT_PUBLIC_SITE_URL!,
      {
        path: "/api/socket/io",
        addTrailingSlash: false,
      }
    );

    socketInstance.on("connect", () => {
      setIsConnected(true);
    });

    // هنگامی که یک کاربر در حال تایپ است
    // socketInstance.on("isTyping", (data: any) => {
    //   // ارسال وضعیت تایپ به سایر کاربران در چت
    //   console.log("user typing", data);

    //   setTypingUser(true);
    //   // socketInstance
    //   //   .to(data.chatId)
    //   //   .emit("typing", { userId: data.userId, isTyping: true });
    // });

    // هنگامی که یک کاربر تایپ را متوقف می‌کند
    // socketInstance.on("stopTyping", ({ data }: { data: typing }) => {
    //   // ارسال وضعیت توقف تایپ به سایر کاربران
    //   // const user = typingUser
    //   // user === data
    //   console.log("user stoped to type", data);

    //   setTypingUser(false);

    //   // socketInstance
    //   //   .to(data.chatId)
    //   //   .emit("typing", { userId: data.userId, isTyping: false });
    // });

    socketInstance.on("disconnect", () => {
      setIsConnected(false);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider
      value={{ socket, isConnected, typingUser, setTypingUser }}
    >
      {children}
    </SocketContext.Provider>
  );
};
