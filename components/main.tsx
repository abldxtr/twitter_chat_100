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

  const [users, chatDb] = await Promise.all([
    fetchChat(userId),
    db.chat.findFirst({
      where: {
        id: param,
      },
      select: {
        initiator: true,
        participant: true,
      },
    }),
  ]);

  const other =
    userId === chatDb?.initiator.id ? chatDb.participant : chatDb?.initiator;
  const currentUser =
    userId === chatDb?.initiator.id ? chatDb.initiator : chatDb?.participant;

  const Me = current.user.id;

  return (
    <div className=" overflow-auto flex flex-1 h-full md:pl-[400px] z-[9]  ">
      <Chat_text
        param={param}
        first={currentUser}
        second={other}
        other={other}
        chat={param}
      />
    </div>
  );
}
