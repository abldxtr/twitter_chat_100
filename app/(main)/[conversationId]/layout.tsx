import { auth } from "@/auth";
// import Chat_text from "./chat.text";
// import Message_list from "./message.list";
import db from "@/lib/prisma";
import { redirect } from "next/navigation";
import { fetchChat } from "@/lib/data";
import Message_list from "@/components/message.list";
import Chat_text from "@/components/chat.text";

export default async function Layout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { param: string };
}) {
  const current = await auth();
  if (!current || !current.user || !current.user.id) {
    redirect("/login");
  }

  const userId = current.user.id;
  const param = params.param;

  const [users] = await Promise.all([fetchChat(userId)]);

  // const other =
  //   userId === chatDb?.initiator.id ? chatDb.participant : chatDb?.initiator;
  // const currentUser =
  //   userId === chatDb?.initiator.id ? chatDb.initiator : chatDb?.participant;

  return (
    <div className="w-full max-w-[2400px] isolate mx-auto flex h-dvh  overflow-hidden">
      <div className=" overflow-auto  h-full scrl flex w-full  ">
        <main className="flex h-full items-start w-full ">
          <div className="flex shrink grow flex-1 items-start min-w-full isolate ">
            {/* <!-- messages list --> */}
            <Message_list param={param} chatlist={users} first={userId} />

            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
