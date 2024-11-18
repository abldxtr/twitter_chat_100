import { useMessage2 } from "@/context/MessageContext";

export default function TempImg() {
  const { messages, setMessages, imgtemp, setImgTemp } = useMessage2();

  const handleDeleteTempImg = () => {
    setImgTemp([]);
  };

  return (
    <>
      {imgtemp.length > 0 && (
        <div className="flex m-[12px] ">
          <div className=" size-[150px] shrike-0 overflow-hidden relative  ">
            {/* close icon */}
            <div className=" absolute top-2 right-2   ">
              <div
                className=" size-[30px] shrink-0 bg-[#0f1419bf] rounded-full hover:bg-[#272c30bf] transition-all flex items-center justify-center "
                onClick={handleDeleteTempImg}
              >
                <svg
                  viewBox="0 0 24 24"
                  className=" size-[18px] shrink-0 fill-white  "
                >
                  <g>
                    <path d="M10.59 12L4.54 5.96l1.42-1.42L12 10.59l6.04-6.05 1.42 1.42L13.41 12l6.05 6.04-1.42 1.42L12 13.41l-6.04 6.05-1.42-1.42L10.59 12z"></path>
                  </g>
                </svg>
              </div>
            </div>
            {imgtemp.map((url, index) => (
              <img
                key={index}
                src={url}
                alt={`uploaded-img-${index}`}
                className="size-[150px] bg-[#0f1419bf] shrike-0 hover:bg-[#272c30bf] object-cover "
              />
            ))}
          </div>
        </div>
      )}
    </>
  );
}
