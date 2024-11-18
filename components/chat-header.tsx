"use client";

import { user } from "@/lib/definitions";
import { BackMenue } from "./scroll-down";
import { useGlobalContext } from "@/context/globalContext";

export default function ChatHeader({ other }: { other?: user | undefined }) {
  const { mobileMenue, setMobileMenue, chatIdActive } = useGlobalContext();

  return (
    <div
      className="w-full  z-10 
    [box-shadow:_0px_1px_4px_0px_rgba(9,_30,_66),0.15)]
    "
    >
      <div className=" h-[53px] w-full bg-[#ffffffd9] backdrop-blur-md">
        <div className="flex h-full w-full flex-1 items-center justify-between px-[16px]">
          <div className=" flex items-center gap-x-4 ">
            <BackMenue func={() => setMobileMenue(!mobileMenue)} />
            <div className="w-full flex-1">
              <h2 className="py-[2px] text-[20px] font-bold leading-[24px] text-[#0f1419]">
                {chatIdActive?.name || other?.name}
              </h2>
            </div>
          </div>

          <div className="flex items-center">
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
