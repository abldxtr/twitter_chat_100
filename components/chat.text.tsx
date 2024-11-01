import { ChatList, text, user } from "@/lib/definitions";
import ChatHeader from "./chat-header";
import ChatBox from "./chat.box";
import InputChat from "./chat.input";
import Messages from "./message";
import db from "@/lib/prisma";

export default async function Chat_text({
  param,
  first,
  second,
  other,
  message,
  chat,
}: {
  param: string;
  first: user | undefined;
  second: user | undefined;
  other: user | undefined;
  chat: string | undefined;

  message: text | undefined;
}) {
  // const messages = await db.message.findMany({
  //   where: {
  //     chatId: param,
  //   },
  // });

  // const
  // const header = await db.chat.findFirst({
  //   where: {},
  // });

  return (
    <section className="w-full flex min-w-0 isolate h-screen realtive  overflow-hidden max-w-[920px]  border-r-[1px] border-[#eff3f4] border-l-[1px] lg:border-l-0 ">
      <div className="  flex-1 h-full w-full flex flex-col ">
        {param ? (
          <>
            <ChatHeader other={other} />

            <Messages text={message} first={first} />

            <InputChat
              param={param}
              first={first}
              second={second}
              other={other}
              message={message}
              chatId={chat}
            />
          </>
        ) : (
          <div>باید وارد گفت و گو شوید!</div>
        )}
      </div>
    </section>
  );
}
