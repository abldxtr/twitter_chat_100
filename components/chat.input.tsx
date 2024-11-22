"use client";

import { useEmojiState } from "@/context/EmojiContext";
import classNames from "classnames";
import axios from "axios";
import qs from "query-string";

import { useEffect, useState, useRef, FormEvent } from "react";
import { useOnClickOutside } from "usehooks-ts";
import ImgInput from "./img.input";
import { EmojiPicker } from "./EmojiPicker";
import { InputWithRef } from "./InputWithRef";
import GifInput from "./Gif-input";
import TempImg from "./temp-img";
import { user } from "@/lib/definitions";
import { useSocket } from "@/provider/socket-provider";
import { useQueryClient } from "@tanstack/react-query";
import { useGlobalContext } from "@/context/globalContext";

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
  const { setImgTemp } = useGlobalContext();
  const [inputValue, setInputValue] = useState("");
  const textRef = useRef<HTMLInputElement | null>(null);
  const EmojiRef = useRef(null);
  const { socket } = useSocket();
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const queryClient = useQueryClient();

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

    if (inputValue.trim()) {
      if (first && other && chatId) {
        const newMessage = {
          content: inputValue.trim(),
          senderId: first.id,
          reeciverId: other.id,
          id: chatId,
        };

        const apiUrl = "/api/socket/messages";
        const query = { chatId: chatId };
        try {
          const url = qs.stringifyUrl({
            url: apiUrl,
            query,
          });

          socket.emit("stopTyping", { chatId, userId: first?.id });
          await axios.post(url, newMessage);
          queryClient.invalidateQueries({
            queryKey: ["userList"],
          });
        } catch (error) {
          console.log(error);
        }
      }

      setInputValue("");
      setImgTemp([]);
    }
  };

  useEffect(() => {
    if (cursorPosition !== undefined && textRef.current) {
      textRef.current.selectionEnd = cursorPosition;
    }
  }, [cursorPosition]);

  const handleEmoji = (emoji: any) => {
    setInputValue(inputValue + emoji.native);
  };

  return (
    <div
      className={classNames(
        " bg-[#fcfdfd] border-t border-[#eff3f4] px-[12px]    py-1 isolate "
      )}
    >
      <div className="  flex flex-col w-full h-full bg-[#eff3f4] rounded-[16px] ">
        <TempImg />
        <div className=" my-[4px] mx-[12px] p-[4px] flex items-center justify-between bg-[#eff3f4] rounded-[16px] gap-1    ">
          <div className=" flex items-center  ">
            <ImgInput />
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
    </div>
  );
}
