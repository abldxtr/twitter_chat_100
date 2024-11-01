import { auth } from "@/auth";
import Chat_text from "./chat.text";
import Message_list from "./message.list";
import db from "@/lib/prisma";
import { createChat } from "@/lib/actions";
import { getOrCreateConversation } from "@/lib/chat";
import { redirect } from "next/navigation";

export default async function Main({ param }: { param: string }) {
  const current = await auth();

  // const chatlist = await db.chat.findMany({
  //   where: {
  //     OR: [{ initiatorId: user?.user.id }, { participantId: user?.user.id }],
  //   },
  //   include: {`
  //     initiator: true,
  //     participant: true,
  //     messages: true,
  //   },
  // });

  const users = await db.user.findMany({});
  // const usr = await db.user.findFirst({
  //   where: {
  //     id: param,
  //   },
  // });
  if (!current || !current.user || !current.user.id) {
    redirect("/login");
  }
  // if (!usr) {
  // redirect("/");
  // }
  const res = await getOrCreateConversation(current?.user?.id, param);

  const first = res?.initiator;
  const second = res?.participant;
  const message = res?.messages;
  const chat = res?.id;

  const other = current.user.id === first?.id ? second : first;

  return (
    <main className="flex h-full items-start w-full ">
      <div className="flex shrink grow flex-1 items-start min-w-full">
        {/* <!-- messages list --> */}
        <div className=" overflow-y-auto overflow-x-hidden flex  h-screen scrl">
          <Message_list param={param} chatlist={users} first={first} />
        </div>

        {/* <!-- message input --> */}
        <div className=" overflow-auto flex flex-1 h-full ">
          <Chat_text
            param={param}
            first={first}
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

// const chat = await db.chat.findFirst({
//   where: {
//     OR: [{ initiatorId: user?.user.id }, { participantId: user?.user.id }],
//   },
// });
// if (chat) {
// }

// const chat = users.map((item, _) => {
//   const senderId = user?.user.id;
//   const receiverId = item.id;
//   if (!senderId) {
//     return;
//   }

//   const res = createChat({ senderId, receiverId });
//   return res;
// });

// if (!chatlist) {
//   // lll
//   return null;
// }
