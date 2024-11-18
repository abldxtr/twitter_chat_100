"use client";

import MessageHeader from "./message/m-header";
import MessageRequest from "./message/m-request";
import UserList, { Account, UserListLoading, userList } from "./message/m-list";
import { user } from "@/lib/definitions";
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
import { useQuery } from "@tanstack/react-query";
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

// const useMessages = (userId: string) => {
//   const { setUnreadCountMenue, unreadCountMenue } = useGlobalContext();
//   const fetchMessages = async ({ userId }: { userId: string }) => {
//     const url = queryString.stringifyUrl(
//       {
//         url: apiUrl,
//         query: {
//           userId,
//         },
//       },
//       { skipNull: true }
//     );

//     console.log("urllllllllllllll", url);

//     const res = await fetch(url);
//     return res.json() as Promise<usr[]>;
//   };

//   return useQuery({
//     // queryKey: ["messages", userId],
//     queryKey: ["uerList"],

//     queryFn: () => {
//       const res = fetchMessages({ userId });

//       res.then((item) =>
//         item.map((i) =>
//           setUnreadCountMenue([
//             ...unreadCountMenue,
//             { id: i.id, count: i.unreadCount },
//           ])
//         )
//       );

//       return res;
//     }, // تابع درخواست
//     enabled: !!userId, // درخواست فقط زمانی اجرا می‌شود که userId معتبر باشد
//     staleTime: 1000 * 60 * 5, // داده‌ها تا ۵ دقیقه تازه هستند
//     // cacheTime: 1000 * 60 * 10, // داده‌ها تا ۱۰ دقیقه در کش باقی می‌مانند
//     retry: 2, // تلاش مجدد در صورت شکست
//   });
// };

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
  const { mobileMenue, setMobileMenue } = useGlobalContext();
  const matches = useMediaQuery("(min-width: 768px)");
  // const [mounted, setMounted] = useState(false);
  const param = useParams();
  const { isConnected } = useSocket();
  const { data, isLoading } = useQuery({
    queryKey: ["userList", first],
    queryFn: () => fetchMessages(first),
    // enabled: !!first,
    staleTime: 1000 * 60 * 5,
    retry: 2,
  });

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
                  const unReadMess =
                    unreadCounts.find((count) => count.id === item.id)?.count ??
                    0;

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
