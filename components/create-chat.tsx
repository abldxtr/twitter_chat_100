"use client";

import { createChat, createChatFromId } from "@/lib/actions";
import { cn } from "@/lib/utils";
import { useRef, useState, useTransition } from "react";

import { useRouter } from "next/navigation";
import { useGlobalContext } from "@/context/globalContext";
import { CirclePlus } from "lucide-react";
import { useOnClickOutside } from "usehooks-ts";
import { BeatLoader } from "react-spinners";
import { useQueryClient, useMutation } from "@tanstack/react-query";

export function CreateChat() {
  const { openChatCreate, setOpenChatCreate } = useGlobalContext();

  const [userId, setUserId] = useState("");
  const router = useRouter();
  const ref = useRef<HTMLDivElement | null>(null);
  const queryClient = useQueryClient();

  const handleClickOutside = () => {
    // Your custom logic here
    setOpenChatCreate(false);
  };

  useOnClickOutside(ref, handleClickOutside);

  const [pending, startTransition] = useTransition();
  async function handleSubmit() {
    startTransition(async () => {
      const { success, message } = await createChatFromId({ userId });

      if (success) {
        queryClient.invalidateQueries({ queryKey: ["userList"] });
        setOpenChatCreate(false);

        router.push(message);
      } else {
        console.log("there is a problem");
      }
    });
  }
  if (!openChatCreate) {
    return null;
  }

  return (
    <div className=" fixed inset-0 flex items-center justify-center z-[100] ">
      <div
        className=" w-[380px] max-w-[380px] rounded-sm border border-gray-100/80 bg-gray-300 p-8   "
        ref={ref}
      >
        <input
          type="text"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          className=" w-full p-2 mb-2 "
          placeholder="userId"
        />
        <button
          type="submit"
          onClick={handleSubmit}
          className={cn(
            "w-full py-4 px-6 bg-blue-400 text-white text-xl font-semibold "
          )}
          disabled={pending}
        >
          {pending ? <BeatLoader size={5} color="#ffffff" /> : "create"}
        </button>
      </div>
    </div>
  );
}

export function CreateChatIcon() {
  const { openChatCreate, setOpenChatCreate } = useGlobalContext();
  return (
    <div
      className=" absolute bottom-4 z-[100] right-4 size-[56px] rounded-full bg-blue-400  flex items-center justify-center cursor-pointer "
      onClick={() => {
        setOpenChatCreate(true);
      }}
    >
      <CirclePlus className="  " color="white" />
    </div>
  );
}
