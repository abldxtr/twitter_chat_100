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

  const users = await fetchChat();
  if (users) {
    // console.log("users", users[0]);
  }

  if (!current || !current.user || !current.user.id) {
    redirect("/login");
  }

  const res = await getOrCreateConversation(current?.user?.id, param);

  const first = res?.initiator;
  const second = res?.participant;
  const message = res?.messages;
  const chat = res?.id;

  const other = current.user.id === first?.id ? second : first;
  const currentUser = current.user.id === first?.id ? first : second;
  const Me = current.user.id;
  // console.log("other", other);

  return (
    <main className="flex h-full items-start w-full ">
      <div className="flex shrink grow flex-1 items-start min-w-full">
        {/* <!-- messages list --> */}
        <div className=" overflow-y-auto overflow-x-hidden flex  h-screen scrl">
          <Message_list param={param} chatlist={users} first={Me} />
        </div>

        {/* <!-- message input --> */}
        <div className=" overflow-auto flex flex-1 h-full ">
          <Chat_text
            param={param}
            first={currentUser}
            second={second}
            other={other}
            message={message}
            chat={chat}
          />
        </div>
      </div>
    </main>
  );
}
