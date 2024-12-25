"use client";

import { useEmojiState } from "@/context/EmojiContext";
import axios from "axios";
import qs from "query-string";

import { useEffect, useState, useRef, FormEvent, useMemo } from "react";
import { useOnClickOutside } from "usehooks-ts";
import ImgInput from "./img.input";
import { EmojiPicker } from "./EmojiPicker";
import { InputWithRef } from "./InputWithRef";
import GifInput from "./Gif-input";
import TempImg from "./temp-img";
import { user } from "@/lib/definitions";
// import { useSocket } from "@/provider/socket-provider";
import { useQueryClient } from "@tanstack/react-query";
import { FileState, useGlobalContext } from "@/context/globalContext";
import DragContainer from "./drag-container";
import { useChatQuery } from "@/hooks/use-chat-query";
import { useEdgeStore } from "@/lib/edgestore";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useSession } from "next-auth/react";

export default function InputChat({
  param,
  chatId,
  other,
}: {
  param: string;
  chatId: string | undefined;
  other: string;
}) {
  const { setOpenEmoji } = useEmojiState();
  const [cursorPosition, setCursorPosition] = useState<number>(0);
  const { imgTemp, setImgTemp, isShowImgTemp, setIsShowImgTemp } =
    useGlobalContext();

  const usr = useSession();
  const currentUser = usr.data?.user.id ? usr.data?.user.id : "";

  const [inputValue, setInputValue] = useState("");
  const textRef = useRef<HTMLInputElement | null>(null);
  const EmojiRef = useRef(null);
  // const { socket } = useSocket();
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const queryClient = useQueryClient();
  const apiUrl = "/api/messages";
  const paramKey = "chatId";
  // const paramValue = "cm2ylbaaj000emhh56mhgvrg9";
  const paramValue = chatId ? chatId : param;

  const typeKey = "typing";
  const stoptypekey = "stoptype";
  // const queryKey = `chat:cm2ylbaaj000emhh56mhgvrg9`;
  let queryKey = useMemo(() => `chat:${paramValue}`, [paramValue]);

  // const currentUser = first ? first.id : "";
  // const { edgestore } = useEdgeStore();
  // const createMessage = useMutation(api.message.createMessage);
  const createMessage = useMutation(
    api.message.createMessage
  ).withOptimisticUpdate((localStore, args) => {
    const { content, chatId, images, opupId, recieverId, senderId } = args;
    const currentValue = localStore.getQuery(api.message.messages, {
      chatId,
    });
    console.log({ currentValue });

    if (currentValue !== undefined) {
      const now = Date.now() as number;
      const id = crypto.randomUUID() as Id<"messages">;
      // افزودن پیام جدید به لیست فعلی
      localStore.setQuery(
        api.message.messages,
        {
          chatId,
        },
        [
          ...currentValue,
          {
            content,
            chatId,
            image: [],
            opupId: "123",
            receiverId: recieverId,
            senderId,
            status: "DELIVERED",
            type: "TEXT",
            _creationTime: now,
            _id: id,
          },
          // پیام موقت
        ]
      );
    }
  });

  const handleClickOutside = () => {
    setOpenEmoji(false);
  };

  useOnClickOutside([EmojiRef, textRef], handleClickOutside);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    // console.log("handleSubmit");
    if (imgTemp.length > 0) {
      if (currentUser && other && chatId) {
        const newMessage = {
          content: inputValue.trim(),
          senderId: currentUser,
          receiverId: other,
          id: chatId,
          createdAt: new Date().toISOString() as unknown as Date,
          updatedAt: new Date().toISOString() as unknown as Date,
          chatId,
          type: "IMAGE" as const,
          status: "SENT" as const,
          opupId: crypto.randomUUID(),
          images: imgTemp,
        };

        // }
      }
    } else {
      if (inputValue.trim()) {
        if (currentUser && other && chatId) {
          const newMessage = {
            content: inputValue.trim(),
            senderId: currentUser,
            receiverId: other,
            id: chatId,
            createdAt: new Date().toISOString() as unknown as Date,
            updatedAt: new Date().toISOString() as unknown as Date,
            chatId,

            type: "TEXT" as const,
            status: "SENT" as const,
            opupId: crypto.randomUUID(),
          };

          const newMessage1 = {
            content: inputValue.trim(),
            senderId: currentUser,
            recieverId: other,
            chatId: chatId as Id<"chats">,
            opupId: crypto.randomUUID(),
            images: [""],
          };

          console.log("newMessage", newMessage1);
          // sendMessage(newMessage);
          createMessage(newMessage1);
          // sendMessage(newMessage);
        }
      }
    }

    setInputValue("");
    setIsShowImgTemp(false);
  };

  const handleEmoji = (emoji: any) => {
    setInputValue(inputValue + emoji.native);
  };

  return (
    <DragContainer className=" bg-[#fcfdfd] border-t border-[#eff3f4] px-[12px]    py-1 isolate ">
      {/* <div
        className={classNames(
          " bg-[#fcfdfd] border-t border-[#eff3f4] px-[12px]    py-1 isolate "
        )}
      > */}
      <div className="  flex flex-col w-full h-full bg-[#eff3f4] rounded-[16px] ">
        {isShowImgTemp && <TempImg />}
        <div className=" my-[4px] mx-[12px] p-[4px] flex items-center justify-between bg-[#eff3f4] rounded-[16px] gap-1    ">
          <div className=" flex items-center  ">
            <ImgInput
              value={imgTemp}
              dropzoneOptions={{
                maxFiles: 6,
                maxSize: 1024 * 1024 * 3, // 3 MB
              }}
              onChange={setImgTemp}
              onFilesAdded={async (addedFiles) => {
                setImgTemp((prev) => [...(prev || []), ...addedFiles]);
              }}
            />
            <GifInput />
            <EmojiPicker ref={EmojiRef} handleEmoji={handleEmoji} />
          </div>
          <InputWithRef
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onSubmit={handleSubmit}
            ref={textRef}
          />
        </div>
      </div>
      {/* </div> */}
    </DragContainer>
  );
}
