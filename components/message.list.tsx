"use client";

// import { useRouter } from "next/navigation";
import MessageHeader from "./message/m-header";
import MessageRequest from "./message/m-request";
import UserList from "./message/m-list";
import { ChatList, user } from "@/lib/definitions";
// import { useParams } from "next/navigation";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Message, User } from "@prisma/client";
import classNames from "classnames";
import { useMediaQuery } from "usehooks-ts";
import { useGlobalContext } from "@/context/globalContext";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";

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
}: {
  chatlist: users;
  first: string;
}) {
  const { mobileMenue, setMobileMenue } = useGlobalContext();
  const matches = useMediaQuery("(min-width: 768px)");
  const currentUser = first;
  const [mounted, setMounted] = useState(false);
  const param = useParams();

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
      const lastMessage =
        item.messages[item.messages.length - 1]?.content ?? "";

      // تاریخ‌ها را به صورت ثابت نگه می‌داریم
      const date1 = item.initiator.lastSeen;
      const date2 = item.participant.lastSeen;
      const date = new Date(date1 > date2 ? date2 : date1);

      const active = item.id === param.conversationId;
      const href = `${item.id}`;
      const img =
        "https://pbs.twimg.com/profile_images/1564361710554734593/jgWXrher_normal.jpg";

      return (
        <UserList
          key={item.id}
          id={item.id}
          img={img}
          name={otherUser.name}
          href={href}
          active={active}
          username={otherUser.username}
          date={date}
          lastMessage={lastMessage}
        />
      );
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
        <div className="flex  w-full flex-col">
          <MessageHeader />
          <MessageRequest />

          <div className=" flex-1 overflow-y-auto ">{memoizedChatList}</div>
        </div>
      </section>
    </div>
  );
}
