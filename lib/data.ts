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
      OR: [
        { initiatorId: userId }, // کاربر به‌عنوان initiator
        { participantId: userId }, // کاربر به‌عنوان participant
      ],
      NOT: {
        AND: [
          { initiatorId: userId }, // چت‌هایی که initiator همان کاربر است
          { participantId: userId }, // و participant هم همان کاربر است
        ],
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
