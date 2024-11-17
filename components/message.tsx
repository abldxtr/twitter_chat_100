"use client";

import classNames from "classnames";
import {
  Fragment,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
} from "react";
import { ScrollArea } from "./ui/scroll-area";
import { MessageData, user } from "@/lib/definitions";
import { useChatQuery } from "@/hooks/use-chat-query";
import { useChatSocket } from "@/hooks/use-chat-socket";
import { useChatScroll } from "@/hooks/use-chat-scroll";
import { Loader2 } from "lucide-react";
import { formatMessageDate } from "@/lib/utils";
import { MessLeft, MessRight, ScrollDown, TypingLeft } from "./scroll-down";
import { useSocket } from "@/provider/socket-provider";
import { AnimatePresence } from "framer-motion";
import { updateLastSeen, updateMessageReadStatus } from "@/lib/actions";
import { useGlobalContext } from "@/context/globalContext";
import { useRouter } from "next/navigation";

export default function Messages({
  first,
  chatId,
}: {
  first: user | undefined;
  chatId: string | undefined;
}) {
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const chatRef = useRef<HTMLDivElement | null>(null);
  const [goDown, setGoDown] = useState(false);
  const { typingUser } = useSocket();
  const [isPending, startTransition] = useTransition();

  const router = useRouter();

  const { unreadCount, setUnreadCount, unreadMessages, setUnreadMessages } =
    useGlobalContext();

  const currentUser = first ? first.id : "";

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

  useEffect(() => {
    return () => {
      updateLastSeen({ userId: first?.id! });
    };
  }, []);

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

  async function UpdateMssRead(messageId: string) {
    try {
      const response = await fetch(
        "https://rlyn2l-3000.csb.app/api/messages/update-status",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ messageId }),
        }
      );
      startTransition(() => {
        router.refresh();
      });

      return { success: true };
    } catch (error) {
      console.error("Error updating message status:", error);
      return { success: false };
    }
  }

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const messageId = entry.target.id;
            setUnreadMessages((prev) =>
              prev?.filter((item) => item.id !== messageId)
            );
            UpdateMssRead(messageId);
          }
        });
      },
      { threshold: 0.5 }
    );

    // const messageElements = document.querySelectorAll(".message-item");
    const messageElements = Array.from(
      document.querySelectorAll(".message-item")
    ).filter((el) => el.getAttribute("data-status") !== "READ");
    console.log("messageElements", messageElements);
    messageElements.forEach((el) => observer.observe(el));

    return () => {
      messageElements.forEach((el) => observer.unobserve(el));
    };
  }, [UpdateMssRead]);

  useEffect(() => {
    if (data?.pages[0]?.items) {
      const newUnreadCount = data.pages[0].items.filter(
        (message) =>
          message.senderId !== currentUser && message.status !== "READ"
      );
      setUnreadMessages(newUnreadCount);
    }
  }, [data, currentUser]);

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
        chatId={paramValue}
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
