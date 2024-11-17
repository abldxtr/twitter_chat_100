"use client";

import MessageHeader from "./message/m-header";
import MessageRequest from "./message/m-request";
import UserList, { Account, userList } from "./message/m-list";
import { user } from "@/lib/definitions";
import { User } from "@prisma/client";
import classNames from "classnames";
import { useMediaQuery } from "usehooks-ts";
import { useGlobalContext } from "@/context/globalContext";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { useSocket } from "@/provider/socket-provider";
import { Session } from "next-auth";
import { usr } from "@/lib/data";

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
  chatlist,
  first,
  current,
}: {
  chatlist: usr[];
  first: string;
  current: Session | null;
}) {
  const { mobileMenue, setMobileMenue } = useGlobalContext();
  const matches = useMediaQuery("(min-width: 768px)");
  const [mounted, setMounted] = useState(false);
  const param = useParams();
  const { isConnected } = useSocket();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (matches && !mobileMenue) {
      setMobileMenue(true);
    } else if (!matches && mobileMenue) {
      setMobileMenue(false);
    }
  }, [matches]);

  const memoizedChatList = useMemo(() => {
    // if (!mounted) return null; // از رندر در سمت سرور جلوگیری می‌کند

    return chatlist?.map((item) => {
      const otherUser =
        item.initiator.id === first ? item.participant : item.initiator;

      // const userPage = item.initiator.id === first ? item.participant.id === first || !!item.participant.id && true   : item.participant.id === first ?

      const lastMessage =
        item.messages[item.messages.length - 1]?.content ??
        "هنوز گفت و گویی رو شروع نکردید";

      // تاریخ‌ها را به صورت ثابت نگه می‌داریم
      const date1 = item.initiator.lastSeen;
      const date2 = item.participant.lastSeen;
      const date = new Date(date1 > date2 ? date2 : date1);

      const unReadMess = item.unreadCount;

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
    });
  }, [chatlist, first, param, mounted]);

  if (!mounted) {
    return null;
  }

  return (
    <div
      className={classNames(
        " overflow-y-auto overflow-x-hidden z-[10] bg-white  scrl fixed top-0 left-0 h-dvh md:w-[400px] w-full transition-all duration-300  ",
        mobileMenue
          ? " translate-x-0 "
          : " -translate-x-full pointer-events-none   "
      )}
    >
      <section className=" lg:flex w-full  relative flex-1 border-x-[1px] border-[#eff3f4]">
        <div className="flex  w-full flex-col isolate ">
          <div className=" w-full sticky top-0 z-10 bg-white ">
            <MessageHeader />
            {/* <MessageRequest /> */}
            <Account user={current} />
          </div>

          <div className=" flex-1 overflow-y-auto relative bg-white ">
            {memoizedChatList}
          </div>
        </div>
      </section>
    </div>
  );
}
