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

  try {
    const { content, senderId, receiverId, id, type, urls } = req.body;
    const { chatId } = req.query;
    console.log("server urls", urls);

    if (!chatId) {
      return res.status(400).json({ error: "Server ID missing" });
    }

    if (type === "IMAGE") {
      console.log("yes imageee");
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
      const updateField =
        chat.initiatorId === senderId
          ? "unreadCountParticipant"
          : "unreadCountInitiator";

      await db.chat.update({
        where: { id: chatId as string },
        data: {
          [updateField]: { increment: 1 },
        },
      });

      const message = await db.message.create({
        data: {
          content: content as string,
          chatId: chatId as string,
          senderId: senderId as string,
          receiverId: receiverId as string,
          status: "SENT",
          type,
        },
      });

      for (const url of urls) {
        await db.messageImage.create({
          data: {
            url,
            messageId: message.id,
            chatId: message.chatId,
          },
        });
      }

      let messages = [];
      const aaa = await db.message.findFirst({
        where: {
          chatId: chatId as string,
        },
        include: {
          receiver: {
            select: {
              id: true,
              name: true,
              image: true,
              email: true,
              lastSeen: true,
            },
          },
          sender: {
            select: {
              id: true,
              name: true,
              image: true,
              email: true,
              lastSeen: true,
            },
          },
          images: true,
          chat: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      const idd = aaa?.id;
      const contentt = aaa?.content;
      const createdAtt = aaa?.createdAt;
      const updatedAtt = aaa?.updatedAt;
      const senderIdd = aaa?.senderId!;
      const receiverIdd = aaa?.receiverId;
      const chatIdd = aaa?.chatId!;
      const typee = aaa?.type!;
      const statuss = aaa?.status!;
      // const statusOU = aaa?.st
      const opupIdd = aaa?.opupId;
      const imagess = aaa?.images;

      const rr = {
        id,
        content,
        createdAt: createdAtt!,
        updatedAt: updatedAtt!,
        senderId: senderIdd,
        receiverId: receiverIdd,
        chatId: chatIdd,
        type: typee,
        opupId: opupIdd!,
        images: imagess,
        status: statuss!,
      };

      const channelKey = `chat:${receiverId}:messages`;

      res?.socket?.server?.io?.emit(channelKey, rr);

      return res.status(200).json(rr);
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
    const updateField =
      chat.initiatorId === senderId
        ? "unreadCountParticipant"
        : "unreadCountInitiator";

    await db.chat.update({
      where: { id: chatId as string },
      data: {
        [updateField]: { increment: 1 },
      },
    });

    const message = await db.message.create({
      data: {
        content: content as string,
        chatId: chatId as string,
        senderId: senderId as string,
        receiverId: receiverId as string,
        status: "SENT",
        type,
      },
    });

    // console.log("message Idddd", message);

    // const channelKey = `chat:${chatId}:messages`;
    const channelKey = `chat:${receiverId}:messages`;
    // const SenderKey = `chat:${senderId}:messages`;

    res?.socket?.server?.io?.emit(channelKey, message);
    // res?.socket?.server?.io?.emit(SenderKey, message);

    return res.status(200).json(message);
  } catch (error) {
    console.log("[MESSAGES_POST]", error);
    return res.status(500).json({ message: "Internal Error" });
  }
}
