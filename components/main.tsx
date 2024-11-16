import { auth } from "@/auth";
import Chat_text from "./chat.text";
import db from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function Main({ param }: { param: string }) {
  const current = await auth();
  if (!current || !current.user || !current.user.id) {
    redirect("/login");
  }

  const userId = current?.user.id;

  const chatDb = await db.chat.findFirst({
    where: {
      id: param,
    },
    select: {
      initiator: true,
      participant: true,
    },
  });

  const other =
    userId === chatDb?.initiator.id ? chatDb.participant : chatDb?.initiator;
  const currentUser =
    userId === chatDb?.initiator.id ? chatDb.initiator : chatDb?.participant;

  return (
    <div className=" overflow-auto flex flex-1 h-full md:pl-[400px] z-[9] w-full ">
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
