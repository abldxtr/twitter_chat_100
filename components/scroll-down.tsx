// import { updateMessageReadStatusAll } from "@/lib/actions";
import { FileState, useGlobalContext } from "@/context/globalContext";
import { MessageData } from "@/lib/definitions";
import { cn, formatPersianDate } from "@/lib/utils";
import { useQueryClient } from "@tanstack/react-query";
import classNames from "classnames";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2 } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Fragment, useMemo, useOptimistic, useTransition } from "react";
import { CircleProgress } from "./circle-progress";

export type items = {
  goDown: boolean;
  func: () => void;
  unreadCount: number;
  chatId: string;
  queryKey: string;
};

export type mess = {
  // message: MessageData;
  message: any;

  direction: "rtl" | "ltr";
  show?: boolean;
};

export function ScrollDown({
  goDown,
  func,
  unreadCount,
  chatId,
  queryKey,
}: items) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const { setUnreadCount, unreadMessages, final } = useGlobalContext();
  const queryClient = useQueryClient();
  const unreadCount01 =
    final.find((chat) => Object.keys(chat)[0] === chatId)?.[chatId]?.length ??
    0;

  // const [optimisticUnreadCount, updateUnreadCount] = useOptimistic(
  //   unreadCount,
  //   (state: number, newCount: number) => newCount // نحوه بروزرسانی
  // );
  // queryKey: ["messages", userId]

  async function updateAll(chatId: string) {
    startTransition(async () => {
      try {
        // updateUnreadCount(0);
        const response = await fetch("/api/messages/update-all-status", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ chatId }),
        });
        queryClient.invalidateQueries({ queryKey: [`${queryKey}`] });

        // return { success: true };
      } catch (error) {
        // updateUnreadCount(unreadCount);
        console.error("Error updating all message status:", error);
        // return { success: false };
      }
    });
  }
  return (
    <>
      <div
        className={classNames(
          " absolute bottom-6 right-8 flex items-center justify-center min-w-[36px] z-[99] min-h-[36px] rounded-full bg-white border-transparent  px-[16px] [box-shadow:rgb(101_119_134_/_20%)_0px_0px_8px,_rgb(101_119_134_/_25%)_0px_1px_3px_1px]   ",
          "cursor-pointer transiton-all duration-300 ",
          goDown ? "opacity-100" : "opacity-0 pointer-events-none "
        )}
        onClick={() => {
          updateAll(chatId);
          func();
        }}
      >
        <div
          className={classNames(
            " absolute -top-5 right-3 flex items-center justify-center bg-blue-400 text-white font-semibold rounded-full size-8 "
            // optimisticUnreadCount === 0 && "hidden pointer-events-none "
          )}
        >
          {unreadCount01}
          {/* {unreadMessages.length} */}
          {/* {optimisticUnreadCount} */}
        </div>

        <svg
          viewBox="0 0 24 24"
          aria-hidden="true"
          className=" fill-[rgb(29,155,240)] shrink-0 size-[24px] "
        >
          <g>
            <path d="M13 3v13.59l5.043-5.05 1.414 1.42L12 20.41l-7.457-7.45 1.414-1.42L11 16.59V3h2z"></path>
          </g>
        </svg>
      </div>
    </>
  );
}

