import Header from "@/components/header";
import Main from "@/components/main";
import Image from "next/image";
import { faker } from "@faker-js/faker";
import db from "@/lib/prisma";
import {
  convexAuthNextjsToken,
  isAuthenticatedNextjs,
} from "@convex-dev/auth/nextjs/server";
import { redirect } from "next/navigation";
import Message_list from "@/components/message.list";
import { fetchQuery, preloadQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";

export default async function Home() {
  const isAuth = await isAuthenticatedNextjs();
  if (!isAuth) {
    redirect("/register");
  }
  const token = await convexAuthNextjsToken();
  const user = await fetchQuery(api.user.getUser, {}, { token });
  // const chatList = await fetchQuery(
  //   api.chat.chatList,
  //   { id: user?._id! },
  //   { token }
  // );

  const preloadedChatList = await preloadQuery(
    api.chat.chatList,
    // { id: user?._id!, chatId: param as Id<"chats"> }
    { id: user?._id }

    // { token }
    // پاس دادن headers به preloadQuery
  );

  // const user = await fetchQuery(api.user.getUser, {}, { token });

  // console.log({ chatList });

  return (
    <>
      <Message_list
        user={user}
        // chatlist={chatList}
        preloadedChatList={preloadedChatList}
      />
      <div className="w-full isolate mx-auto flex h-dvh  overflow-hidden">
        <Main param="" />
      </div>
    </>
  );
}
