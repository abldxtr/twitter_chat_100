"use client";

import { useGlobalContext } from "@/context/globalContext";
import { formatMessageDate, formatPersianDate } from "@/lib/utils";
import classNames from "classnames";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { useMediaQuery } from "usehooks-ts";

export type user = {
  name: string | null;
  id: string;
  img?: string;
  href: string;
  active: boolean | null;
  username: string | null;
  // date1: Date;
  // date2: Date;
  date: Date;
  lastMessage: string;
};

export default function UserList({
  name,
  id,
  img,
  href,
  active,
  username,
  date,
  lastMessage,
}: user) {
  const router = useRouter();
  const { mobileMenue, setMobileMenue } = useGlobalContext();
  const matches = useMediaQuery("(min-width: 768px)");

  const param = useParams();
  console.log("param", param!.conversationId);
  console.log("href", href);
  const conId = param && (param.conversationId as string);

  return (
    <Link
      className="min-h-[40px] w-full  "
      href={`/${href}`}
      prefetch={true}
      // onClick={() => {
      //   if (!matches) {
      //     setMobileMenue(false);
      //   }

      //   router.push(`/${href}`);
      // }}
    >
      <div
        className={classNames(
          "flex  min-h-[40px] items-center cursor-pointer p-[12px] justify-between group transition-all hover:bg-[#f7f9f9] ",
          active ? "bg-[#f7f9f9] border-r-2 border-blue-300 " : ""
          // conId && conId === href
          //   ? "bg-[#f7f9f9] border-r-2 border-blue-300 "
          //   : ""
        )}
      >
        <div className="mr-[16px] flex relative size-[48px] cursor-pointer items-center justify-center rounded-full border border-[#e5eaec] bg-[#ffffff] transition-all duration-300  ">
          <Image
            alt="Aerospace"
            src={img ? img : ""}
            className="size-full rounded-full shrink-0 "
            fill
          />
        </div>

        <div className="flex h-full grow flex-1 flex-col">
          <div className="text-[15px] font-semibold leading-[20px] text-[#0f1419] whitespace-nowrap ">
            <div className=" flex items-center justify-between ">
              <div className="text-[15px] font-normal text-[#536471]">
                {name}
              </div>
              <div className="text-[12px] font-normal text-[#536471] rtlDir   ">
                {formatMessageDate(new Date(date))}
              </div>
            </div>
          </div>
          <div className="text-[13px] font-normal leading-[20px] text-[#536471]">
            <span>{lastMessage.substring(0, 30)}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
