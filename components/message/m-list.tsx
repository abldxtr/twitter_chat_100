// "use client";

import classNames from "classnames";
import Image from "next/image";
import Link from "next/link";
// import { useParams } from "next/navigation";
// import { useEffect, useState } from "react";
// import { useRouter } from "next/navigation";

export type user = {
  name: string | null;
  id: string;
  img?: string;
  href: string;
  active: boolean;
  username: string | null;
};

export default function UserList({
  name,
  id,
  img,
  href,
  active,
  username,
}: user) {
  // const { param } = useParams();
  // console.log("href", param);
  // const [state, setState] = useState<string[] | string>([]);

  // // const router = useRouter();
  // useEffect(() => {
  //   if (param) {
  //     setState(param);
  //   }
  // }, [param]);
  return (
    <Link
      className="min-h-[40px] w-full  "
      //   onClick={() => router.push("/123456")}
      href={href}
      prefetch={true}
    >
      <div
        className={classNames(
          "flex  min-h-[40px] items-center cursor-pointer p-[12px] justify-between group transition-all hover:bg-[#f7f9f9] ",
          active ? "bg-[#f7f9f9] border-r-2 border-blue-300 " : ""
        )}
      >
        {/* <!-- icone or profile pic --> */}
        <div className="mr-[16px] flex relative size-[48px] cursor-pointer items-center justify-center rounded-full border border-[#e5eaec] bg-[#ffffff] transition-all duration-300  ">
          <Image
            alt="Aerospace"
            draggable="true"
            src={img ? img : ""}
            className="size-full rounded-full shrink-0 "
            fill
          />
        </div>

        {/* <!-- text --> */}
        <div className="flex h-full grow flex-1 flex-col">
          {/* diyyYYyy */}
          <div className="text-[15px] font-semibold leading-[20px] text-[#0f1419] whitespace-nowrap ">
            <span className=" truncate ">
              {/* {username!} */}
              <span className="text-[15px] font-normal text-[#536471]">
                {name}
              </span>
            </span>
            {/* <!--  --> */}
          </div>
          <div className="text-[13px] font-normal leading-[20px] text-[#536471]">
            <span>You accepted the reauest</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
