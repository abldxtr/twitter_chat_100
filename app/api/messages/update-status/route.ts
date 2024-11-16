// app/api/messages/update-status/route.ts
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import db from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const currentUser = await auth();
    const { messageId } = await req.json();

    if (!currentUser || !currentUser.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!messageId) {
      return new NextResponse("Message ID missing", { status: 400 });
    }

    const message = await db.message.findUnique({
      where: { id: messageId },
      include: { chat: true },
    });

    if (!message) {
      return new NextResponse("Message not found", { status: 404 });
    }

    if (message.receiverId === currentUser.user.id) {
      await db.message.update({
        where: { id: messageId },
        data: { status: "READ" },
      });

      // Update unread count
      if (message.chat.initiatorId === currentUser.user.id) {
        await db.chat.update({
          where: { id: message.chatId },
          data: {
            unreadCountInitiator: {
              decrement: 1,
            },
          },
        });
      } else {
        await db.chat.update({
          where: { id: message.chatId },
          data: {
            unreadCountParticipant: {
              decrement: 1,
            },
          },
        });
      }
    }

    return new NextResponse("Status updated", { status: 200 });
  } catch (error) {
    console.error("[MESSAGE_STATUS_UPDATE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
