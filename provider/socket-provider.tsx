"use client";

import { useQueryClient } from "@tanstack/react-query";
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
  const queryClient = useQueryClient();

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
    // io.emit("abcd");

    socketInstance.on("connect", () => {
      setIsConnected(true);
      socketInstance.on("disconnect", () => {
        setIsConnected(false);
      });
    });

    socketInstance.on("aaaa", (data: any) => {
      console.log("kkkkkkkkkkkk", { data });
    });

    socketInstance.on("abcd", (data: any) => {
      console.log("client update", { data });
      queryClient.invalidateQueries({ queryKey: [`${data}`] });
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
