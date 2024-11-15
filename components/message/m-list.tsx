"use client";

import { useGlobalContext } from "@/context/globalContext";
import { formatMessageDate, formatPersianDate } from "@/lib/utils";
import classNames from "classnames";
import Image from "next/image";
import Link from "next/link";
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
          "flex  min-h-[40px] items-center cursor-pointer p-[12px] justify-between group transition-all hover:bg-[#f7f9f9] ",
          chatIdActive?.href === user.href &&
            "bg-[#f7f9f9] border-r-2 border-blue-300 "
        )}
      >
        <div className="mr-[16px] flex relative size-[48px] cursor-pointer items-center justify-center rounded-full border border-[#e5eaec] bg-[#ffffff] transition-all duration-300  ">
          <Image
            alt="Aerospace"
            src={user.img ? user.img : ""}
            className="size-full rounded-full shrink-0 "
            fill
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
