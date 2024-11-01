"use client";

import classNames from "classnames";
import { useState } from "react";
import InputChat from "./chat.input";
import Messages from "./message";
import { useEmojiState } from "@/context/EmojiContext";
import Picker from "emoji-picker-react";

export default function ChatBox() {
  // const [open, setOpen] = useState(false);
  const { open, setOpen } = useEmojiState();
  return (
    <div
      className={classNames(
        // " fixed bottom-0 right-6 isolate overflow-hidden  max-w-[400px] min-w-[350px] ",
        " bg-[#00000000] [box-shadow:rgb(101_119_134_/_20%)_0px_0px_15px,_rgb(101_119_134_/_15%)_0px_0px_3px_1px] ",
        "rounded-tl-[16px]   rounded-tr-[16px] transition-all duration-300 ",
        open ? "h-[453px]" : "h-[53px] ",
      )}
    >
      <div
        className={classNames(
          "  relative  w-full cursor-pointer z-100 isolate    ",
          open ? "h-full" : " h-auto ",
        )}
      >
        {/* <!-- header  --> */}
        <div
          className={classNames(
            "  sticky top-0 flex items-start pt-3 justify-between px-[16px] bg-white h-[53px] sm:w-[400px] w-[350px] ",
            open ? "" : "",
          )}
          onClick={() => setOpen(!open)}
        >
          <div className=" text-[20px] text-[#0F1419] font-semibold  ">
            Messages
          </div>
          <div className="   flex items-center   ">
            <div className="size-[34px] transition-all  hover:bg-[#0f14191a] rounded-full p-1 flex items-center justify-center">
              <svg
                viewBox="0 0 24 24"
                aria-hidden="true"
                className="size-[20px] shrink-0  "
              >
                <g>
                  <path d="M1.998 5.5c0-1.381 1.119-2.5 2.5-2.5h15c1.381 0 2.5 1.119 2.5 2.5V12h-2v-1.537l-8 3.635-8-3.635V18.5c0 .276.224.5.5.5H13v2H4.498c-1.381 0-2.5-1.119-2.5-2.5v-13zm2 2.766l8 3.635 8-3.635V5.5c0-.276-.224-.5-.5-.5h-15c-.276 0-.5.224-.5.5v2.766zM19 18v-3h2v3h3v2h-3v3h-2v-3h-3v-2h3z"></path>
                </g>
              </svg>
            </div>
            <div
              className={classNames(
                "size-[34px] transition-all hover:bg-[#0f14191a] rounded-full p-1 flex items-center justify-center ",

                open ? " rotate-180 " : "rotate-0",
              )}
            >
              <svg
                viewBox="0 0 24 24"
                aria-hidden="true"
                className="size-[20px]"
              >
                <g>
                  <path d="M12 2.59l9.46 9.45-1.42 1.42L12 5.41l-8.04 8.05-1.42-1.42L12 2.59zm0 7l9.46 9.45-1.42 1.42L12 12.41l-8.04 8.05-1.42-1.42L12 9.59z"></path>
                </g>
              </svg>
            </div>
          </div>
        </div>

        {/* <!-- main chat --> */}

        <Messages />

        {/* <!-- input text --> */}
        <InputChat />
      </div>
    </div>
  );
}
