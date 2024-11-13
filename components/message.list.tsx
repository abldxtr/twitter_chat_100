// "use client";

// import { useRouter } from "next/navigation";
import MessageHeader from "./message/m-header";
import MessageRequest from "./message/m-request";
import UserList from "./message/m-list";
import { ChatList, user } from "@/lib/definitions";
// import { useParams } from "next/navigation";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Message, User } from "@prisma/client";

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
  const currentUser = first;

  return (
    <section className=" max-w-[400px] lg:flex hidden  relative flex-1 border-x-[1px] border-[#eff3f4]">
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
  );
}
