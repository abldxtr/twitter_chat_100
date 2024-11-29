import { FileState, useGlobalContext } from "@/context/globalContext";
import { AnimatePresence, motion } from "framer-motion";
import { useEdgeStore } from "@/lib/edgestore";
import { CircleProgress } from "./circle-progress";
import { useMemo } from "react";

export default function TempImg() {
  const { imgTemp, setImgTemp } = useGlobalContext();
  const { edgestore } = useEdgeStore();

  const imageUrls = useMemo(() => {
    if (imgTemp) {
      // console.log("imgTempimgTemp", imgTemp);
      return imgTemp.map((fileState) => {
        if (typeof fileState.file === "string") {
          // in case an url is passed in, use it to display the image
          return fileState.file;
        } else {
          // in case a file is passed in, create a base64 url to display the image
          return URL.createObjectURL(fileState.file);
        }
      });
    }
    return [];
  }, [imgTemp]);

  console.log("imageUrls", imageUrls);

  // if (!imgTemp) {
  //   return null;
  // }

  // function updateFileProgress(key: string, progress: FileState["progress"]) {
  //   setImgTemp((fileStates) => {
  //     const newFileStates = structuredClone(fileStates);
  //     const fileState = newFileStates.find(
  //       (fileState) => fileState.key === key
  //     );
  //     if (fileState) {
  //       fileState.progress = progress;
  //     }
  //     return newFileStates;
  //   });
  // }

  return (
    <>
      {imgTemp.length > 0 && (
        <div className="flex flex-wrap gap-4 m-[12px]">
          {Array.from(imgTemp).map((file, index) => {
            return (
              <div
                key={index}
                className="relative w-[150px] h-[150px] overflow-hidden rounded-md"
                // onClick={async () => {
                //   try {
                //     const res = await edgestore.publicFiles.upload({
                //       file: file.file as File,
                //       onProgressChange: async (progress) => {
                //         updateFileProgress(file.key, progress);
                //         if (progress === 100) {
                //           await new Promise((resolve) =>
                //             setTimeout(resolve, 1000)
                //           );
                //           updateFileProgress(file.key, "COMPLETE");
                //         }
                //       },
                //     });
                //     // console.log(res);
                //   } catch (err) {
                //     updateFileProgress(file.key, "ERROR");
                //   }
                // }}
              >
                {typeof file.progress === "number" && (
                  <CircleProgress progress={file.progress} />
                )}
                <div className="absolute top-2 right-2">
                  <div
                    className="w-[30px] h-[30px] bg-[#0f1419bf] rounded-full hover:bg-[#272c30bf] transition-all flex items-center justify-center cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      setImgTemp((prev) => prev.filter((_, i) => i !== index));
                    }}
                  >
                    <svg
                      viewBox="0 0 24 24"
                      className="w-[18px] h-[18px] fill-white"
                    >
                      <g>
                        <path d="M10.59 12L4.54 5.96l1.42-1.42L12 10.59l6.04-6.05 1.42 1.42L13.41 12l6.05 6.04-1.42 1.42L12 13.41l-6.04 6.05-1.42-1.42L10.59 12z"></path>
                      </g>
                    </svg>
                  </div>
                </div>
                <img
                  // src={fileUrl}
                  src={imageUrls[index]}
                  alt={`uploaded-img-${index}`}
                  className="w-full h-full object-cover"
                />
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
