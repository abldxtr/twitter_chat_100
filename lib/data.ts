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
