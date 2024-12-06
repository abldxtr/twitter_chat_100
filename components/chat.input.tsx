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
import { useSocket } from "@/provider/socket-provider";
import { useQueryClient } from "@tanstack/react-query";
import { FileState, useGlobalContext } from "@/context/globalContext";
import DragContainer from "./drag-container";
import { useChatQuery } from "@/hooks/use-chat-query";
import { useEdgeStore } from "@/lib/edgestore";

export default function InputChat({
  param,
  first,
  second,
  other,
  chatId,
}: {
  param: string;
  first: user | undefined;
  second: user | undefined;
  other: user | undefined;
  chatId: string | undefined;
}) {
  const { setOpenEmoji } = useEmojiState();
  const [cursorPosition, setCursorPosition] = useState<number>(0);
  const { imgTemp, setImgTemp, isShowImgTemp, setIsShowImgTemp } =
    useGlobalContext();

  const [inputValue, setInputValue] = useState("");
  const textRef = useRef<HTMLInputElement | null>(null);
  const EmojiRef = useRef(null);
  const { socket } = useSocket();
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

  const currentUser = first ? first.id : "";
  // const { edgestore } = useEdgeStore();

  const { sendMessage } = useChatQuery({
    queryKey,
    apiUrl,
    paramKey,
    paramValue,
    currentUser,
  });

  const handleClickOutside = () => {
    setOpenEmoji(false);
  };

  useOnClickOutside([EmojiRef, textRef], handleClickOutside);

  useEffect(() => {
    if (!socket) return;

    const handleTyping = () => {
      socket.emit("isTyping", { chatId, userId: first?.id });
    };

    const handleStopTyping = () => {
      socket.emit("stopTyping", { chatId, userId: first?.id });
    };

    if (inputValue.trim()) {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      handleTyping();
      typingTimeoutRef.current = setTimeout(handleStopTyping, 3000);
    } else {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      handleStopTyping();
    }

    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [inputValue, socket, chatId, first?.id]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    // console.log("handleSubmit");
    if (imgTemp.length > 0) {
      if (first && other && chatId) {
        const newMessage = {
          content: inputValue.trim(),
          senderId: first.id,
          receiverId: other.id,
          id: chatId,
          createdAt: new Date().toISOString() as unknown as Date,
          updatedAt: new Date().toISOString() as unknown as Date,
          chatId,
          type: "IMAGE" as const,
          status: "SENT" as const,
          opupId: crypto.randomUUID(),
          images: imgTemp,
        };

        console.log("newMessage", newMessage);
        sendMessage(newMessage);

        // }
      }
    } else {
      if (inputValue.trim()) {
        if (first && other && chatId) {
          const newMessage = {
            content: inputValue.trim(),
            senderId: first.id,
            receiverId: other.id,
            id: chatId,
            createdAt: new Date().toISOString() as unknown as Date,
            updatedAt: new Date().toISOString() as unknown as Date,
            chatId,

            type: "TEXT" as const,
            status: "SENT" as const,
            opupId: crypto.randomUUID(),
          };
          sendMessage(newMessage);
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
