"use client";

import classNames from "classnames";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { Loader2 } from "lucide-react";
import { cn, formatMessageDate } from "@/lib/utils";
import ChatMessage, { ScrollDown, TypingLeft } from "./scroll-down";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useSession } from "next-auth/react";
import usePresence from "@/hooks/usePresence";

export default function Messages({
  chatId,
  other,
}: {
  chatId: string | undefined;
  other?: string | undefined;
}) {
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const chatRef = useRef<HTMLDivElement | null>(null);
  const unReadDiv = useRef<HTMLDivElement | null>(null);
  const [goDown, setGoDown] = useState(false);
  const usr = useSession();
  const currentUser = usr.data?.user.id ? usr.data?.user.id : "";

  const paramValue = chatId ? chatId : "";

  const [data, others, updatePresence] = usePresence(paramValue, currentUser, {
    text: "",
    // emoji: Emojis[userId % Emojis.length],
    x: 0,
    y: 0,
    typing: false as boolean,
  });
  const presentOthers = (others ?? []).filter((p) => p.present)[0];
  // console.log({ presentOthers });
  // console.log({ data });
  // console.log({ others });

  useLayoutEffect(() => {
    const storedScrollPosition = sessionStorage.getItem(`scrollPos-${chatId}`);

    // ذخیره مقدار اولیه chatRef.current
    const chatElement = chatRef.current;
    const unReadElement = chatRef.current;

    if (storedScrollPosition && chatElement) {
      chatElement.scrollTop = parseInt(storedScrollPosition, 10);
    } else if (storedScrollPosition && unReadElement) {
      // chatElement?.scrollTo(0, unReadElement?.getBoundingClientRect().top)
      // unReadElement.scrollIntoView({ behavior: "instant" });
      // const unreadMessageElement = document.getElementById("uuuu");
      // if (unreadMessageElement) {
      //   unreadMessageElement.scrollIntoView({
      //     behavior: "instant",
      //     block: "center",
      //   });
      // }
    }

    return () => {
      if (chatElement) {
        sessionStorage.setItem(
          `scrollPos-${chatId}`,
          chatElement.scrollTop.toString()
        );
      }
    };
  }, [chatId]);

  const queryKey = useMemo(() => `chat:${paramValue}`, [paramValue]);

  const chatIdd = chatId ? chatId : "";
  const cc = chatIdd;

  const messages = useQuery(api.message.messages, { chatId: cc });

  const groupedMessages = useMemo(() => {
    if (!messages) return {};
    return messages.reduce(
      (acc, message) => {
        const dateKey = formatMessageDate(new Date(message._creationTime));
        if (!acc[dateKey]) acc[dateKey] = [];
        acc[dateKey].push(message);
        return acc;
      },
      {} as Record<string, typeof messages>
    );
  }, [messages]);

  const HandleScrollDown = useCallback(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, []);

  if (status === "pending") {
    return (
      <div className=" w-full h-full flex justify-center my-2 ">
        <Loader2 className="size-8 text-zinc-500 animate-spin " />
      </div>
    );
  }

  return (
    <div className=" flex-1 overflow-hidden relative isolate ">
      <ScrollDown
        goDown={goDown}
        func={HandleScrollDown}
        // unreadCount={unreadCount}
        // unreadCount={optimisticMessages.length}
        chatId={paramValue}
        queryKey={queryKey}
      />
      <div
        className={classNames(
          "w-full  p-2  overflow-y-auto flex  flex-col-reverse h-full  "
        )}
        ref={chatRef}
      >
        {/* {typingUser.userId &&
          typingUser.userId !== currentUser &&
          Other === typingUser.userId &&
          typingUser.isTyping && <TypingLeft message="typing..." />} */}

        {presentOthers && presentOthers.data.typing && (
          <TypingLeft message="typing..." />
        )}
        <div ref={bottomRef} />

        {Object.entries(groupedMessages).map(([date, msgs]) => (
          <div key={date} className="mb-4 isolate">
            <div className="text-center text-sm text-gray-500 my-2 sticky top-0 rtlDir z-[200] w-full flex items-center justify-center">
              <div className="px-2 py-1 bg-gray-100 rounded-full">{date}</div>
            </div>
            {msgs.map((message) => (
              <ChatMessage
                key={message._id}
                message={message}
                isCurrentUser={message.senderId === currentUser}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
