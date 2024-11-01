import { useEmojiState } from "@/context/EmojiContext";
import classNames from "classnames";
import { forwardRef } from "react";
import data from "@emoji-mart/data";
import Picker from "@emoji-mart/react";

export const EmojiPicker = forwardRef<
  HTMLInputElement,
  {
    value?: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onSubmit?: (e: React.FormEvent) => void;
    handleEmoji: (emoji: any) => void;
  }
>(({ value, onChange, onSubmit, handleEmoji }, ref) => {
  const { openEmoji, setOpenEmoji, open, setOpen } = useEmojiState();

  return (
    <div className=" relative " onClick={() => setOpenEmoji(true)}>
      <button
        className="size-[34px] hover:bg-[#1d9bf01a] flex items-center justify-center rounded-full"
        onClick={() => setOpenEmoji(!openEmoji)}
      >
        <svg viewBox="0 0 24 24" className="size-[20px] fill-[#1d9bf0]">
          <g>
            <path d="M8 9.5C8 8.119 8.672 7 9.5 7S11 8.119 11 9.5 10.328 12 9.5 12 8 10.881 8 9.5zm6.5 2.5c.828 0 1.5-1.119 1.5-2.5S15.328 7 14.5 7 13 8.119 13 9.5s.672 2.5 1.5 2.5zM12 16c-2.224 0-3.021-2.227-3.051-2.316l-1.897.633c.05.15 1.271 3.684 4.949 3.684s4.898-3.533 4.949-3.684l-1.896-.638c-.033.095-.83 2.322-3.053 2.322zm10.25-4.001c0 5.652-4.598 10.25-10.25 10.25S1.75 17.652 1.75 12 6.348 1.75 12 1.75 22.25 6.348 22.25 12zm-2 0c0-4.549-3.701-8.25-8.25-8.25S3.75 7.451 3.75 12s3.701 8.25 8.25 8.25 8.25-3.701 8.25-8.25z"></path>
          </g>
        </svg>
      </button>

      {openEmoji && (
        <div
          className={classNames(
            " absolute  bottom-full isolate  right-[-16rem] z-[100]   "
            // openEmoji ? " flex " : "opacity-0 pointer-events-none hidden",
          )}
          ref={ref}
        >
          <Picker
            data={data}
            onEmojiSelect={handleEmoji}
            emojiSize={18}
            searchPosition="none"
            onClickOutside={() => setOpenEmoji(false)}
            maxFrequentRows={0}
            perLine={8}
            showPreview={false}
          />
        </div>
      )}
    </div>
  );
});

EmojiPicker.displayName = "EmojiPicker";
