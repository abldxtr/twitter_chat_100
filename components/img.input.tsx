"use client";

import { useGlobalContext } from "@/context/globalContext";
import { ChangeEvent, useRef, useState } from "react";

export default function ImgInput() {
  const imagesRef = useRef<HTMLInputElement | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const { imgTemp, setImgTemp } = useGlobalContext();

  const handleImages = (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const existingFiles = Array.from(imgTemp || []);

    // جلوگیری از آپلود فایل‌های تکراری
    const newFiles = files.filter(
      (file) =>
        !existingFiles.some(
          (existingFile) =>
            existingFile.name === file.name &&
            existingFile.size === file.size &&
            existingFile.lastModified === file.lastModified
        )
    );

    if (newFiles.length === 0) {
      setErrorMsg("فایل‌های انتخاب شده تکراری هستند.");
      return;
    }

    // ترکیب فایل‌های جدید با فایل‌های قبلی
    const dataTransfer = new DataTransfer();
    [...existingFiles, ...newFiles].forEach((file) =>
      dataTransfer.items.add(file)
    );
    setImgTemp(dataTransfer.files);

    setErrorMsg(""); // پاک کردن پیام خطا (در صورت وجود)
  };

  return (
    <div>
      <input
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        ref={imagesRef}
        multiple
        hidden
        onChange={(e) => handleImages(e)}
      />

      {errorMsg && <p className="text-red-500">{errorMsg}</p>}

      <button
        className="size-[34px] hover:bg-[#1d9bf01a] flex items-center justify-center transition-all duration-300 rounded-full"
        onClick={() => imagesRef.current?.click()}
      >
        <svg
          viewBox="0 0 24 24"
          aria-hidden="true"
          className="size-[20px] shrink-0 fill-[#1d9bf0]"
        >
          <g>
            <path d="M3 5.5C3 4.119 4.119 3 5.5 3h13C19.881 3 21 4.119 21 5.5v13c0 1.381-1.119 2.5-2.5 2.5h-13C4.119 21 3 19.881 3 18.5v-13zM5.5 5c-.276 0-.5.224-.5.5v9.086l3-3 3 3 5-5 3 3V5.5c0-.276-.224-.5-.5-.5h-13zM19 15.414l-3-3-5 5-3-3-3 3V18.5c0 .276.224.5.5.5h13c.276 0 .5-.224.5-.5v-3.086zM9.75 7C8.784 7 8 7.784 8 8.75s.784 1.75 1.75 1.75 1.75-.784 1.75-1.75S10.716 7 9.75 7z"></path>
          </g>
        </svg>
      </button>
    </div>
  );
}
