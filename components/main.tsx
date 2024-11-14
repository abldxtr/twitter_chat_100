import { auth } from "@/auth";
import Chat_text from "./chat.text";
import Message_list from "./message.list";
import db from "@/lib/prisma";
import { createChat } from "@/lib/actions";
import { getOrCreateConversation } from "@/lib/chat";
import { redirect } from "next/navigation";
import { fetchChat } from "@/lib/data";

export default async function Main({ param }: { param: string }) {
  const current = await auth();
  if (!current || !current.user || !current.user.id) {
    redirect("/login");
  }

  const userId = current?.user.id;
  const users = await fetchChat(userId);
  // if (!users) {
  // console.log("users", users[0]);
  // }

  const chatDb = await db.chat.findFirst({
    where: {
      id: param,
    },
    select: {
      initiator: true,
      participant: true,
    },
  });

  const res = await getOrCreateConversation(current?.user?.id, param);

  const userDb = await db.user.findFirst({
    where: {
      id: userId,
    },
  });

  // const chatMain = await db.chat.findFirst({
  //   where: {
  //     id: param,
  //   },
  //   select: {
  //     messages: true,
  //   },
  // });

  const first = res?.initiator;
  const second = res?.participant;
  // const message = res?.messages;
  // const message = chatMain;
  // const chat = res?.id;
  const chat = users.pop()?.id;

  // const lastMessage =

  // const other = current.user.id === first?.id ? second : first;
  const other =
    userId === chatDb?.initiator.id ? chatDb.participant : chatDb?.initiator;

  // const currentUser = current.user.id === first?.id ? first : second;
  // const currentUser = current.user.id === chatMain?.messages[0] ? first : second;

  const Me = current.user.id;
  // console.log("other", other);

  return (
    <main className="flex h-full items-start w-full ">
      <div className="flex shrink grow flex-1 items-start min-w-full isolate ">
        {/* <!-- messages list --> */}
        <Message_list
          param={param}
          chatlist={users}
          first={Me}
          // lastMessage={lastMessage}
        />

        {/* <!-- message input --> */}
        <div className=" overflow-auto flex flex-1 h-full md:pl-[400px] z-[9]  ">
          <Chat_text
            param={param}
            first={userDb!}
            second={second}
            other={other}
            // message={message}
            // chat={chat}
            chat={param}
          />
        </div>
      </div>
    </main>
  );
}
