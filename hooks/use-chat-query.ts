import qs from "query-string";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { useSocket } from "@/provider/socket-provider";
import { MessageData } from "@/lib/definitions";
import { useEffect, useTransition } from "react";
import { FileState, useGlobalContext } from "@/context/globalContext";
import { useEdgeStore } from "@/lib/edgestore";
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
  const { setUnreadMessages, final, setFinal } = useGlobalContext();
  const [_, startTransition] = useTransition();
  const queryClient = useQueryClient();
  const { edgestore } = useEdgeStore();
  const { setImgTemp } = useGlobalContext();
  function updateFileProgress(key: string, progress: FileState["progress"]) {
    setImgTemp((fileStates) => {
      const newFileStates = structuredClone(fileStates);
      const fileState = newFileStates.find(
        (fileState) => fileState.key === key
      );
      if (fileState) {
        fileState.progress = progress;
      }
      return newFileStates;
    });
  }

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
  //////////////////////////////////////

  // Optimistic Update برای ارسال پیام جدید
  const sendMessage = async (newMessage: any) => {
    console.log("newMessagesendmessaage", newMessage);
    queryClient.setQueryData([`${queryKey}`], (oldData: any) => {
      console.log("oldData", oldData);
      // console.log("[queryKey]", [queryKey]);

      return {
        ...oldData,
        pages: oldData.pages.map((page: any, index: number) => {
          if (index === 0) {
            return {
              ...page,
              items: [{ ...newMessage, statusOU: "SENDING" }, ...page.items],
            };
          }
          return page;
        }),
      };
    });
    const sendDatat = "/api/socket/messages";
    const { chatId, senderId, receiverId, content, type, images } = newMessage;

    let urls = [""];

    if (images) {
      const uploadPromises = images.map((file: any) =>
        edgestore.publicFiles.upload({
          file: file.file as File,
          onProgressChange: (progress) => {
            updateFileProgress(file.key, progress); // بروزرسانی درصد پیشرفت
          },
        })
      );

      const uploadedFiles = await Promise.all(uploadPromises);
      urls = uploadedFiles.map((file) => file.url);
      console.log("urls if", urls);
    }
    console.log("urls", urls);

    const url = qs.stringifyUrl(
      {
        url: sendDatat,
        query: {
          [paramKey]: paramValue,
        },
      },
      { skipNull: true }
    );

    try {
      // پیام به سرور ارسال می‌شود
      const res = await fetch(url, {
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
      const savedMessage = await res.json();
      // opupId: crypto.randomUUID(),
      const a = [`${queryKey}`];
      console.log("queryKeyaaaa", a);
      setImgTemp([]);
      if (type === "TEXT") {
        queryClient.invalidateQueries({ queryKey: [`${queryKey}`] });
      } else {
        queryClient.setQueryData([`${queryKey}`], (oldData: any) => {
          return {
            ...oldData,
            pages: oldData.pages.map((page: any) => {
              return {
                ...page,
                items: page.items.map((message: MessageData) =>
                  message.opupId === newMessage.opupId
                    ? { ...message, statusOU: "SUCCESS" }
                    : message
                ),
              };
            }),
          };
        });
        startTransition(async () => {
          queryClient.invalidateQueries({ queryKey: [`${queryKey}`] });
        });
      }

      // queryClient.invalidateQueries({
      //   queryKey: ["chat:cm3z5gifo000210g5xz9iw5yj"],
      // });

      // پیام ذخیره‌شده جایگزین پیام موقت می‌شود
    } catch (err) {
      console.error("Error sending message:", err);

      // پیام موقت حذف می‌شود
      queryClient.setQueryData([queryKey], (oldData: any) => {
        return {
          ...oldData,
          pages: oldData.pages.map((page: any) => {
            return {
              ...page,
              items: page.items.filter(
                (message: MessageData) => message.id !== newMessage.id
              ),
            };
          }),
        };
      });
    }
  };

  ///////////////////////////////////////////

  useEffect(() => {
    if (data?.pages[0]?.items) {
      const newUnreadCount = data.pages[0].items.filter(
        (message) =>
          message.senderId !== currentUser && message.status !== "READ"
      );
      const newUnreadMessages = data.pages[0].items.filter(
        (message) =>
          message.receiverId === currentUser && message.status === "SENT"
      );
      setUnreadMessages(newUnreadCount);
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
  }, [data, currentUser]);

  return {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
    sendMessage,
  };
};
