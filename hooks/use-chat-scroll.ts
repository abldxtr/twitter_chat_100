import { useEffect, useState } from "react";

type ChatScrollProps = {
  chatRef: React.RefObject<HTMLDivElement>;
  bottomRef: React.RefObject<HTMLDivElement>;
  shouldLoadMore: boolean;
  loadMore: () => void;
  count: number;
};

export const useChatScroll = ({
  chatRef,
  bottomRef,
  shouldLoadMore,
  loadMore,
  count,
}: ChatScrollProps) => {
  const [hasInitialized, setHasInitialized] = useState(false);

  useEffect(() => {
    const topDiv = chatRef?.current;

    const handleScroll = () => {
      const scrollTop = topDiv?.scrollTop;
      if (topDiv) {
        const distanceFromTop =
          topDiv?.scrollHeight + topDiv.scrollTop - topDiv.clientHeight;

        // const distanceFromTop = topDiv.scrollTop;
        // console.log(
        //   topDiv?.scrollHeight,
        //   topDiv.scrollTop,
        //   topDiv.clientHeight
        // );
        // console.log("distanceFromTop", distanceFromTop);
        if (distanceFromTop === 0 && shouldLoadMore) {
          loadMore();
        }
      }

      // console.log("scrolltop", scrollTop);

      // if (scrollTop === 0 && shouldLoadMore) {
      //   loadMore();
      // }
    };

    topDiv?.addEventListener("scroll", handleScroll);

    return () => {
      topDiv?.removeEventListener("scroll", handleScroll);
    };
  }, [shouldLoadMore, loadMore, chatRef]);
};
