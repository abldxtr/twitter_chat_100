import React, { useState, useEffect } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { formatPersianDate, cn } from "@/lib/utils";
// import { CircleProgress } from './CircleProgress';
import { MessageData } from "@/lib/definitions";
import { CircleProgress } from "./circle-progress";
import { useGlobalContext } from "@/context/globalContext";
import {
  useInfiniteQuery,
  useQueryClient,
  useMutation,
  useQuery,
} from "@tanstack/react-query";

interface ChatMessageProps {
  message: MessageData;
  isCurrentUser: boolean;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  isCurrentUser,
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);

  const MessageWrapper = isCurrentUser ? MessRight : MessLeft;

  return (
    <MessageWrapper message={message}>
      {message.type === "IMAGE" &&
        message.images &&
        message.images.length > 0 && (
          <ImageContent
            images={message.images}
            setImageLoaded={setImageLoaded}
          />
        )}
      {message.content && <span className="break-all">{message.content}</span>}
      <MessageFooter message={message} imageLoaded={imageLoaded} />
    </MessageWrapper>
  );
};

const ImageContent: React.FC<{
  images: any[];
  setImageLoaded: (loaded: boolean) => void;
}> = ({ images, setImageLoaded }) => {
  return (
    <div
      className={cn(
        "grid gap-1 h-auto max-h-[calc(55dvh)] w-full shrink-0 overflow-hidden relative",
        images.length > 1 ? "grid-cols-2" : "grid-cols-1"
      )}
    >
      {images.map((image, index) => (
        <ImageItem key={index} image={image} setImageLoaded={setImageLoaded} />
      ))}
    </div>
  );
};

const ImageItem: React.FC<{
  image: any;
  setImageLoaded: (loaded: boolean) => void;
}> = ({ image, setImageLoaded }) => {
  const [loading, setLoading] = useState(true);

  return (
    <div className="relative">
      <Image
        src={image.url || URL.createObjectURL(image.file)}
        alt={`uploaded-img-${image.id || image.key}`}
        width={600}
        height={600}
        className={cn(
          "h-auto max-h-[calc(55dvh)] bg-[#0f1419bf] shrink-0 object-cover"
          // loading ? "blur-sm" : "blur-0"
        )}
        // onLoadingComplete={() => {
        //   setLoading(false);
        //   setImageLoaded(true);
        // }}
      />
      {typeof image.progress === "number" && image.progress < 100 && (
        <CircleProgress progress={image.progress} />
      )}
    </div>
  );
};

const MessageFooter: React.FC<{
  message: MessageData;
  imageLoaded: boolean;
}> = ({ message, imageLoaded }) => (
  <div className="text-[#6a7485] text-xs leading-4 mt-1 flex items-center">
    {formatPersianDate(new Date(message.createdAt))}
    {message.status === "SENT" && (
      <span className="ml-2 pb-1 ">
        <svg
          width="12"
          height="7"
          viewBox="0 0 12 7"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g clip-path="url(#clip0)">
            <path
              d="M11.6381 0.371138C11.4351 0.166704 11.1044 0.16702 10.9018 0.371841L5.84865 5.48024C5.82537 5.50377 5.78736 5.50379 5.76406 5.48028L4.01688 3.71737C3.81421 3.51288 3.48365 3.513 3.28113 3.71765C3.08155 3.91933 3.08148 4.24408 3.28098 4.44585L5.31611 6.50414C5.58571 6.7768 6.02606 6.77681 6.29568 6.50417L11.6389 1.10086C11.8389 0.89861 11.8386 0.572974 11.6381 0.371138Z"
              fill="#FFFFFF"
            ></path>
          </g>
          <defs>
            <clipPath id="clip0">
              <rect width="12" height="7" fill="white"></rect>
            </clipPath>
          </defs>
        </svg>
      </span>
    )}
    {message.status === "READ" && (
      <span className="ml-2 pb-1  ">
        <svg
          width="12"
          height="7"
          viewBox="0 0 12 7"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M8.71917 1.09935C8.91838 0.897802 8.91834 0.573492 8.71908 0.371997C8.51658 0.167235 8.18585 0.167266 7.9834 0.372067L5.43861 2.94637C5.23928 3.14801 5.23936 3.47253 5.4388 3.67407C5.64138 3.87878 5.97212 3.87868 6.17458 3.67384L8.71917 1.09935ZM11.6381 0.371138C11.4351 0.166704 11.1043 0.16702 10.9017 0.371841L5.84858 5.48024C5.8253 5.50377 5.7873 5.50379 5.76399 5.48028L4.01681 3.71737C3.81414 3.51288 3.48358 3.513 3.28106 3.71765C3.08148 3.91933 3.08141 4.24408 3.28091 4.44585L5.31604 6.50414C5.58564 6.7768 6.026 6.77681 6.29561 6.50417L11.6388 1.10086C11.8388 0.89861 11.8385 0.572974 11.6381 0.371138ZM0.363426 3.71718C0.162252 3.91923 0.161685 4.24572 0.362155 4.44847L2.51702 6.62785C2.71959 6.83272 3.05044 6.83279 3.2531 6.62801C3.45252 6.42649 3.45275 6.10204 3.2536 5.90025L1.10082 3.71881C0.898174 3.51347 0.566978 3.51274 0.363426 3.71718Z"
            fill="#04CC83"
          ></path>
        </svg>
      </span>
    )}
  </div>
);

