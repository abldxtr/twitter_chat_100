"use client";

import MessageHeader from "./message/m-header";
import MessageRequest from "./message/m-request";
import UserList, { Account, UserListLoading, userList } from "./message/m-list";
import { MessageData, user } from "@/lib/definitions";
import { User } from "@prisma/client";
import classNames from "classnames";
import { useMediaQuery } from "usehooks-ts";
import { useGlobalContext } from "@/context/globalContext";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { useSocket } from "@/provider/socket-provider";
import { Session } from "next-auth";
import { usr } from "@/lib/data";
import queryString from "query-string";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMessage } from "@/hooks/use-message";
// import useMessages from "@/hooks/use-message";

export type users = {
  id: string;
  initiator: User;
  participant: User;
  messages: {
    createdAt: Date;
    content: string;
  }[];
}[];

const apiUrl = "/api/user";

export default function Message_list({
  // chatlist,
  first,
  current,
}: {
  // chatlist: usr[];
  first: string;
  current: Session | null;
}) {
  const userId = first;
  // const { data, isLoading, unreadCounts, updateUnreadCount } =
  //   useMessages(userId);
  const { unreadCounts, updateUnreadCount, fetchMessages } = useMessage();
  const {
    mobileMenue,
    setMobileMenue,
    setUnreadCountMenue,
    unreadCountMenue,
    final,
    setFinal,
    unreadMessages,
  } = useGlobalContext();
  const matches = useMediaQuery("(min-width: 768px)");
  // const [mounted, setMounted] = useState(false);
  console.log("final", final);
  const param = useParams();
  const { isConnected } = useSocket();
  const { data, isLoading } = useQuery({
    queryKey: ["userList"],
    queryFn: () => {
      const res = fetchMessages(first);

      // res.then((item) => {

      //   // item.map((i) =>
      //   //   setUnreadCountMenue([
      //   //     ...unreadCountMenue,
      //   //     { id: i.id, count: i.unreadCount },
      //   //   ])
      //   // );
      //   // const finalData = item.reduce((acc, chat) => {
      //   //   const unreadMessages = chat.messages.filter(
      //   //     (message) => message.senderId !== first && message.status !== "READ"
      //   //   );
      //   //   if (unreadMessages.length > 0) {
      //   //     acc.push({ [chat.id]: unreadMessages });
      //   //   }
      //   //   return acc;
      //   // }, [] as { [key: string]: MessageData[] }[]);
      //   // setFinal(finalData);
      // });
      return res;
    },

    // enabled: !!first,
    staleTime: 1000 * 60 * 5,
    retry: 2,
  });

  const queryClient = useQueryClient();

  useEffect(() => {
    if (data) {
      const updatedUnreadCounts = data.map((item) => ({
        id: item.id,
        count: item.unreadCount,
      }));

      const finalData = data.map((chat: usr) => {
        const unreadMessages = chat.messages.filter(
          (message) => message.receiverId === first && message.status === "SENT"
        );
        return { [chat.id]: unreadMessages };
      });

      setFinal(finalData);
      // console.log("updatedUnreadCounts", updatedUnreadCounts);
      // به‌روزرسانی داده‌ها به صورت دستی
      // queryClient.setQueryData(["unreadCounts"], updatedUnreadCounts);

      // یا به‌صورت مستقیم به‌روزرسانی کانتکس
      // setUnreadCountMenue(updatedUnreadCounts);
    }
  }, [data, setUnreadCountMenue]);

  useEffect(() => {
    if (matches && !mobileMenue) {
      setMobileMenue(true);
    } else if (!matches && mobileMenue) {
      setMobileMenue(false);
    }
  }, [matches]);

  return (
    <div
      className={classNames(
        " overflow-y-auto overflow-x-hidden z-[10] bg-[#fcfdfd]  scrl fixed top-0 left-0 h-dvh md:w-[400px] w-full transition-all duration-300  ",
        mobileMenue
          ? " translate-x-0 "
          : " -translate-x-full pointer-events-none   "
      )}
    >
      <section className=" lg:flex w-full  relative flex-1 border-x-[1px] border-[#eff3f4]">
        <div className="flex  w-full flex-col isolate ">
          <div className=" w-full sticky top-0 z-10 bg-[#fcfdfd] ">
            <MessageHeader />
            {/* <MessageRequest /> */}
            <Suspense fallback={null}>
              <Account user={current} />
            </Suspense>
          </div>

          <div className=" flex-1 overflow-y-auto relative bg-[#fcfdfd] ">
            {isLoading
              ? [...new Array(6)].map((i) => {
                  return <UserListLoading key={i} />;
                })
              : data?.map((item: usr) => {
                  const otherUser =
                    item.initiator.id === first
                      ? item.participant
                      : item.initiator;

                  const lastMessage =
                    item.messages[item.messages.length - 1]?.content ??
                    "هنوز گفت و گویی رو شروع نکردید";

                  const date1 = item.initiator.lastSeen;
                  const date2 = item.participant.lastSeen;
                  const date = new Date(date1 > date2 ? date2 : date1);

                  // const unReadMess = item.unreadCount;
                  // const unReadMess =
                  //   unreadCountMenue.find((count) => count.id === item.id)
                  //     ?.count ?? 0;
                  // const a = unreadMessages.filter((i) => i.chatId === item.id);
                  // const b = a.filter((i) => i.receiverId === first);
                  // const unReadMess = b.length;

                  const unReadMess =
                    final.find((obj) => Object.keys(obj)[0] === item.id)?.[
                      item.id
                    ]?.length ?? 0;

                  const active = param && item.id === param.conversationId;
                  const href = `${item.id}`;
                  const img =
                    "https://pbs.twimg.com/profile_images/1564361710554734593/jgWXrher_normal.jpg";

                  const userItem: userList = {
                    id: item.id,
                    active,
                    date,
                    href,
                    lastMessage,
                    name: otherUser.name,
                    username: otherUser.username,
                    img,
                    unReadMess,
                  };

                  return <UserList key={item.id} user={userItem} />;
                })}
          </div>
        </div>
      </section>
    </div>
  );
}