export function MessRight({ message, direction, show }: mess) {
  const { imgTemp, setImgTemp } = useGlobalContext();
  // console.log("message", message);

  function hasKeyRuntime(key: string, obj: object): boolean {
    return key in obj;
  }

  const imageUrls = useMemo(() => {
    if (imgTemp) {
      // console.log("imgTempimgTemp", imgTemp);
      return imgTemp.map((fileState) => {
        if (typeof fileState.file === "string") {
          // in case an url is passed in, use it to display the image
          return fileState.file;
        } else {
          // in case a file is passed in, create a base64 url to display the image
          return URL.createObjectURL(fileState.file);
        }
      });
    }
    return [];
  }, [imgTemp]);
  const isImg = message.type === "IMAGE";

  if (isImg) {
    const rr = message.images.length === 0;
    if (rr) {
      return null;
    }
    return (
      <motion.div
        className="  pb-[5px]  p-2  w-full group flex items-center gap-2 justify-end hover:bg-[rgba(66,82,110,0.03)] transition-colors duration-200 ease-out  "
        // initial={{ y: 5, opacity: 0 }}
        // animate={{ y: 0, opacity: 1 }}
      >
        <div className="flex flex-col w-full items-end ">
          <div className="flex items-center gap-2 max-w-[calc((100%_/_2)_+_(100%_/_3))]  ">
            {/* for delete messag */}
            <div className="  ">
              {/* <button
                // onClick={() => deleteMessageById(it.id)}
                className=" size-[34px] hover:bg-[#1d9bf01a] flex items-center justify-center transition-all duration-300
                       rounded-full opacity-0 group-hover:opacity-100  "
              >
                <svg
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                  className="size-[20px] shrink-0 fill-[#6b7f8e]  "
                >
                  <g>
                    <path d="M16 6V4.5C16 3.12 14.88 2 13.5 2h-3C9.11 2 8 3.12 8 4.5V6H3v2h1.06l.81 11.21C4.98 20.78 6.28 22 7.86 22h8.27c1.58 0 2.88-1.22 3-2.79L19.93 8H21V6h-5zm-6-1.5c0-.28.22-.5.5-.5h3c.27 0 .5.22.5.5V6h-4V4.5zm7.13 14.57c-.04.52-.47.93-1 .93H7.86c-.53 0-.96-.41-1-.93L6.07 8h11.85l-.79 11.07zM9 17v-6h2v6H9zm4 0v-6h2v6h-2z"></path>
                  </g>
                </svg>
              </button> */}
            </div>
            {show && <Loader2 className="size-4 text-blue-700 animate-spin " />}

            <div
              className=" flex cursor-pointer flex-col gap-2 bg-[#dcfaf5] rounded-br-sm rounded-2xl py-[12px] 
            px-[16px] text-right text-[#091e42] leading-[20px] text-[1rem] font-normal  transition-all duration-300  w-full  "
            >
              <div
                className={cn(
                  " grid  h-auto max-h-[calc(55dvh)] w-full shrink-0 overflow-hidden relative ",
                  message.images.length > 1 ? "grid-cols-2" : "grid-cols-1"
                  // message.images.length === 2 && "grid-cols-2",
                )}
              >
                {message.images?.map((file: any, index: number) => {
                  // console.log("file", file);
                  if (hasKeyRuntime("id", file)) {
                    return (
                      // <div
                      //   key={index}
                      //   className="relative w-[200px] h-[300px] max-h-[280px] shrink-0 overflow-hidden"
                      // >
                      <img
                        src={file.url}
                        alt={`uploaded-img-${index}`}
                        key={index}
                        // fill
                        // width={200}
                        // height={300}
                        className={cn(
                          "  bg-[#0f1419bf] h-auto max-h-[calc(55dvh)]   shrike-0  object-cover relative"
                          // typeof file.progress === "number" && "opacity-10"
                        )}
                      />
                      // </div>
                    );
                  }
                  console.log("progress", file.progress);
                  return (
                    <div key={index} className="relative">
                      <img
                        src={imageUrls[index]}
                        // src={file}
                        alt={`uploaded-img-${index}`}
                        className={cn(
                          " h-auto max-h-[calc(55dvh)] bg-[#0f1419bf] shrike-0  object-cover relative",
                          typeof file.progress === "string" &&
                            "opacity-50  blur-lg "
                        )}
                      />

                      {typeof file.progress === "string" && (
                        <CircleProgress progress={file.progress} />
                      )}
                    </div>
                  );
                })}
              </div>
              <span
                className={classNames(
                  " break-all "
                  // show && "!text-red-600"
                  // direction === "rtl" ? "rtlDir text-right " : "text-left"
                )}
              >
                {message.content}
              </span>
            </div>
          </div>
          <div className="block text-[#6a7485] text-[13px] leading-[16px] font-[400] mt-[6px]  rtlDir ">
            {formatPersianDate(new Date(message.createdAt))}
          </div>
        </div>
      </motion.div>
    );
  }
  if (message.content.length === 0) {
    return null;
  }
  return (
    <motion.div
      className="  pb-[5px]  p-2  w-full group flex items-center gap-2 justify-end hover:bg-[rgba(66,82,110,0.03)] transition-colors duration-200 ease-out  "
      // initial={{ y: 5, opacity: 0 }}
      // animate={{ y: 0, opacity: 1 }}
    >
      <div className="flex flex-col w-full items-end ">
        <div className="flex items-center gap-2 max-w-[calc((100%_/_2)_+_(100%_/_3))]  ">
          {/* for delete messag */}
          <div className="  ">
            {/* <button
              // onClick={() => deleteMessageById(it.id)}
              className=" size-[34px] hover:bg-[#1d9bf01a] flex items-center justify-center transition-all duration-300
                     rounded-full opacity-0 group-hover:opacity-100  "
            >
              <svg
                viewBox="0 0 24 24"
                aria-hidden="true"
                className="size-[20px] shrink-0 fill-[#6b7f8e]  "
              >
                <g>
                  <path d="M16 6V4.5C16 3.12 14.88 2 13.5 2h-3C9.11 2 8 3.12 8 4.5V6H3v2h1.06l.81 11.21C4.98 20.78 6.28 22 7.86 22h8.27c1.58 0 2.88-1.22 3-2.79L19.93 8H21V6h-5zm-6-1.5c0-.28.22-.5.5-.5h3c.27 0 .5.22.5.5V6h-4V4.5zm7.13 14.57c-.04.52-.47.93-1 .93H7.86c-.53 0-.96-.41-1-.93L6.07 8h11.85l-.79 11.07zM9 17v-6h2v6H9zm4 0v-6h2v6h-2z"></path>
                </g>
              </svg>
            </button> */}
          </div>
          {show && <Loader2 className="size-4 text-blue-700 animate-spin " />}

          <div
            className=" flex cursor-pointer flex-col gap-2 bg-[#dcfaf5] rounded-br-sm rounded-2xl py-[12px] 
          px-[16px] text-right text-[#091e42] leading-[20px] text-[1rem] font-normal  transition-all duration-300    "
          >
            {/* {!!it.images?.length && (
                          <img
                            src={it.images[0]}
                            alt={`uploaded-img-${it.images}`}
                            className=" h-auto bg-[#0f1419bf] shrike-0 hover:bg-[#272c30bf] object-cover "
                          />
                        )} */}
            <span
              className={classNames(
                " break-all "
                // show && "!text-red-600"
                // direction === "rtl" ? "rtlDir text-right " : "text-left"
              )}
            >
              {message.content}
            </span>
          </div>
        </div>
        <div className="block text-[#6a7485] text-[13px] leading-[16px] font-[400] mt-[6px]  rtlDir ">
          {formatPersianDate(new Date(message.createdAt))}
        </div>
      </div>
    </motion.div>
  );
}

export function MessLeft({ message, direction, show }: mess) {
  const { imgTemp, setImgTemp } = useGlobalContext();
  // console.log("message", message);

  function hasKeyRuntime(key: string, obj: object): boolean {
    return key in obj;
  }

  const imageUrls = useMemo(() => {
    if (imgTemp) {
      // console.log("imgTempimgTemp", imgTemp);
      return imgTemp.map((fileState) => {
        if (typeof fileState.file === "string") {
          // in case an url is passed in, use it to display the image
          return fileState.file;
        } else {
          // in case a file is passed in, create a base64 url to display the image
          return URL.createObjectURL(fileState.file);
        }
      });
    }
    return [];
  }, [imgTemp]);
  const isImg = message.type === "IMAGE";
  if (isImg) {
    const rr = message.images.length === 0;
    if (rr) {
      return null;
    }
    return (
      <motion.div
        className="  pb-[5px]  p-2 flex   items-center w-full group gap-2 hover:bg-[rgba(66,82,110,0.03)] transition-colors duration-200 ease-out "
        // initial={{ y: 5, opacity: 0 }}
        // animate={{ y: 0, opacity: 1 }}
      >
        <div className="flex flex-col w-full items-start ">
          <div className="flex items-center flex-row-reverse gap-2 max-w-[calc((100%_/_2)_+_(100%_/_3))]  ">
            {/* for delete messag */}
            <div className="  ">
              {/* <button
                // onClick={() => deleteMessageById(it.id)}
                className=" size-[34px] hover:bg-[#1d9bf01a] flex items-center justify-center transition-all duration-300
                       rounded-full opacity-0 group-hover:opacity-100  "
              >
                <svg
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                  className="size-[20px] shrink-0 fill-[#6b7f8e]  "
                >
                  <g>
                    <path d="M16 6V4.5C16 3.12 14.88 2 13.5 2h-3C9.11 2 8 3.12 8 4.5V6H3v2h1.06l.81 11.21C4.98 20.78 6.28 22 7.86 22h8.27c1.58 0 2.88-1.22 3-2.79L19.93 8H21V6h-5zm-6-1.5c0-.28.22-.5.5-.5h3c.27 0 .5.22.5.5V6h-4V4.5zm7.13 14.57c-.04.52-.47.93-1 .93H7.86c-.53 0-.96-.41-1-.93L6.07 8h11.85l-.79 11.07zM9 17v-6h2v6H9zm4 0v-6h2v6h-2z"></path>
                  </g>
                </svg>
              </button> */}
            </div>
            {show && <Loader2 className="size-4 text-blue-700 animate-spin " />}

            <div
              className=" flex cursor-pointer flex-col text-[#091e42] bg-[#f4f5f7] rounded-bl-sm rounded-2xl py-[12px]
              px-[16px] text-right leading-[20px] text-[1rem] font-normal transition-all duration-300    "
            >
              <div
                className={cn(
                  " grid  h-auto max-h-[calc(55dvh)] w-full shrink-0 overflow-hidden relative ",
                  message.images.length > 1 ? "grid-cols-2" : "grid-cols-1"
                  // message.images.length === 2 && "grid-cols-2",
                )}
              >
                {message.images?.map((file: any, index: number) => {
                  // console.log("file", file);
                  if (hasKeyRuntime("id", file)) {
                    return (
                      // <div
                      //   key={index}
                      //   className="relative w-[200px] h-[300px] max-h-[280px] shrink-0 overflow-hidden"
                      // >
                      <img
                        src={file.url}
                        alt={`uploaded-img-${index}`}
                        key={index}
                        // fill
                        // width={200}
                        // height={300}
                        className={cn(
                          "  bg-[#0f1419bf] h-auto max-h-[calc(55dvh)]   shrike-0  object-cover relative"
                          // typeof file.progress === "number" && "opacity-10"
                        )}
                      />
                      // </div>
                    );
                  }
                  console.log("progress", file.progress);
                  return (
                    <div key={index} className="relative">
                      <img
                        src={imageUrls[index]}
                        // src={file}
                        alt={`uploaded-img-${index}`}
                        className={cn(
                          " h-auto max-h-[calc(55dvh)] bg-[#0f1419bf] shrike-0  object-cover relative",
                          typeof file.progress === "string" &&
                            "opacity-20  blur-lg "
                        )}
                      />

                      {typeof file.progress === "string" && (
                        <CircleProgress progress={file.progress} />
                      )}
                    </div>
                  );
                })}
              </div>
              <span
                className={classNames(
                  " break-all "
                  // show && "!text-red-600"
                  // direction === "rtl" ? "rtlDir text-right " : "text-left"
                )}
              >
                {message.content}
              </span>
            </div>
          </div>
          <div className="block text-[#6a7485] text-[13px] leading-[16px] font-[400] mt-[6px]  rtlDir ">
            {formatPersianDate(new Date(message.createdAt))}
          </div>
        </div>
      </motion.div>
    );
  }
  if (message.content.length === 0) {
    return null;
  }
  return (
    <motion.div
      className="  pb-[5px]  p-2 flex   items-center w-full group gap-2 hover:bg-[rgba(66,82,110,0.03)] transition-colors duration-200 ease-out "
      // initial={{ y: 5, opacity: 0 }}
      // animate={{ y: 0, opacity: 1 }}
    >
      <div className="flex flex-col w-full items-start ">
        <div className="flex items-center flex-row-reverse gap-2 max-w-[calc((100%_/_2)_+_(100%_/_3))]  ">
          {/* for delete messag */}
          <div className="  ">
            {/* <button
              // onClick={() => deleteMessageById(it.id)}
              className=" size-[34px] hover:bg-[#1d9bf01a] flex items-center justify-center transition-all duration-300
                       rounded-full opacity-0 group-hover:opacity-100  "
            >
              <svg
                viewBox="0 0 24 24"
                aria-hidden="true"
                className="size-[20px] shrink-0 fill-[#6b7f8e]  "
              >
                <g>
                  <path d="M16 6V4.5C16 3.12 14.88 2 13.5 2h-3C9.11 2 8 3.12 8 4.5V6H3v2h1.06l.81 11.21C4.98 20.78 6.28 22 7.86 22h8.27c1.58 0 2.88-1.22 3-2.79L19.93 8H21V6h-5zm-6-1.5c0-.28.22-.5.5-.5h3c.27 0 .5.22.5.5V6h-4V4.5zm7.13 14.57c-.04.52-.47.93-1 .93H7.86c-.53 0-.96-.41-1-.93L6.07 8h11.85l-.79 11.07zM9 17v-6h2v6H9zm4 0v-6h2v6h-2z"></path>
                </g>
              </svg>
            </button> */}
          </div>
          <div
            className=" flex cursor-pointer flex-col text-[#091e42] bg-[#f4f5f7] rounded-bl-sm rounded-2xl py-[12px]
           px-[16px] text-right leading-[20px] text-[1rem] font-normal transition-all duration-300    "
          >
            {/* {!!it.images?.length && (
                          <img
                            src={it.images[0]}
                            alt={`uploaded-img-${it.images}`}
                            className=" h-auto bg-[#0f1419bf] shrike-0 hover:bg-[#272c30bf] object-cover "
                          />
                        )} */}
            <span
              className={classNames(
                " break-all  "
                // direction === "rtl" ? "rtlDir text-right " : "text-left"
              )}
            >
              {message.content}
            </span>
          </div>
        </div>

        <div className=" text-[rgb(83,100,113)] flex text-left text-[13px] leading-[16px] font-[400] mt-[6px] rtlDir ">
          {formatPersianDate(new Date(message.createdAt))}
        </div>
      </div>
    </motion.div>
  );
}

export function TypingRight({ message }: { message: string }) {
  return (
    <motion.div
      className="  pb-[5px]  p-2  w-full group flex items-center gap-2 justify-end    "
      initial={{ y: 5, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
    >
      <div className="flex flex-col w-full items-end ">
        <div className="flex items-center gap-2 max-w-[calc((100%_/_2)_+_(100%_/_3))]  ">
          <div className=" flex cursor-pointer flex-col gap-2 bg-[rgb(29,155,240)] rounded-br-sm rounded-2xl py-[12px] px-[16px] text-right text-white leading-[20px] text-[15px] hover:bg-[#1a8cd8] transition-all duration-300    ">
            <span
              className={classNames(
                " break-all "
                // direction === "rtl" ? "rtlDir text-right " : "text-left"
              )}
            >
              {message}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export function TypingLeft({ message }: { message: string }) {
  return (
    // <AnimatePresence>
    <motion.div
      className="  pb-[5px]  p-2 flex   items-center w-full group gap-2 "
      initial={{ y: 5, opacity: 0, height: 0 }}
      animate={{ y: 0, opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0, transition: { duration: 0.5 } }}
      // transition={{
      //   duration: 1.5,
      // }}
    >
      <div className="flex flex-col w-full items-start animate-pulse ">
        <div className="flex items-center flex-row-reverse gap-2 max-w-[calc((100%_/_2)_+_(100%_/_3))]  ">
          <div className=" flex cursor-pointer flex-col text-[#0f1419] bg-gray-300 rounded-bl-sm rounded-2xl py-[12px] px-[16px] text-right leading-[20px] text-[15px] transition-all duration-300    ">
            <span
              className={classNames(
                " break-all  "
                // direction === "rtl" ? "rtlDir text-right " : "text-left"
              )}
            >
              {message}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
    // </AnimatePresence>
  );
}

export function BackMenue({ func }: { func: () => void }) {
  return (
    <div
      className={classNames(
        "  flex items-center justify-center size-[36px] rounded-full hover:bg-gray-100 transition-colors duration-300 border-transparent     ",
        "cursor-pointer transiton-all duration-300 md:hidden "
      )}
      onClick={func}
    >
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
        className=" fill-[rgba(53,55,56,0.86)] shrink-0 size-[24px] rotate-90 "
      >
        <g>
          <path d="M13 3v13.59l5.043-5.05 1.414 1.42L12 20.41l-7.457-7.45 1.414-1.42L11 16.59V3h2z"></path>
        </g>
      </svg>
    </div>
  );
}
