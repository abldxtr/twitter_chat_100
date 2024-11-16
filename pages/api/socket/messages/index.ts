import { NextApiRequest } from "next";

import { NextApiResponseServerIo } from "@/types";
import db from "@/lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponseServerIo
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { content, senderId, reeciverId, id } = req.body;
    const { chatId } = req.query;

    if (!chatId) {
      return res.status(400).json({ error: "Server ID missing" });
    }

    if (!content) {
      return res.status(400).json({ error: "Content missing" });
    }

    const chat = await db.chat.findFirst({
      where: {
        id: chatId as string,
      },
      include: {
        initiator: true,
        participant: true,
      },
    });

    if (!chat) {
      return res.status(404).json({ message: "chat not found" });
    }

    const message = await db.message.create({
      data: {
        content: content as string,
        chatId: chatId as string,
        senderId: senderId as string,
        receiverId: reeciverId as string,
        status: "SENT",
        type: "TEXT",
      },
    });

    const channelKey = `chat:${chatId}:messages`;

    res?.socket?.server?.io?.emit(channelKey, message);

    return res.status(200).json(message);
  } catch (error) {
    console.log("[MESSAGES_POST]", error);
    return res.status(500).json({ message: "Internal Error" });
  }
}
