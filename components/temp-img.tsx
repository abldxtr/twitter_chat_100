import { useGlobalContext } from "@/context/globalContext";

export default function TempImg() {
  const { imgTemp, setImgTemp } = useGlobalContext();

  console.log("imgTemp", imgTemp);

  if (!imgTemp) {
    return null;
  }

  return (
    <>
      {imgTemp.length > 0 && (
        <div className="flex flex-wrap gap-4 m-[12px]">
          {Array.from(imgTemp).map((file, index) => {
            const fileUrl = URL.createObjectURL(file);

            return (
              <div
                key={index}
                className="relative w-[150px] h-[150px] overflow-hidden rounded-md"
              >
                <div className="absolute top-2 right-2">
                  <div
                    className="w-[30px] h-[30px] bg-[#0f1419bf] rounded-full hover:bg-[#272c30bf] transition-all flex items-center justify-center cursor-pointer"
                    onClick={() => {
                      const dataTransfer = new DataTransfer();
                      Array.from(imgTemp)
                        .filter((_, i) => i !== index)
                        .forEach((file) => dataTransfer.items.add(file));
                      setImgTemp(dataTransfer.files);
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
                  src={fileUrl}
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
