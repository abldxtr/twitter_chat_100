"use client";

import React, { createContext, useContext, useState } from "react";

interface CounterContextType {
  currentView: string;
  setCurrentView: React.Dispatch<React.SetStateAction<string>>;

  showFriendProfile: boolean;
  setShowFriendProfile: React.Dispatch<React.SetStateAction<boolean>>;
  showProfile: boolean;
  setShowProfile: React.Dispatch<React.SetStateAction<boolean>>;
}

const GlobalContext = createContext<CounterContextType | undefined>(undefined);

export const GlobalProvider = ({ children }: { children: React.ReactNode }) => {
  const [currentView, setCurrentView] = useState<string>("all-chats");
  const [showFriendProfile, setShowFriendProfile] = useState<boolean>(false);
  const [showProfile, setShowProfile] = useState<boolean>(false);

  return (
    <GlobalContext.Provider
      value={{
        currentView,
        setCurrentView,
        showProfile,
        setShowProfile,
        showFriendProfile,
        setShowFriendProfile,
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
};

export const useGlobalContext = () => {
  return useContext(GlobalContext);
};
