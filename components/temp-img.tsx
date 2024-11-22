import { useGlobalContext } from "@/context/globalContext";

export default function TempImg() {
  const { imgTemp, setImgTemp } = useGlobalContext();

  return (
    <>
      {imgTemp.length > 0 && (
        <div className="flex flex-wrap gap-4 m-[12px]">
          {imgTemp.map((url, index) => (
            <div
              key={index}
              className="relative w-[150px] h-[150px] overflow-hidden rounded-md"
            >
              <div className="absolute top-2 right-2">
                <div
                  className="w-[30px] h-[30px] bg-[#0f1419bf] rounded-full hover:bg-[#272c30bf] transition-all flex items-center justify-center cursor-pointer"
                  onClick={() =>
                    setImgTemp((prev) =>
                      prev.filter((_, imgIndex) => imgIndex !== index)
                    )
                  }
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
                src={url}
                alt={`uploaded-img-${index}`}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>
      )}
    </>
  );
}
