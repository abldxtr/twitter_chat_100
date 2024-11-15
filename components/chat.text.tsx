import { user } from "@/lib/definitions";
import ChatHeader from "./chat-header";
import InputChat from "./chat.input";
import Messages from "./message";

export default async function Chat_text({
  param,
  first,
  second,
  other,
  chat,
}: {
  param: string;
  first: user | undefined;
  second: user | undefined;
  other: user | undefined;
  chat: string | undefined;
}) {
  return (
    <section
      className="w-full flex min-w-0 isolate h-dvh realtive
      overflow-hidden max-w-[920px]  border-r-[1px] border-[#eff3f4] border-l-[1px] lg:border-l-0 "
    >
      <div className="  flex-1 h-full w-full flex flex-col ">
        {param ? (
          <>
            <ChatHeader other={other} />

            <Messages
              //  text={message}
              first={first}
              chatId={chat}
            />

            <InputChat
              param={param}
              first={first}
              second={second}
              other={other}
              // message={message}
              chatId={chat}
            />
          </>
        ) : (
          <>
            <ChatHeader />
            <div className="w-full h-full flex items-center justify-center text-slate-900 font-bold rtlDir ">
              باید وارد گفت و گو شوید!
            </div>
          </>
        )}
      </div>
    </section>
  );
}
