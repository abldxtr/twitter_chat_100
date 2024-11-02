"use client";

import { useEmojiState } from "@/context/EmojiContext";
import { useMessage } from "@/context/MessageContext";
// import { useSocket } from "@/provider/socket-provider";
import classNames from "classnames";
import { formatDistanceToNow } from "date-fns";
import { Fragment, useEffect, useRef, useState } from "react";
import { ScrollArea } from "./ui/scroll-area";
import { text, user } from "@/lib/definitions";
import { useChatQuery } from "@/hooks/use-chat-query";
import { useChatSocket } from "@/hooks/use-chat-socket";
import { useChatScroll } from "@/hooks/use-chat-scroll";
import { Loader2, ServerCrash } from "lucide-react";

export default function Messages({
  text,
  first,
  chatId,
}: {
  text: text | undefined;
  first: user | undefined;
  chatId: string | undefined;
}) {
  const { messages, setMessages } = useMessage();
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const chatRef = useRef<HTMLDivElement | null>(null);

  const currentUser = first ? first.id : "";

  const queryKey = `chat:${chatId}`;
  const addKey = `chat:${chatId}:messages`;
  const updateKey = `chat:${chatId}:messages:update`;
  const apiUrl = "/api/messages";
  const paramKey = "chatId";
  const paramValue = chatId ? chatId : "";

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status } =
    useChatQuery({
      queryKey,
      apiUrl,
      paramKey,
      paramValue,
    });
  useChatSocket({ queryKey, addKey, updateKey });
  useChatScroll({
    chatRef,
    bottomRef,
    loadMore: fetchNextPage,
    shouldLoadMore: !isFetchingNextPage && !!hasNextPage,
    count: data?.pages?.[0]?.items?.length ?? 0,
  });

  // useEffect(() => {
  //   console.log("observer");
  //   const observer = new IntersectionObserver(
  //     (entries) => {
  //       if (entries[0]?.isIntersecting && hasNextPage) fetchNextPage();
  //     },
  //     { threshold: 1 }
  //   );

  //   if (bottomRef.current) {
  //     observer.observe(bottomRef.current);
  //   }

  //   return () => observer.disconnect();
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, []);

  // useEffect(() => {
  //   setTimeout(() => {
  //     bottomRef.current?.scrollIntoView({
  //       behavior: "smooth",
  //     });
  //   }, 100);
  // });

  // useEffect(() => {
  //   setTimeout(() => {
  //     bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  //   }, 100);
  // }, []);
  return (
    <div className=" flex-1 overflow-hidden ">
      <div
        className={classNames(
          "w-full  p-2 flex-1 overflow-y-auto flex  flex-col-reverse   h-full scrl   transition-all duration-300   "
        )}
        ref={chatRef}
      >
        <div ref={bottomRef}> bottom</div>

        {data?.pages?.map((group, i) => {
          return (
            <Fragment key={i}>
              {group.items.map((it: any, index: number) => {
                // console.log("other", it.senderId);
                // console.log("me", currentUser);

                const isP = it.senderId === currentUser;
                // console.log("messssssssss", message);
                return (
                  <Fragment key={index}>
                    {isP ? (
                      <div className="  pb-[5px]  p-2  w-full group flex items-center gap-2 justify-end    ">
                        <div className="flex items-center gap-2 max-w-[calc(100%_/_2)]  ">
                          {/* for delete messag */}
                          <div className="  ">
                            <button
                              // onClick={() => deleteMessageById(it.id)}
                              className=" size-[34px] hover:bg-[#1d9bf01a] flex items-center justify-center transition-all duration-300
                     rounded-full opacity-0 group-hover:opacity-100  "
                            >
                              <svg
                                viewBox="0 0 24 24"
                                aria-hidden="true"
                                className="size-[20px] shrink-0 fill-[#6b7f8e]  "
                              >
                                <g>
                                  <path d="M16 6V4.5C16 3.12 14.88 2 13.5 2h-3C9.11 2 8 3.12 8 4.5V6H3v2h1.06l.81 11.21C4.98 20.78 6.28 22 7.86 22h8.27c1.58 0 2.88-1.22 3-2.79L19.93 8H21V6h-5zm-6-1.5c0-.28.22-.5.5-.5h3c.27 0 .5.22.5.5V6h-4V4.5zm7.13 14.57c-.04.52-.47.93-1 .93H7.86c-.53 0-.96-.41-1-.93L6.07 8h11.85l-.79 11.07zM9 17v-6h2v6H9zm4 0v-6h2v6h-2z"></path>
                                </g>
                              </svg>
                            </button>
                          </div>
                          <div className=" flex cursor-pointer flex-col gap-2 bg-[rgb(29,155,240)] rounded-br-sm rounded-2xl py-[12px] px-[16px] text-right text-white leading-[20px] text-[15px] hover:bg-[#1a8cd8] transition-all duration-300    ">
                            {/* {!!it.images?.length && (
                          <img
                            src={it.images[0]}
                            alt={`uploaded-img-${it.images}`}
                            className=" h-auto bg-[#0f1419bf] shrike-0 hover:bg-[#272c30bf] object-cover "
                          />
                        )} */}
                            <span className="text-left">{it.content}</span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="  pb-[5px]  p-2 flex   items-center w-full group gap-2 ">
                        <div className="flex items-center flex-row-reverse gap-2 max-w-[calc(100%_/_2)]  ">
                          {/* for delete messag */}
                          <div className="  ">
                            <button
                              // onClick={() => deleteMessageById(it.id)}
                              className=" size-[34px] hover:bg-[#1d9bf01a] flex items-center justify-center transition-all duration-300
                       rounded-full opacity-0 group-hover:opacity-100  "
                            >
                              <svg
                                viewBox="0 0 24 24"
                                aria-hidden="true"
                                className="size-[20px] shrink-0 fill-[#6b7f8e]  "
                              >
                                <g>
                                  <path d="M16 6V4.5C16 3.12 14.88 2 13.5 2h-3C9.11 2 8 3.12 8 4.5V6H3v2h1.06l.81 11.21C4.98 20.78 6.28 22 7.86 22h8.27c1.58 0 2.88-1.22 3-2.79L19.93 8H21V6h-5zm-6-1.5c0-.28.22-.5.5-.5h3c.27 0 .5.22.5.5V6h-4V4.5zm7.13 14.57c-.04.52-.47.93-1 .93H7.86c-.53 0-.96-.41-1-.93L6.07 8h11.85l-.79 11.07zM9 17v-6h2v6H9zm4 0v-6h2v6h-2z"></path>
                                </g>
                              </svg>
                            </button>
                          </div>
                          <div className=" flex cursor-pointer flex-col text-[#0f1419] bg-[#eff3f4] rounded-bl-sm rounded-2xl py-[12px] px-[16px] text-right leading-[20px] text-[15px] transition-all duration-300    ">
                            {/* {!!it.images?.length && (
                          <img
                            src={it.images[0]}
                            alt={`uploaded-img-${it.images}`}
                            className=" h-auto bg-[#0f1419bf] shrike-0 hover:bg-[#272c30bf] object-cover "
                          />
                        )} */}
                            <span className="text-left">{it.content}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </Fragment>
                );
              })}
            </Fragment>
          );
        })}
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
