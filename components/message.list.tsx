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
import { useEffect } from "react";

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
  param,
  chatlist,
  first,
}: // lastMessage,
{
  param: string;
  chatlist: users;
  first: string;
  // lastMessage: Message | undefined;
}) {
  // const currentUser = first ? first.id : "";
  const { mobileMenue, setMobileMenue } = useGlobalContext();
  const matches = useMediaQuery("(min-width: 768px)");
  const currentUser = first;

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

          <ScrollArea className=" flex-1  ">
            {chatlist?.map((item, index: number) => {
              // console.log(item);
              // if (item.initiator.id === currentUser || item.participant.id === currentUser) {
              //   return;
              // }

              const otherUser =
                item.initiator.id === currentUser
                  ? item.participant
                  : item.initiator;
              // const date1 = item.initiator.lastSeen;
              // const date2 = item.participant.lastSeen;
              const lastMessage = item.messages.pop()?.content ?? "";
              const date1 = new Date(item.initiator.lastSeen);
              const date2 = new Date(item.participant.lastSeen);
              const date = date1 > date2 ? date2 : date1;
              const active = item.id === param;
              const href = `/${item.id}`;

              const img =
                "https://pbs.twimg.com/profile_images/1564361710554734593/jgWXrher_normal.jpg";

              return (
                <UserList
                  id={item.id}
                  img={img}
                  name={otherUser.name}
                  href={href}
                  key={index}
                  active={active}
                  username={otherUser.username}
                  date={date}
                  lastMessage={lastMessage}
                  // date1={date1}
                  // date2={date2}
                />
              );
            })}
          </ScrollArea>
        </div>
      </section>
    </div>
  );
}
