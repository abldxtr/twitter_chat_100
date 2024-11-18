import qs from "query-string";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useSocket } from "@/provider/socket-provider";
import { MessageData } from "@/lib/definitions";
import { useEffect } from "react";
import { useGlobalContext } from "@/context/globalContext";
// import { data } from "@/lib/definitions";

// import { useSocket } from "@/components/providers/socket-provider";

interface ChatQueryProps {
  queryKey: string;
  apiUrl: string;
  paramKey: "chatId";
  paramValue: string;
  currentUser: string;
}
interface MessagesResponse {
  items: MessageData[];
  nextCursor: string | null;
}

export const useChatQuery = ({
  queryKey,
  apiUrl,
  paramKey,
  paramValue,
  currentUser,
}: ChatQueryProps) => {
  const { isConnected } = useSocket();
  const { setUnreadMessages } = useGlobalContext();
  // const isConnected = false;

  const fetchMessages = async ({
    pageParam = undefined,
  }: {
    pageParam?: string;
  }) => {
    const url = qs.stringifyUrl(
      {
        url: apiUrl,
        query: {
          cursor: pageParam,
          [paramKey]: paramValue,
        },
      },
      { skipNull: true }
    );

    const res = await fetch(url);
    return res.json() as Promise<MessagesResponse>;
  };

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status } =
    useInfiniteQuery({
      queryKey: [queryKey],
      queryFn: fetchMessages,
      getNextPageParam: (lastPage) => {
        // console.log("lastPage", lastPage);

        return lastPage?.nextCursor;
      },
      // refetchInterval: isConnected ? false : 10000,
      initialPageParam: undefined,
    });

  useEffect(() => {
    if (data?.pages[0]?.items) {
      const newUnreadCount = data.pages[0].items.filter(
        (message) =>
          message.senderId !== currentUser && message.status !== "READ"
      );
      setUnreadMessages(newUnreadCount);
    }
  }, [data, currentUser]);

  return {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
  };
};
