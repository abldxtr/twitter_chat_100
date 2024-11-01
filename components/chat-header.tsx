// "use client";

import { user } from "@/lib/definitions";
// import { useParams } from "next/navigation";

export default function ChatHeader({ other }: { other: user | undefined }) {
  // const param = useParams<{ conversationId: string }>();
  // console.log("param", param.conversationId);
  return (
    <div className="w-full  z-10 ">
      <div className=" h-[53px] w-full bg-[#ffffffd9] backdrop-blur-md">
        <div className="flex h-full w-full flex-1 items-center justify-between px-[16px]">
          {/* <!-- 1 --> */}
          <div className="w-full flex-1">
            <h2 className="py-[2px] text-[20px] font-bold leading-[24px] text-[#0f1419]">
              {/* GE Aerospace */}
              {other?.name}
            </h2>
          </div>

          {/* <!-- 2 --> */}
          <div className="flex items-center">
            {/* <!-- 1svg --> */}
            <div className="flex size-[36px] cursor-pointer items-center justify-center rounded-full transition-all duration-300 hover:bg-[#0f14191a]">
              <svg
                viewBox="0 0 24 24"
                aria-hidden="true"
                className="size-[20px]"
              >
                <g>
                  <path d="M13.5 8.5c0 .83-.67 1.5-1.5 1.5s-1.5-.67-1.5-1.5S11.17 7 12 7s1.5.67 1.5 1.5zM13 17v-5h-2v5h2zm-1 5.25c5.66 0 10.25-4.59 10.25-10.25S17.66 1.75 12 1.75 1.75 6.34 1.75 12 6.34 22.25 12 22.25zM20.25 12c0 4.56-3.69 8.25-8.25 8.25S3.75 16.56 3.75 12 7.44 3.75 12 3.75s8.25 3.69 8.25 8.25z"></path>
                </g>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
