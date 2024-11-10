import { Dispatch, SetStateAction, useEffect, useState } from "react";

type ChatScrollProps = {
  chatRef: React.RefObject<HTMLDivElement>;
  bottomRef: React.RefObject<HTMLDivElement>;
  shouldLoadMore: boolean;
  loadMore: () => void;
  count: number;
  setGoDown: Dispatch<SetStateAction<boolean>>;
};

export const useChatScroll = ({
  chatRef,
  bottomRef,
  shouldLoadMore,
  loadMore,
  count,
  setGoDown,
}: ChatScrollProps) => {
  const [hasInitialized, setHasInitialized] = useState(false);

  useEffect(() => {
    const topDiv = chatRef?.current;

    const handleScroll = () => {
      if (topDiv) {
        const distanceFromTop =
          topDiv?.scrollHeight + topDiv.scrollTop - topDiv.clientHeight;

        if (distanceFromTop === 0 && shouldLoadMore) {
          loadMore();
        }
      }
    };

    topDiv?.addEventListener("scroll", handleScroll);

    return () => {
      topDiv?.removeEventListener("scroll", handleScroll);
    };
  }, [shouldLoadMore, loadMore, chatRef]);

  useEffect(() => {
    const scrollElement = chatRef.current;

    const handleScroll = () => {
      if (scrollElement) {
        const distanceFromBottom = scrollElement.scrollTop;

        console.log("show", distanceFromBottom);
        distanceFromBottom < 0 ? setGoDown(false) : setGoDown(true);
      }
    };

    if (scrollElement) {
      scrollElement.addEventListener("scroll", handleScroll);
    }

    return () => {
      if (scrollElement) {
        scrollElement.removeEventListener("scroll", handleScroll);
      }
    };
  }, []);

  useEffect(() => {
    const container = bottomRef.current;
    const end = chatRef.current;

    if (container && end) {
      const observer = new MutationObserver(() => {
        end.scrollIntoView({ behavior: "instant", block: "end" });
      });

      observer.observe(container, {
        childList: true,
        subtree: true,
        attributes: true,
        characterData: true,
      });

      return () => observer.disconnect();
    }
  }, []);
};
