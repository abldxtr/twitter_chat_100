import {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useRef,
} from "react";

type ChatScrollProps = {
  chatRef: React.RefObject<HTMLDivElement>;
  bottomRef: React.RefObject<HTMLDivElement>;
  shouldLoadMore: boolean;
  loadMore: () => void;
  setGoDown: Dispatch<SetStateAction<boolean>>;
};

export const useChatScroll = ({
  chatRef,
  bottomRef,
  shouldLoadMore,
  loadMore,
  setGoDown,
}: ChatScrollProps) => {
  useEffect(() => {
    const topDiv = chatRef?.current;
    const handleScroll = () => {
      if (topDiv) {
        const distanceFromTop =
          topDiv.scrollHeight + topDiv.scrollTop - topDiv.clientHeight;
        const distanceFromBottom = topDiv.scrollTop;

        setGoDown(distanceFromBottom < 0);

        if (distanceFromTop < 100 && shouldLoadMore) {
          loadMore();
        }
      }
    };

    topDiv?.addEventListener("scroll", handleScroll);

    return () => {
      topDiv?.removeEventListener("scroll", handleScroll);
    };
  }, [shouldLoadMore, loadMore, chatRef, setGoDown]);
};
