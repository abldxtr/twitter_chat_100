"use client";

import { userList } from "@/components/message/m-list";
import { MessageData } from "@/lib/definitions";
import React, { createContext, useContext, useEffect, useState } from "react";
export type final = {
  [key: string]: MessageData[];
}[];
export type FileState = {
  file: File | string;
  key: string; // used to identify the file in the progress callback
  progress: "PENDING" | "COMPLETE" | "ERROR" | number;
};

interface CounterContextType {
  currentView: string;
  setCurrentView: React.Dispatch<React.SetStateAction<string>>;

  showFriendProfile: boolean;
  setShowFriendProfile: React.Dispatch<React.SetStateAction<boolean>>;
  showProfile: boolean;
  setShowProfile: React.Dispatch<React.SetStateAction<boolean>>;
  mobileMenue: boolean;
  setMobileMenue: React.Dispatch<React.SetStateAction<boolean>>;
  chatIdActive: userList | null;
  setChatIdActive: React.Dispatch<React.SetStateAction<userList | null>>;
  unreadCount: number;
  setUnreadCount: React.Dispatch<React.SetStateAction<number>>;
  unreadMessages: MessageData[];
  setUnreadMessages: React.Dispatch<React.SetStateAction<MessageData[]>>;
  unreadCountMenue: {
    id: string;
    count: number;
  }[];
  setUnreadCountMenue: React.Dispatch<
    React.SetStateAction<
      {
        id: string;
        count: number;
      }[]
    >
  >;
  final: final;
  setFinal: React.Dispatch<React.SetStateAction<final>>;
  files: FileList | null;
  setFiles: React.Dispatch<React.SetStateAction<FileList | null>>;
  imgTemp: FileState[];
  setImgTemp: React.Dispatch<React.SetStateAction<FileState[]>>;
  isShowImgTemp: boolean;
  setIsShowImgTemp: React.Dispatch<React.SetStateAction<boolean>>;
  openChatCreate: boolean;
  setOpenChatCreate: React.Dispatch<React.SetStateAction<boolean>>;
}

const GlobalContext = createContext<CounterContextType | undefined>(undefined);

export const GlobalProvider = ({ children }: { children: React.ReactNode }) => {
  const [imgTemp, setImgTemp] = useState<FileState[]>([]);
  const [currentView, setCurrentView] = useState<string>("all-chats");
  const [showFriendProfile, setShowFriendProfile] = useState<boolean>(false);
  const [files, setFiles] = useState<FileList | null>(null);
  const [showProfile, setShowProfile] = useState<boolean>(false);
  const [mobileMenue, setMobileMenue] = useState<boolean>(true);
  const [chatIdActive, setChatIdActive] = useState<userList | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isShowImgTemp, setIsShowImgTemp] = useState<boolean>(true);
  const [openChatCreate, setOpenChatCreate] = useState<boolean>(false);

  const [unreadCountMenue, setUnreadCountMenue] = useState<
    { id: string; count: number }[]
  >([]);

  const [unreadMessages, setUnreadMessages] = useState<MessageData[]>([]);

  const [final, setFinal] = useState<final>([]);

  useEffect(() => {
    // if (unreadMessages) {
    setUnreadCount(unreadMessages.length);
    // }
  }, [unreadMessages]);

  return (
    <GlobalContext.Provider
      value={{
        currentView,
        setCurrentView,
        showProfile,
        setShowProfile,
        showFriendProfile,
        setShowFriendProfile,
        mobileMenue,
        setMobileMenue,
        chatIdActive,
        setChatIdActive,
        unreadCount,
        setUnreadCount,
        unreadMessages,
        setUnreadMessages,
        unreadCountMenue,
        setUnreadCountMenue,
        final,
        setFinal,
        files,
        setFiles,
        imgTemp,
        setImgTemp,
        isShowImgTemp,
        setIsShowImgTemp,
        openChatCreate,
        setOpenChatCreate,
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
};

export const useGlobalContext = () => {
  const GlobalState = useContext(GlobalContext);
  if (GlobalState === undefined) {
    throw new Error("useGlobalContext must be used within a CounterProvider");
  }

  return GlobalState;
};
