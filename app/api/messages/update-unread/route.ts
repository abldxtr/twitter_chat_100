// app/api/messages/update-unread/route.ts

import { NextResponse } from "next/server";
import { auth } from "@/auth";
import db from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const currentUser = await auth();
    const { chatId, messageId } = await req.json();

    if (!currentUser || !currentUser.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!chatId || !messageId) {
      return new NextResponse("Chat ID or Message ID missing", { status: 400 });
    }

    const chat = await db.chat.findUnique({
      where: { id: chatId },
    });

    if (!chat) {
      return new NextResponse("Chat not found", { status: 404 });
    }

    const unreadMessages = await db.message.count({
      where: {
        chatId,
        id: { gt: messageId },
        senderId: { not: currentUser.user.id },
      },
    });

    if (chat.initiatorId === currentUser.user.id) {
      await db.chat.update({
        where: { id: chatId },
        data: { unreadCountInitiator: unreadMessages },
      });
    } else {
      await db.chat.update({
        where: { id: chatId },
        data: { unreadCountParticipant: unreadMessages },
      });
    }

    return new NextResponse("Unread count updated", { status: 200 });
  } catch (error) {
    console.error("[UPDATE_UNREAD_COUNT]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
