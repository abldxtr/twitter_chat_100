import { auth } from "@/auth";
import Chat_text from "./chat.text";
import db from "@/lib/prisma";
import { redirect } from "next/navigation";
import { api } from "@/convex/_generated/api";
import { preloadQuery } from "convex/nextjs";
import { Id } from "@/convex/_generated/dataModel";
import ChatHeader from "./chat-header";

export default async function Main({ param }: { param: string }) {
  const current = await auth();
  if (!current || !current.user || !current.user.id) {
    redirect("/login");
  }

  const userId = current?.user.id;

  // const chatDb = await db.chat.findFirst({
  //   where: {
  //     id: param,
  //   },
  //   select: {
  //     initiator: true,
  //     participant: true,
  //   },
  // });

  // const other =
  //   userId === chatDb?.initiator.id ? chatDb.participant : chatDb?.initiator;
  // const currentUser =
  //   userId === chatDb?.initiator.id ? chatDb.initiator : chatDb?.participant;

  if (param) {
    const preloadedMessages = await preloadQuery(
      api.message.messages,
      { chatId: param }
      // پاس دادن headers به preloadQuery
    );

    const preloadedChat = await preloadQuery(
      api.chat.getChat,
      { id: param as Id<"chats"> }
      // پاس دادن headers به preloadQuery
    );

    return (
      <div
        className=" overflow-auto flex flex-1 h-full 
      md:pl-[400px] z-[9] w-full relative
      
      "
      >
        {/* <Chat_text
          param={param}
          first={currentUser}
          second={other}
          other={other}
        /> */}

        <Chat_text
          param={param}
          // preloadedMessages={preloadedMessages}
          preloadedChat={preloadedChat}
        />
      </div>
    );
  } else {
    return (
      <div
        className=" overflow-auto flex flex-1 h-full 
      md:pl-[400px] z-[9] w-full relative
      
      "
      >
        {/* <Chat_text
          param={param}
          first={currentUser}
          second={other}
          other={other}
        /> */}
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
            <ChatHeader className=" bg-transparent " />

            <div className="w-full h-full flex flex-col items-center justify-center text-slate-900 font-bold rtlDir ">
              <div className=" mb-[36px] ">
                <img src="/landing.svg" alt="landing" />
              </div>

              <div className=" text-[#091e42] text-[17px] leading-[26px]  ">
                برای شروع یکی از گفتگوها را انتخاب کنید
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }
}
