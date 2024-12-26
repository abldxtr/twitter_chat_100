"use client";

import MessageHeader from "./message/m-header";
import UserList, { Account, UserListLoading, userList } from "./message/m-list";
import { User } from "@prisma/client";
import { useMediaQuery } from "usehooks-ts";
import { useGlobalContext } from "@/context/globalContext";
import { Suspense, useEffect, useLayoutEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { Session } from "next-auth";
import classNames from "classnames";
import { CreateChat, CreateChatIcon } from "./create-chat";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export type users = {
  id: string;
  initiator: User;
  participant: User;
  messages: {
    createdAt: Date;
    content: string;
  }[];
}[];

export default function Message_list({
  first,
  current,
}: {
  first: string;
  current: Session | null;
}) {
  const userId = first;
  const param = useParams<{ conversationId: string }>();
  const matches = useMediaQuery("(min-width: 768px)");
  const {
    mobileMenue,
    setMobileMenue,

    conversationId,
    setConversationId,
  } = useGlobalContext();

  const chatList = useQuery(api.chat.chatList, { id: userId });

  useLayoutEffect(() => {
    if (matches) {
      setMobileMenue(true);
    } else if (!matches && mobileMenue && param?.conversationId !== undefined) {
      setMobileMenue(false);
    }
  }, [matches, param?.conversationId]);

  useEffect(() => {
    if (param?.conversationId) {
      setConversationId(param?.conversationId);
    }
  }, [param?.conversationId]);

  return (
    <>
      <CreateChat />

      <div
        className={classNames(
          " overflow-y-auto overflow-x-hidden z-[10] bg-[#fcfdfd]  scrl fixed top-0 left-0 h-dvh md:w-[400px] w-full  ",
          mobileMenue
            ? " translate-x-0 transition-all duration-300 "
            : " -translate-x-full pointer-events-none   "
        )}
      >
        <section className=" lg:flex  relative  border-x-[1px] border-[#eff3f4] h-full w-full  ">
          <CreateChatIcon />
          <div className="flex  w-full flex-col isolate ">
            <div className=" w-full sticky top-0 z-10 bg-[#fcfdfd] ">
              <MessageHeader />
              <Suspense fallback={null}>
                <Account user={current} />
              </Suspense>
            </div>

            <div className=" w-full h-full overflow-y-auto relative bg-[#fcfdfd] ">
              {!chatList
                ? [...new Array(6)].map((i, index) => {
                    return <UserListLoading key={index} />;
                  })
                : chatList?.map((item) => {
                    const otherUser =
                      item.initiatorId === userId
                        ? item.participantId
                        : item.initiatorId;

                    const lastMessage = "هنوز گفت و گویی رو شروع نکردید";

                    const date = Date.now();

                    const unReadMess =
                      item.initiatorId === userId
                        ? item.unreadMessagesCountParticipant
                        : item.unreadMessagesCountInitiator;

                    const active = item._id === conversationId ? true : false;
                    const href = `${item._id}`;

                    const userItem: userList = {
                      id: item._id,
                      active,
                      // date,
                      href,
                      // lastMessage,
                      name: otherUser,
                      // username: otherUser.username,
                      // img,
                      unReadMess,
                    };

                    return <UserList key={item._id} user={userItem} />;
                  })}
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
