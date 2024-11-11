"use client";

import classNames from "classnames";
import { Fragment, useEffect, useLayoutEffect, useRef, useState } from "react";
import { ScrollArea } from "./ui/scroll-area";
import { MessageData, text, user } from "@/lib/definitions";
import { useChatQuery } from "@/hooks/use-chat-query";
import { useChatSocket } from "@/hooks/use-chat-socket";
import { useChatScroll } from "@/hooks/use-chat-scroll";
import { Loader2 } from "lucide-react";
import { formatMessageDate, formatPersianDate } from "@/lib/utils";
import { MessLeft, MessRight, ScrollDown, TypingLeft } from "./scroll-down";
import { detectLanguageDirection } from "@/hooks/useTextDirection";
import { useSocket } from "@/provider/socket-provider";
import { AnimatePresence } from "framer-motion";

export default function Messages({
  text,
  first,
  chatId,
}: {
  text: text | undefined;
  first: user | undefined;
  chatId: string | undefined;
}) {
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const chatRef = useRef<HTMLDivElement | null>(null);
  const [goDown, setGoDown] = useState(false);
  const { typingUser } = useSocket();

  const currentUser = first ? first.id : "";

  const queryKey = `chat:${chatId}`;
  const addKey = `chat:${chatId}:messages`;
  const updateKey = `chat:${chatId}:messages:update`;
  const apiUrl = "/api/messages";
  const paramKey = "chatId";
  const paramValue = chatId ? chatId : "";
  const typeKey = "typing";
  const stoptypekey = "stoptype";

  useLayoutEffect(() => {
    const storedScrollPosition = sessionStorage.getItem(`scrollPos-${chatId}`);
    if (storedScrollPosition && chatRef.current) {
      chatRef.current.scrollTop = parseInt(storedScrollPosition, 10);
    }

    return () => {
      if (chatRef.current) {
        sessionStorage.setItem(
          `scrollPos-${chatId}`,
          chatRef.current.scrollTop.toString()
        );
      }
    };
  }, [chatId]);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status } =
    useChatQuery({
      queryKey,
      apiUrl,
      paramKey,
      paramValue,
    });
  useChatSocket({ queryKey, addKey, typeKey, updateKey, stoptypekey });
  useChatScroll({
    chatRef,
    bottomRef,
    loadMore: fetchNextPage,
    shouldLoadMore: !isFetchingNextPage && !!hasNextPage,
    count: data?.pages?.[0]?.items?.length ?? 0,
    setGoDown: setGoDown,
  });

  const groupMessagesByDate = (
    messages: MessageData[]
  ): Record<string, MessageData[]> => {
    return messages.reduce((groups, message) => {
      const dateKey = formatMessageDate(new Date(message.createdAt));
      return { ...groups, [dateKey]: [...(groups[dateKey] || []), message] };
    }, {} as Record<string, MessageData[]>);
  };
  const allMessages = data?.pages.flatMap((page) => page.items) || [];

  const groupedMessages = groupMessagesByDate(allMessages);

  function HandleScrollDown() {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }

  if (status === "pending") {
    return (
      <div className=" w-full h-full flex justify-center my-2 ">
        <Loader2 className="size-8 text-zinc-500 animate-spin " />
      </div>
    );
  }

  return (
    <div className=" flex-1 overflow-hidden relative">
      <ScrollDown goDown={goDown} func={HandleScrollDown} />
      <div
        className={classNames(
          "w-full  p-2  overflow-y-auto flex  flex-col-reverse h-full  "
        )}
        ref={chatRef}
      >
        <AnimatePresence>
          {typingUser.userId &&
            typingUser.userId !== currentUser &&
            typingUser.isTyping && <TypingLeft message="typing..." />}
        </AnimatePresence>

        <div ref={bottomRef} />
        {Object.entries(groupedMessages).map(([date, msgs]) => (
          <div key={date} className="mb-4">
            <div className="text-center text-sm text-gray-500 my-2 sticky top-0 rtlDir  w-full flex items-center justify-center  ">
              <div className="px-2 py-1 bg-gray-100 rounded-full">{date}</div>
            </div>
            {msgs.reverse().map((message, index) => {
              // const direction = detectLanguageDirection(message.content);
              // console.log("dir", direction);
              // const isP = it.senderId === currentUser;
              const direction = "ltr";

              const isCurrentUser = message.senderId === currentUser;
              return (
                <Fragment key={index}>
                  {isCurrentUser ? (
                    <MessRight message={message} direction={direction} />
                  ) : (
                    <MessLeft message={message} direction={direction} />
                  )}
                </Fragment>
              );
            })}
          </div>
        ))}

        {!hasNextPage && <div className="flex-1" />}
        {/* {!hasNextPage && <ChatWelcome type={type} name={NameOrEmail} />} */}
        {hasNextPage && (
          <div className="flex justify-center">
            {isFetchingNextPage ? (
              <Loader2 className="h-6 w-6 text-zinc-500 animate-spin my-4" />
            ) : (
              <button
                onClick={() => fetchNextPage()}
                className="text-zinc-500 hover:text-zinc-600 dark:text-zinc-400 text-xs my-4 dark:hover:text-zinc-300 transition"
              >
                Load previous messages
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
