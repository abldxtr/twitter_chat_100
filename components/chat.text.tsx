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
      overflow-hidden max-w-[920px]  border-r-[1px] border-[#eff3f4] border-l-[1px] lg:border-l-0 
      bg-[rgb(223,_225,_230)] 
      

      "
    >
      <div
        className="  flex-1 h-full w-full flex flex-col relative
      
    before:absolute before:inset-0 before:bg-[url('/new-pattern-6.png')] before:opacity-5 before:[background-size:_300px]
      
      "
      >
        {param ? (
          <>
            <ChatHeader other={other} />

            <Messages
              //  text={message}
              first={first}
              chatId={chat}
              other={other}
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
            <ChatHeader className=" bg-transparent " />
            <div className="w-full h-full flex flex-col items-center justify-center text-slate-900 font-bold rtlDir ">
              <div className=" mb-[36px] ">
                <img src="/landing.svg" alt="landing" />
              </div>
              <div className=" text-[#091e42] text-[17px] leading-[26px]  ">
                برای شروع یکی از گفتگوها را انتخاب کنید{" "}
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
