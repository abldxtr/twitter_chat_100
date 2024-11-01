"use client";

import { useEmojiState } from "@/context/EmojiContext";
import classNames from "classnames";
import axios from "axios";

import { useEffect, useState, useRef, FormEvent } from "react";
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

export default function InputChat({
  param,
  first,
  second,
  other,
  message,
  chatId,
}: {
  param: string;
  first: user | undefined;
  second: user | undefined;
  other: user | undefined;
  chatId: string | undefined;

  message: text | undefined;
}) {
  const { openEmoji, setOpenEmoji, open, setOpen } = useEmojiState();
  const [cursorPosition, setCursorPosition] = useState<number>(0);
  const { messages, setMessages, imgtemp, setImgTemp } = useMessage();
  const [inputValue, setInputValue] = useState("");
  const textRef = useRef<HTMLInputElement | null>(null);
  const EmojiRef = useRef(null);
  const user = useSession();
  const [msg, setMsg] = useState(message);

  const handleClickOutside = () => {
    setOpenEmoji(false);
  };

  useOnClickOutside([EmojiRef, textRef], handleClickOutside);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    console.log("inputValue", JSON.stringify(inputValue));
    // const res = axios.post("/api/socket/messages", { text: inputValue });
    // setInputValue("");
    if (inputValue.trim()) {
      const newMessage = {
        // images: imgtemp.length > 0 ? imgtemp : [],
        text: inputValue.trim(),
        senderId: first?.id ? first.id : "",
        receiverId: other?.id ? other.id : "",
        id: chatId ? chatId : "",
      };
      const res = sendMassage(newMessage);

      // const senderId = user.data?.user.id;
      // const receiverId =
      // const text = inputValue;
      // const id =

      // setMessages((prevMessages) => [...prevMessages, res]);

      // sendMassage({});
      setInputValue("");
      setImgTemp([]);
    }

    // if (imgtemp.length) {
    //   const newMessage = {
    //     id: Date.now(),
    //     text: "",
    //     timestamp: new Date(),
    //     images: imgtemp.length > 0 ? imgtemp : [],
    //   };

    //   setMessages((prevMessages) => [...prevMessages, newMessage]);
    //   setInputValue("");
    //   setImgTemp([]);
    // }

    // console.log("res", res);
    // setMessages((prevMessages) => [...prevMessages, res]);
  };
  // console.log("inputValue", inputValue);

  const handleDeleteTempImg = () => {
    setImgTemp([]);
  };

  useEffect(() => {
    if (cursorPosition !== undefined && textRef.current) {
      console.log("cursorPosition", cursorPosition);
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
