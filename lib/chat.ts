// import { db } from "@/lib/db";

import db from "./prisma";

export const getOrCreateConversation = async (
  memberOneId: string,
  memberTwoId: string
) => {
  let conversation =
    (await findConversation(memberOneId, memberTwoId)) ||
    (await findConversation(memberTwoId, memberOneId));

  if (!conversation) {
    conversation = await createNewConversation(memberOneId, memberTwoId);
  }

  return conversation;
};

const findConversation = async (initiatorId: string, participantId: string) => {
  try {
    return await db.chat.findFirst({
      where: {
        AND: [{ initiatorId: initiatorId }, { participantId: participantId }],
      },
      include: {
        initiator: true,
        participant: true,
        messages: true,
      },
    });
  } catch {
    return null;
  }
};

const createNewConversation = async (
  initiatorId: string,
  participantId: string
) => {
  try {
    return await db.chat.create({
      data: {
        initiatorId,
        participantId,
      },
      include: {
        initiator: true,
        participant: true,
        messages: true,
      },
    });
  } catch {
    return null;
  }
};
