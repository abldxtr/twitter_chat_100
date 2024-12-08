import { NextApiRequest } from "next";

import { NextApiResponseServerIo } from "@/types";
import db from "@/lib/prisma";
import { Message } from "@prisma/client";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponseServerIo
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { messageIds, userId } = req.body;
  if (!userId || !messageIds) {
    // return new NextResponse("Unauthorized", { status: 401 });
  }
  try {
    let messageIdsArray: string[];

    if (typeof messageIds === "string") {
      messageIdsArray = [messageIds];
    } else if (
      Array.isArray(messageIds) &&
      messageIds.every((id) => typeof id === "string")
    ) {
      messageIdsArray = messageIds;
    } else {
      // return new NextResponse("Invalid message ID(s) format", { status: 400 });
      return res.status(200).json({});
    }

    if (messageIdsArray.length === 0) {
      // return new NextResponse("No message IDs provided", { status: 400 });
    }

    const messages = await db.message.findMany({
      where: {
        id: { in: messageIdsArray },
        status: "SENT",
      },
      include: { chat: true },
    });

    if (messages.length === 0) {
      // return new NextResponse("No valid messages found", { status: 200 });
      return res.status(200).json({});
    }

    // Update message statuses to "READ"
    await db.message.updateMany({
      where: { id: { in: messageIdsArray }, status: "SENT" },
      data: { status: "READ" },
    });

    // Group messages by chat and calculate unread count decrements
    const chatUpdates = messages.reduce((acc, message) => {
      if (!acc[message.chatId]) {
        acc[message.chatId] = {
          initiatorDecrement: 0,
          participantDecrement: 0,
        };
      }
      if (message.chat.initiatorId === userId) {
        acc[message.chatId].initiatorDecrement++;
      } else {
        acc[message.chatId].participantDecrement++;
      }
      return acc;
    }, {} as Record<string, { initiatorDecrement: number; participantDecrement: number }>);

    // Update unread counts for all affected chats
    await Promise.all(
      Object.entries(chatUpdates).map(
        ([chatId, { initiatorDecrement, participantDecrement }]) =>
          db.chat.update({
            where: { id: chatId },
            data: {
              unreadCountInitiator: { decrement: initiatorDecrement },
              unreadCountParticipant: { decrement: participantDecrement },
            },
          })
      )
    );

    // Revalidate cache
  } catch (error) {
    console.error("[MESSAGE_STATUS_UPDATE]", error);
    return res.status(500).json({});
  }
  //   const { chatId } = req.query;
  //   console.log("server urls", urls);
  //   const receiverId = "ddddd";

  //   const channelKey = `chat:${receiverId}:messages`;

  // res?.socket?.server?.io?.emit(channelKey, rr);

  return res.status(200).json({});
}
