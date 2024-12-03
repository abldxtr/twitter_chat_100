import { useCallback, useEffect, useRef } from "react";
import {
  useInfiniteQuery,
  useQueryClient,
  useMutation,
} from "@tanstack/react-query";
import qs from "query-string";
import { useSocket } from "@/provider/socket-provider";
import { useGlobalContext } from "@/context/globalContext";
import { useEdgeStore } from "@/lib/edgestore";
import { MessageData } from "@/lib/definitions";
import { FileState } from "@/context/globalContext";

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
  const { setUnreadMessages, setFinal, setImgTemp } = useGlobalContext();
  const queryClient = useQueryClient();
  const { edgestore } = useEdgeStore();
  const uploadProgressRef = useRef<{ [key: string]: number }>({});

  const fetchMessages = async ({ pageParam = undefined }) => {
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
      getNextPageParam: (lastPage) => lastPage?.nextCursor,
      initialPageParam: undefined,
    });

  const updateFileProgress = useCallback(
    (key: string, progress: number) => {
      uploadProgressRef.current[key] = progress;
      setImgTemp((prevState) =>
        prevState.map((fileState) =>
          fileState.key === key ? { ...fileState, progress } : fileState
        )
      );
    },
    [setImgTemp]
  );

  const sendMessageMutation = useMutation({
    mutationFn: async (newMessage: any) => {
      const { chatId, senderId, receiverId, content, type, images } =
        newMessage;
      let urls: string[] = [];

      if (images && images.length > 0) {
        const uploadPromises = images.map((file: FileState) =>
          edgestore.publicFiles.upload({
            file: file.file as File,
            onProgressChange: (progress) => {
              updateFileProgress(file.key, progress);
            },
          })
        );

        const uploadedFiles = await Promise.all(uploadPromises);
        urls = uploadedFiles.map((file) => file.url);
      }

      const sendDataUrl = qs.stringifyUrl(
        {
          url: "/api/socket/messages",
          query: { [paramKey]: paramValue },
        },
        { skipNull: true }
      );

      const res = await fetch(sendDataUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          senderId,
          receiverId,
          content,
          id: chatId,
          type,
          urls,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to send message");
      }

      return res.json();
    },
    onMutate: (newMessage) => {
      queryClient.setQueryData([queryKey], (oldData: any) => ({
        ...oldData,
        pages: oldData.pages.map((page: any, index: number) =>
          index === 0
            ? {
                ...page,
                items: [{ ...newMessage, statusOU: "SENDING" }, ...page.items],
              }
            : page
        ),
      }));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [queryKey] });
      setImgTemp([]);
    },
    onError: (error, newMessage) => {
      console.error("Error sending message:", error);
      queryClient.setQueryData([queryKey], (oldData: any) => ({
        ...oldData,
        pages: oldData.pages.map((page: any) => ({
          ...page,
          items: page.items.filter(
            (message: MessageData) => message.id !== newMessage.id
          ),
        })),
      }));
    },
  });

  useEffect(() => {
    if (data?.pages[0]?.items) {
      const newUnreadMessages = data.pages[0].items.filter(
        (message) =>
          message.receiverId === currentUser && message.status === "SENT"
      );
      setUnreadMessages(newUnreadMessages);
      setFinal((prevFinal) => {
        const chatIndex = prevFinal.findIndex(
          (chat) => Object.keys(chat)[0] === paramValue
        );
        if (chatIndex !== -1) {
          const updatedFinal = [...prevFinal];
          updatedFinal[chatIndex] = { [paramValue]: newUnreadMessages };
          return updatedFinal;
        } else {
          return [...prevFinal, { [paramValue]: newUnreadMessages }];
        }
      });
    }
  }, [data, currentUser, paramValue, setUnreadMessages, setFinal]);

  return {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
    sendMessage: sendMessageMutation.mutate,
    isLoading: sendMessageMutation.isPending,
  };
};
