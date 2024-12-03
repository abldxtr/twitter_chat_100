"use client";

import MessageHeader from "./message/m-header";
import UserList, { Account, UserListLoading, userList } from "./message/m-list";
import { User } from "@prisma/client";
import { useMediaQuery } from "usehooks-ts";
import { useGlobalContext } from "@/context/globalContext";
import { Suspense, useEffect, useLayoutEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { Session } from "next-auth";
import { usr } from "@/lib/data";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMessage } from "@/hooks/use-message";
import classNames from "classnames";
import { MessageData } from "@/lib/definitions";
import { CreateChat, CreateChatIcon } from "./create-chat";

export type users = {
  id: string;
  initiator: User;
  participant: User;
  messages: {
    createdAt: Date;
    content: string;
  }[];
}[];

export default function Message_list({
  first,
  current,
}: {
  first: string;
  current: Session | null;
}) {
  const userId = first;
  const queryClient = useQueryClient();

  const { fetchMessages } = useMessage();
  const { mobileMenue, setMobileMenue, setUnreadCountMenue, final, setFinal } =
    useGlobalContext();
  const matches = useMediaQuery("(min-width: 768px)");
  const [change, setChange] = useState(false);
  // console.log("final", final);
  const param = useParams();
  // console.log("parammmmmmmmmmm", typeof param.key);
  const { data, isLoading } = useQuery({
    queryKey: ["userList"],
    queryFn: () => {
      const res = fetchMessages(userId);
      setChange(() => !change);

      return res;
    },

    staleTime: 1000 * 60 * 5,
    retry: 2,
  });

  useEffect(() => {
    if (data) {
      const finalData = data.reduce((acc, chat: usr) => {
        const unreadMessages = chat.messages.filter(
          (message) =>
            message.receiverId === userId && message.status === "SENT"
        );
        const existingChat = final.find(
          (item) => Object.keys(item)[0] === chat.id
        );
        const existingUnreadMessages = existingChat
          ? existingChat[chat.id]
          : [];
        const updatedUnreadMessages = [
          ...existingUnreadMessages,
          ...unreadMessages.filter(
            (newMsg) =>
              !existingUnreadMessages.some(
                (existingMsg) => existingMsg.id === newMsg.id
              )
          ),
        ];
        acc.push({ [chat.id]: updatedUnreadMessages });
        return acc;
      }, [] as { [key: string]: MessageData[] }[]);
      console.log("finalData", finalData);
      setFinal(finalData);
    }
  }, [data, setUnreadCountMenue, change, userId]);

  // useLayoutEffect(() => {
  //   const value = param.
  // }, []);

  useLayoutEffect(() => {
    if (matches) {
      setMobileMenue(true);
    } else if (!matches && mobileMenue && param !== undefined) {
      setMobileMenue(false);
    }
  }, [matches]);

  return (
    <>
      <CreateChat />

      <div
        className={classNames(
          " overflow-y-auto overflow-x-hidden z-[10] bg-[#fcfdfd]  scrl fixed top-0 left-0 h-dvh md:w-[400px] w-full transition-all duration-300  ",
          mobileMenue
            ? " translate-x-0 "
            : " -translate-x-full pointer-events-none   "
        )}
      >
        <section className=" lg:flex  relative  border-x-[1px] border-[#eff3f4] h-full ">
          {/* create chat icon */}
          <CreateChatIcon />
          <div className="flex  w-full flex-col isolate ">
            <div className=" w-full sticky top-0 z-10 bg-[#fcfdfd] ">
              <MessageHeader />
              <Suspense fallback={null}>
                <Account user={current} />
              </Suspense>
            </div>

            <div className=" flex-1 overflow-y-auto relative bg-[#fcfdfd] ">
              {isLoading
                ? [...new Array(6)].map((i, index) => {
                    return <UserListLoading key={index} />;
                  })
                : data?.map((item: usr) => {
                    const otherUser =
                      item.initiator.id === userId
                        ? item.participant
                        : item.initiator;

                    const lastMessage =
                      item.messages[item.messages.length - 1]?.content ??
                      "هنوز گفت و گویی رو شروع نکردید";

                    const date1 = item.initiator.lastSeen;
                    const date2 = item.participant.lastSeen;
                    const date = new Date(date1 > date2 ? date2 : date1);

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
    </>
  );
}

// const updatedUnreadCounts = data.map((item) => ({
//   id: item.id,
//   count: item.unreadCount,
// }));
// console.log("dataaaaaa", data);

// const finalData = data.map((chat: usr) => {
//   const unreadMessages = chat.messages.filter(
//     (message) =>
//       message.receiverId === userId && message.status === "SENT"
//   );
//   const indx = final.findIndex((item) => item.id === chat.id);
//   return { [chat.id]: [...final[chat.id], unreadMessages] };
// });
