import { $Enums, User } from "@prisma/client";
import db from "./prisma";
import { unstable_cache } from "@/lib/unstable-cache";

// export const fetchChat = unstable_cache(
//   async () => {
//     const data = await db.user.findMany();

//     return data;
//   },
//   ["fetchChat"],
//   { tags: ["fetchChat"] }
// );

export const fetchChat = async (userId: string) => {
  const data = await db.chat.findMany({
    where: {
      OR: [{ initiatorId: userId }, { participantId: userId }],
      NOT: {
        AND: [{ initiatorId: userId }, { participantId: userId }],
      },
    },
    select: {
      id: true,
      messages: {
        orderBy: {
          createdAt: "desc",
        },
        take: 1,
        select: {
          content: true,
          createdAt: true,
          status: true,
          updatedAt: true,
          receiverId: true,
          senderId: true,
        },
      },
      initiator: true,
      participant: true,
    },
  });

  return data;
};

export const fetchChatsWithUnreadCount = async (userId: string) => {
  const chats = await db.chat.findMany({
    where: {
      OR: [{ initiatorId: userId }, { participantId: userId }],
      NOT: {
        AND: [{ initiatorId: userId }, { participantId: userId }],
      },
    },
    select: {
      id: true,
      unreadCountInitiator: true,
      unreadCountParticipant: true,
      initiator: true,
      participant: true,
      messages: {
        orderBy: {
          createdAt: "desc",
        },
        take: 1, // آخرین پیام برای هر چت
        select: {
          id: true,
          content: true,
          createdAt: true,
          status: true,
          senderId: true,
          receiverId: true,
        },
      },
    },
  });

  // محاسبه تعداد پیام‌های خوانده‌نشده برای هر کاربر
  const updatedChats = chats.map((chat) => {
    const isInitiator = chat.initiator.id === userId;
    const unreadCount = isInitiator
      ? chat.unreadCountInitiator
      : chat.unreadCountParticipant;

    return {
      ...chat,
      unreadCount,
    };
  });

  return updatedChats;
};

export const fetchChatt = unstable_cache(
  async (userId: string) => {
    const data = await db.chat.findMany({
      where: {
        OR: [{ initiatorId: userId }, { participantId: userId }],
      },
      select: {
        id: true,
        messages: {
          orderBy: {
            createdAt: "desc",
          },
          take: 1,
          select: {
            content: true,
            createdAt: true,
            status: true,
            updatedAt: true,
            receiverId: true,
            senderId: true,
          },
        },
        initiator: true,
        participant: true,
      },
    });

    return data;
  },
  ["fetchChat"],
  { tags: ["fetchChat"] }
);

// const usr = await fetchChatsWithUnreadCount("userId");

export type usr = {
  unreadCount: number;
  id: string;
  unreadCountInitiator: number;
  unreadCountParticipant: number;
  initiator: User;
  participant: User;
  messages: {
    id: string;
    createdAt: Date;
    content: string;
    senderId: string;
    receiverId: string;
    status: $Enums.MessageStatus;
    chatId: string;
    type: $Enums.MessageType;
    updatedAt: Date;
    opupId: string;
  }[];
};

// const updatedChats: {
//   unreadCount: number;
//   id: string;
//   unreadCountInitiator: number;
//   unreadCountParticipant: number;
//   initiator: {
//       id: string;
//       createdAt: Date;
//       updatedAt: Date;
//       name: string | null;
//       ... 9 more ...;
//       lastSeen: Date;
//   };
//   participant: {
//       id: string;
//       createdAt: Date;
//       updatedAt: Date;
//       name: string | null;
//       ... 9 more ...;
//       lastSeen: Date;
//   };
//   messages: {
//       ...;
//   }[];
// }[]

type MessageData = {
  id: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  senderId: string;
  receiverId: string;
  chatId: string;
  type: $Enums.MessageType;
  status: $Enums.MessageStatus;
};

// const usrM = usr.map((item) => item.messages.map((item) => item.status));
