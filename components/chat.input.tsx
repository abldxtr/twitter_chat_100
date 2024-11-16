"use client";

import { useEmojiState } from "@/context/EmojiContext";
import classNames from "classnames";
import axios from "axios";
import qs from "query-string";

import { useEffect, useState, useRef, FormEvent, useTransition } from "react";
import { useMessage } from "@/context/MessageContext";
import { useOnClickOutside } from "usehooks-ts";
import ImgInput from "./img.input";
import { EmojiPicker } from "./EmojiPicker";
import { InputWithRef } from "./InputWithRef";
import GifInput from "./Gif-input";
import TempImg from "./temp-img";
import { useSession } from "next-auth/react";
import { sendMassage } from "@/lib/actions";
import { text, user } from "@/lib/definitions";
import { useRouter } from "next/navigation";
import { useSocket } from "@/provider/socket-provider";

export default function InputChat({
  param,
  first,
  second,
  other,
  // message,
  chatId,
}: {
  param: string;
  first: user | undefined;
  second: user | undefined;
  other: user | undefined;
  chatId: string | undefined;

  // message: text | undefined;
}) {
  const { openEmoji, setOpenEmoji, open, setOpen } = useEmojiState();
  const [cursorPosition, setCursorPosition] = useState<number>(0);
  const { messages, setMessages, imgtemp, setImgTemp } = useMessage();
  const [inputValue, setInputValue] = useState("");
  const textRef = useRef<HTMLInputElement | null>(null);
  const EmojiRef = useRef(null);
  const user = useSession();
  // const [msg, setMsg] = useState(message);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const { socket } = useSocket();
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleClickOutside = () => {
    setOpenEmoji(false);
  };

  useOnClickOutside([EmojiRef, textRef], handleClickOutside);

  useEffect(() => {
    if (!socket) return;

    const handleTyping = () => {
      // ارسال رویداد isTyping به سرور

      // console.log("sending.....");
      socket.emit("isTyping", { chatId, userId: first?.id });
    };

    const handleStopTyping = () => {
      // console.log("stoping.....");

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
        // console.log("message f", newMessage);
        // const res = sendMassage(newMessage);

        const apiUrl = "/api/socket/messages";
        const query = { chatId: chatId };
        try {
          const url = qs.stringifyUrl({
            url: apiUrl,
            query,
          });

          socket.emit("stopTyping", { chatId, userId: first?.id });
          await axios.post(url, newMessage);

          // form.reset();
          startTransition(() => {
            router.refresh();
          });
        } catch (error) {
          console.log(error);
        }
      }

      setInputValue("");
      setImgTemp([]);
    }
  };

  const handleDeleteTempImg = () => {
    setImgTemp([]);
  };

  useEffect(() => {
    if (cursorPosition !== undefined && textRef.current) {
      // console.log("cursorPosition", cursorPosition);
      textRef.current.selectionEnd = cursorPosition;
    }
  }, [cursorPosition]);

  const handleEmoji = (emoji: any) => {
    setInputValue(inputValue + emoji.native);
    // setOpenEmoji(false);
  };

  return (
    <div
      className={classNames(
        " bg-white  border-t border-[#eff3f4] px-[12px]    py-1 isolate "
      )}
    >
      {/* <!-- input --> */}
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
