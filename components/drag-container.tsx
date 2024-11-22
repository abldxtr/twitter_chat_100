import { useGlobalContext } from "@/context/globalContext";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { DragEvent, useState } from "react";

type Props = {
  className?: string;
  children: React.ReactNode;
};

export default function DragContainer({ className, children }: Props) {
  const [isDragging, setIsDragging] = useState(false);
  const { imgTemp, setImgTemp } = useGlobalContext();

  const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const droppedFiles = Array.from(event.dataTransfer.files);
    const existingFiles = Array.from(imgTemp || []);

    // فیلتر کردن فایل‌های تکراری
    const newFiles = droppedFiles.filter(
      (file) =>
        !existingFiles.some(
          (existingFile) =>
            existingFile.name === file.name &&
            existingFile.size === file.size &&
            existingFile.lastModified === file.lastModified
        )
    );

    if (newFiles.length > 0) {
      const dataTransfer = new DataTransfer();
      [...existingFiles, ...newFiles].forEach((file) =>
        dataTransfer.items.add(file)
      );
      setImgTemp(dataTransfer.files);
    }

    setIsDragging(false);
  };

  return (
    <div
      className={cn("relative", className)}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <AnimatePresence>
        {isDragging && (
          <motion.div
            className="absolute inset-0 pointer-events-none dark:bg-zinc-900/90 z-10 flex justify-center items-center flex-col gap-1 bg-zinc-100/90"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div>Drag and drop files here</div>
            <div className="text-sm dark:text-zinc-400 text-zinc-500">
              {"(images only)"}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {children}
    </div>
  );
}
