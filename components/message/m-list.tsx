"use client";

import { useGlobalContext } from "@/context/globalContext";
import { cn, formatMessageDate, formatPersianDate } from "@/lib/utils";
import { useSocket } from "@/provider/socket-provider";
import classNames from "classnames";
import { Session } from "next-auth";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect } from "react";
import { useMediaQuery } from "usehooks-ts";
import { Skeleton } from "../ui/skeleton";
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";
import { Copy, Check } from "lucide-react";

export type userList = {
  name: string | null;
  id: string;
  img: string;
  href: string;
  active: boolean | null;
  username: string | null;
  date: Date;
  lastMessage: string;
  unReadMess: number;
};

export default function UserList({ user }: { user: userList }) {
  const {
    mobileMenue,
    setMobileMenue,
    chatIdActive,
    setChatIdActive,
    unreadCountMenue,
    final,
  } = useGlobalContext();
  const matches = useMediaQuery("(min-width: 768px)");
  const { isConnected } = useSocket();
  const unReadMess =
    final.find((obj) => Object.keys(obj)[0] === user.id)?.[user.id]?.length ??
    0;

  const currentUser = useSession();

  const me = currentUser.status;

  const Active = me === "authenticated" && isConnected;

  return (
    <Link
      className="min-h-[40px] w-full  "
      href={`/${user.href}`}
      prefetch={true}
      onClick={() => {
        if (!matches) {
          setMobileMenue(false);
        }
        setChatIdActive(user.href);
      }}
    >
      <div
        className={classNames(
          "flex  min-h-[74px]  items-center cursor-pointer p-[12px] relative justify-between group transition-all  ",
          chatIdActive === user.href
            ? "bg-[rgba(0,184,147,0.15)] "
            : "hover:bg-[#f4f5f7]"
          // chatIdActive?.active ? "bg-[#f7f9f9] border-r-2 border-blue-300 " : ""
        )}
      >
        <div
          className={classNames(
            " absolute bottom-2 flex items-center justify-center right-4 size-6 rounded-full bg-blue-500 text-white font-semibold  "
            // user.unReadMess === 0 && "hidden "
          )}
        >
          {/* {count} */}
          {unReadMess}
        </div>
        <div className="mr-[16px] flex relative size-[50px] cursor-pointer items-center justify-center rounded-full border border-[#e5eaec] bg-[#ffffff] transition-all duration-300  ">
          <Image
            alt="alt img"
            src={user.img}
            className="size-full rounded-full shrink-0 "
            fill
          />
          <div
            className={classNames(
              " size-3 rounded-full absolute top-[30px] right-0   "
              // Active && "bg-green-400"
            )}
          />
        </div>

        <div className="flex h-full grow flex-1 flex-col gap-2 ">
          <div className="text-[15px] font-semibold leading-[20px] text-[#0f1419] whitespace-nowrap ">
            <div className=" flex items-center justify-between ">
              <div className="text-[16px] font-medium text-[#091e42]">
                {user.name}
              </div>
              <div className="text-[12px] font-normal text-[#7a869a] rtlDir   ">
                {formatMessageDate(new Date(user.date))}
              </div>
            </div>
          </div>
          <div className="text-[14px] font-normal leading-[20px] text-[#7a869a]">
            <span>{user.lastMessage.substring(0, 30)}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export function UserListLoading() {
  const { setMobileMenue } = useGlobalContext();
  const matches = useMediaQuery("(min-width: 768px)");

  return (
    <div
      className="min-h-[40px] w-full  "
      onClick={() => {
        if (!matches) {
          setMobileMenue(false);
        }
        // setChatIdActive(user);
      }}
    >
      <div
        className={classNames(
          "flex gap-3    min-h-[40px] items-center cursor-pointer p-[12px] relative justify-between  "
        )}
      >
        <Skeleton className="size-[48px] shrink-0 aspect-square rounded-full " />

        <div className="flex  w-full  flex-col  gap-3">
          <div className=" flex items-center justify-between ">
            <Skeleton className="h-2 w-[40px] " />
            <Skeleton className="h-2 w-5" />
          </div>
          <div className="">
            <Skeleton className="h-2 w-[80px] " />
          </div>
        </div>
      </div>
    </div>
  );
}

export function Account({ user }: { user: Session | null }) {
  const me = user?.user;
  const img =
    "https://pbs.twimg.com/profile_images/1564361710554734593/jgWXrher_normal.jpg";

  const { isConnected } = useSocket();
  const { isCopied, copyToClipboard } = useCopyToClipboard({});

  if (!user) {
    return null;
  }

  return (
    <div
      className="min-h-[40px] w-full sticky top-0 group  "
      // href={`/${me?.id}`}
      // prefetch={true}
      // onClick={() => {
      //   if (!matches) {
      //     setMobileMenue(false);
      //   }
      //   setChatIdActive(user);
      // }}
      onClick={() => copyToClipboard(me?.id!)}
    >
      <div
        className={classNames(
          "flex  min-h-[40px] items-center cursor-pointer  border-y  p-[12px] justify-between group transition-all hover:bg-[#f7f9f9] "
          // chatIdActive?.href === user.href
          //   ? "bg-[#f7f9f9] border-r-2 border-blue-300 "
          //   : ""
          // chatIdActive?.active ? "bg-[#f7f9f9] border-r-2 border-blue-300 " : ""
        )}
      >
        <div className="mr-[16px] flex relative size-[48px] cursor-pointer items-center justify-center rounded-full border-y border-[#e5eaec]  transition-all duration-300  ">
          <Image
            alt="Aerospace"
            src={me?.image ?? img}
            className="size-full rounded-full shrink-0 "
            fill
          />
          <div
            className={classNames(
              " size-3 rounded-full absolute top-[30px] right-0   ",
              isConnected && "bg-green-400"
            )}
          />
        </div>

        <div className="flex h-full grow flex-1 flex-col">
          <div className="text-[15px] font-semibold leading-[20px] text-[#0f1419] whitespace-nowrap ">
            <div className=" flex items-center justify-between ">
              <div className="text-[15px] font-normal text-[#536471]">
                {me?.name}
              </div>
              <div className="text-[12px] font-normal text-[#536471] rtlDir   ">
                {/* {formatMessageDate(new Date(user.date))} */}
              </div>
            </div>
          </div>
          <div className="text-[13px] font-normal leading-[20px] text-[#536471]">
            {/* <span>{user.lastMessage.substring(0, 30)}</span> */}
          </div>
        </div>
        <div
          className={cn(
            "   transition-[opacity] duration-300 mr-4 ",
            isCopied
              ? "text-green-400 group-hover:text-green-400 "
              : "text-gray-900/50 group-hover:text-gray-900"
          )}
        >
          {isCopied ? <Check /> : <Copy />}
        </div>
      </div>
    </div>
  );
}
