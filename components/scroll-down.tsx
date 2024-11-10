import { MessageData } from "@/lib/definitions";
import { formatPersianDate } from "@/lib/utils";
import classNames from "classnames";
import { motion } from "framer-motion";

export type items = {
  goDown: boolean;
  func: () => void;
};

export type mess = {
  message: MessageData;
  direction: "rtl" | "ltr";
};

export function ScrollDown({ goDown, func }: items) {
  return (
    <div
      className={classNames(
        " absolute bottom-6 right-8 flex items-center justify-center min-w-[36px] min-h-[36px] rounded-full bg-white border-transparent  px-[16px] [box-shadow:rgb(101_119_134_/_20%)_0px_0px_8px,_rgb(101_119_134_/_25%)_0px_1px_3px_1px]   ",
        "cursor-pointer transiton-all duration-300 ",
        goDown ? "opacity-100" : "opacity-0 pointer-events-none "
      )}
      onClick={func}
    >
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
  );
}

export function MessRight({ message, direction }: mess) {
  return (
    <motion.div
      className="  pb-[5px]  p-2  w-full group flex items-center gap-2 justify-end    "
      initial={{ y: 5, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
    >
      <div className="flex flex-col w-full items-end ">
        <div className="flex items-center gap-2 max-w-[calc((100%_/_2)_+_(100%_/_3))]  ">
          {/* for delete messag */}
          <div className="  ">
            <button
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
            </button>
          </div>
          <div className=" flex cursor-pointer flex-col gap-2 bg-[rgb(29,155,240)] rounded-br-sm rounded-2xl py-[12px] px-[16px] text-right text-white leading-[20px] text-[15px] hover:bg-[#1a8cd8] transition-all duration-300    ">
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
                // direction === "rtl" ? "rtlDir text-right " : "text-left"
              )}
            >
              {message.content}
            </span>
          </div>
        </div>
        <div className="block text-[rgb(83,100,113)] text-[13px] leading-[16px] font-[400] mt-[6px] rtlDir ">
          {formatPersianDate(new Date(message.createdAt))}
        </div>
      </div>
    </motion.div>
  );
}

export function MessLeft({ message, direction }: mess) {
  return (
    <motion.div
      className="  pb-[5px]  p-2 flex   items-center w-full group gap-2 "
      initial={{ y: 5, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
    >
      <div className="flex flex-col w-full items-start ">
        <div className="flex items-center flex-row-reverse gap-2 max-w-[calc((100%_/_2)_+_(100%_/_3))]  ">
          {/* for delete messag */}
          <div className="  ">
            <button
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
            </button>
          </div>
          <div className=" flex cursor-pointer flex-col text-[#0f1419] bg-[#eff3f4] rounded-bl-sm rounded-2xl py-[12px] px-[16px] text-right leading-[20px] text-[15px] transition-all duration-300    ">
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

        <div className="block text-[rgb(83,100,113)] flex text-left text-[13px] leading-[16px] font-[400] mt-[6px] rtlDir ">
          {formatPersianDate(new Date(message.createdAt))}
        </div>
      </div>
    </motion.div>
  );
}