const MessRight: React.FC<{
  message: MessageData;
  children: React.ReactNode;
}> = ({ message, children }) => (
  <motion.div
    className="pb-1 p-2 w-full group flex items-end gap-2 justify-end z-[9]"
    // initial={{ y: 20, opacity: 0 }}
    // animate={{ y: 0, opacity: 1 }}
  >
    <div className="flex flex-col items-end max-w-[75%]">
      <div className="bg-[#dcfaf5] rounded-tl-2xl rounded-tr-sm rounded-bl-2xl p-3 text-[#091e42]">
        {children}
      </div>
    </div>
  </motion.div>
);

const MessLeft: React.FC<{
  message: MessageData;
  children: React.ReactNode;
}> = ({ message, children }) => (
  <motion.div
    className="pb-1 p-2 w-full group flex items-end gap-2 z-[9] "
    // initial={{ y: 20, opacity: 0 }}
    // animate={{ y: 0, opacity: 1 }}
  >
    <div className="flex flex-col items-start max-w-[75%]">
      <div className="bg-[#f4f5f7] rounded-tr-2xl rounded-tl-sm rounded-br-2xl p-3 text-[#091e42]">
        {children}
      </div>
    </div>
  </motion.div>
);

export function BackMenue({ func }: { func: () => void }) {
  return (
    <div
      className={cn(
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

export function TypingLeft({ message }: { message: string }) {
  return (
    // <AnimatePresence>
    <motion.div
      className="  pb-[5px]  p-2 flex   items-center w-full group gap-2 "
      // initial={{ y: 5, opacity: 0, height: 0 }}
      // animate={{ y: 0, opacity: 1, height: "auto" }}
      // exit={{ opacity: 0, height: 0, transition: { duration: 0.5 } }}
      // transition={{
      //   duration: 1.5,
      // }}
    >
      <div className="flex flex-col w-full items-start animate-pulse ">
        <div className="flex items-center flex-row-reverse gap-2 max-w-[calc((100%_/_2)_+_(100%_/_3))]  ">
          <div className=" flex cursor-pointer flex-col text-[#0f1419] bg-gray-300 rounded-bl-sm rounded-2xl py-[12px] px-[16px] text-right leading-[20px] text-[15px] transition-all duration-300    ">
            <span
              className={cn(
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

interface ScrollDownProps {
  goDown: boolean;
  func: () => void;
  chatId: string;
  queryKey: string;
}
export function ScrollDown({
  goDown,
  func,
  chatId,
  queryKey,
}: ScrollDownProps) {
  const { setUnreadCount, unreadMessages, final } = useGlobalContext();
  const queryClient = useQueryClient();

  const { data: unreadCount } = useQuery({
    queryKey: ["unreadCount", chatId],
    queryFn: () =>
      final.find((chat) => Object.keys(chat)[0] === chatId)?.[chatId]?.length ??
      0,
    enabled: !!chatId,
  });

  const updateAllMutation = useMutation({
    mutationFn: async (chatId: string) => {
      const response = await fetch("/api/messages/update-all-status", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ chatId }),
      });
      if (!response.ok) {
        throw new Error("Failed to update message status");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [queryKey] });
      queryClient.invalidateQueries({ queryKey: ["unreadCount", chatId] });
    },
    onError: (error) => {
      console.error("Error updating all message status:", error);
    },
  });

  const handleClick = () => {
    updateAllMutation.mutate(chatId);
    func();
  };
  return (
    <>
      <div
        className={cn(
          " absolute bottom-6 right-8 flex items-center z-[10] justify-center min-w-[36px] min-h-[36px] rounded-full bg-white border-transparent  px-[16px] [box-shadow:rgb(101_119_134_/_20%)_0px_0px_8px,_rgb(101_119_134_/_25%)_0px_1px_3px_1px]   ",
          "cursor-pointer transiton-all duration-300  ",
          goDown ? "opacity-100" : "opacity-0 pointer-events-none "
        )}
        onClick={handleClick}
      >
        <div
          className={cn(
            " absolute -top-5 right-3 flex items-center justify-center bg-blue-400 text-white font-semibold rounded-full size-8 "
            // optimisticUnreadCount === 0 && "hidden pointer-events-none "
          )}
        >
          {unreadCount}
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

export default ChatMessage;
