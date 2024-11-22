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
import { MessageData, user } from "@/lib/definitions";
import { useChatQuery } from "@/hooks/use-chat-query";
import { useChatSocket } from "@/hooks/use-chat-socket";
import { useChatScroll } from "@/hooks/use-chat-scroll";
import { Loader2 } from "lucide-react";
import { formatMessageDate } from "@/lib/utils";
import { MessLeft, MessRight, ScrollDown, TypingLeft } from "./scroll-down";
import { useSocket } from "@/provider/socket-provider";
import { AnimatePresence } from "framer-motion";
import { useGlobalContext } from "@/context/globalContext";
import { useRouter } from "next/navigation";

export default function Messages({
  first,
  chatId,
  other,
}: {
  first: user | undefined;
  chatId: string | undefined;
  other?: user | undefined;
}) {
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const chatRef = useRef<HTMLDivElement | null>(null);
  const [goDown, setGoDown] = useState(false);
  const { typingUser } = useSocket();

  const router = useRouter();

  const { setUnreadMessages } = useGlobalContext();

  const currentUser = first ? first.id : "";
  const Other = other ? other.id : "";

  const apiUrl = "/api/messages";
  const paramKey = "chatId";
  const paramValue = chatId ? chatId : "";
  const typeKey = "typing";
  const stoptypekey = "stoptype";

  const queryKey = useMemo(() => `chat:${chatId}`, [chatId]);
  const addKey = useMemo(() => `chat:${chatId}:messages`, [chatId]);
  const updateKey = useMemo(() => `chat:${chatId}:messages:update`, [chatId]);

  useLayoutEffect(() => {
    const storedScrollPosition = sessionStorage.getItem(`scrollPos-${chatId}`);

    // ذخیره مقدار اولیه chatRef.current
    const chatElement = chatRef.current;

    if (storedScrollPosition && chatElement) {
      chatElement.scrollTop = parseInt(storedScrollPosition, 10);
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

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status } =
    useChatQuery({
      queryKey,
      apiUrl,
      paramKey,
      paramValue,
      currentUser,
    });
  useChatSocket({ queryKey, addKey, typeKey, updateKey, stoptypekey });
  const { unreadCount } = useChatScroll({
    chatRef,
    bottomRef,
    loadMore: fetchNextPage,
    shouldLoadMore: !isFetchingNextPage && !!hasNextPage,
    count: data?.pages?.[0]?.items?.length ?? 0,
    setGoDown: setGoDown,
    first: first,
    queryKey,
  });

  const groupMessagesByDate = (
    messages: MessageData[]
  ): Record<string, MessageData[]> => {
    return messages.reduce((groups, message) => {
      const dateKey = formatMessageDate(new Date(message.createdAt));
      return { ...groups, [dateKey]: [...(groups[dateKey] || []), message] };
    }, {} as Record<string, MessageData[]>);
  };

  const allMessages = useMemo(
    () => data?.pages.flatMap((page) => page.items) || [],
    [data]
  );

  const groupedMessages = useMemo(
    () => groupMessagesByDate(allMessages),
    [allMessages, groupMessagesByDate]
  );

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
    <div className=" flex-1 overflow-hidden relative">
      <ScrollDown
        goDown={goDown}
        func={HandleScrollDown}
        unreadCount={unreadCount}
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
        <AnimatePresence>
          {typingUser.userId &&
            typingUser.userId !== currentUser &&
            Other === typingUser.userId &&
            typingUser.isTyping && <TypingLeft message="typing..." />}
        </AnimatePresence>

        <div ref={bottomRef} />
        {Object.entries(groupedMessages).map(([date, msgs]) => (
          <div key={date} className="mb-4">
            <div className="text-center text-sm text-gray-500 my-2 sticky top-0 rtlDir  w-full flex items-center justify-center  ">
              <div className="px-2 py-1 bg-gray-100 rounded-full">{date}</div>
            </div>
            {msgs.reverse().map((message, index) => {
              const direction = "ltr";
              const isCurrentUser = message.senderId === currentUser;
              return (
                <div
                  key={message.id}
                  id={message.id}
                  className=" message-item"
                  data-status={message.status}
                  data-user={isCurrentUser.toString()}
                  data-chat-id={message.chatId}
                >
                  {isCurrentUser ? (
                    <MessRight message={message} direction={direction} />
                  ) : (
                    <MessLeft message={message} direction={direction} />
                  )}
                </div>
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
