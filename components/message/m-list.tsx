"use client";

import { useGlobalContext } from "@/context/globalContext";
import { formatMessageDate, formatPersianDate } from "@/lib/utils";
import { useSocket } from "@/provider/socket-provider";
import classNames from "classnames";
import { Session } from "next-auth";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect } from "react";
import { useMediaQuery } from "usehooks-ts";

export type userList = {
  name: string | null;
  id: string;
  img?: string;
  href: string;
  active: boolean | null;
  username: string | null;
  date: Date;
  lastMessage: string;
};

export default function UserList({ user }: { user: userList }) {
  const { mobileMenue, setMobileMenue, chatIdActive, setChatIdActive } =
    useGlobalContext();
  const matches = useMediaQuery("(min-width: 768px)");
  const { isConnected } = useSocket();

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
        setChatIdActive(user);
      }}
    >
      <div
        className={classNames(
          "flex  min-h-[40px] items-center cursor-pointer p-[12px] justify-between group transition-all hover:bg-[#f7f9f9] "
          // chatIdActive?.href === user.href
          //   ? "bg-[#f7f9f9] border-r-2 border-blue-300 "
          //   : ""
          // chatIdActive?.active ? "bg-[#f7f9f9] border-r-2 border-blue-300 " : ""
        )}
      >
        <div className="mr-[16px] flex relative size-[48px] cursor-pointer items-center justify-center rounded-full border border-[#e5eaec] bg-[#ffffff] transition-all duration-300  ">
          <Image
            alt="Aerospace"
            src={user.img ? user.img : ""}
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

        <div className="flex h-full grow flex-1 flex-col">
          <div className="text-[15px] font-semibold leading-[20px] text-[#0f1419] whitespace-nowrap ">
            <div className=" flex items-center justify-between ">
              <div className="text-[15px] font-normal text-[#536471]">
                {user.name}
              </div>
              <div className="text-[12px] font-normal text-[#536471] rtlDir   ">
                {formatMessageDate(new Date(user.date))}
              </div>
            </div>
          </div>
          <div className="text-[13px] font-normal leading-[20px] text-[#536471]">
            <span>{user.lastMessage.substring(0, 30)}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export function Account({ user }: { user: Session | null }) {
  const me = user?.user;
  const img =
    "https://pbs.twimg.com/profile_images/1564361710554734593/jgWXrher_normal.jpg";

  const { isConnected } = useSocket();

  if (!user) {
    return null;
  }

  return (
    <Link
      className="min-h-[40px] w-full sticky top-0  "
      href={`/${me?.id}`}
      // prefetch={true}
      // onClick={() => {
      //   if (!matches) {
      //     setMobileMenue(false);
      //   }
      //   setChatIdActive(user);
      // }}
    >
      <div
        className={classNames(
          "flex  min-h-[40px] items-center cursor-pointer p-[12px] justify-between group transition-all hover:bg-[#f7f9f9] "
          // chatIdActive?.href === user.href
          //   ? "bg-[#f7f9f9] border-r-2 border-blue-300 "
          //   : ""
          // chatIdActive?.active ? "bg-[#f7f9f9] border-r-2 border-blue-300 " : ""
        )}
      >
        <div className="mr-[16px] flex relative size-[48px] cursor-pointer items-center justify-center rounded-full border border-[#e5eaec] bg-[#ffffff] transition-all duration-300  ">
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
      </div>
    </Link>
  );
}
