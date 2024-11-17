// app/api/messages/update-status/route.ts
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import db from "@/lib/prisma";
import { revalidatePath, revalidateTag } from "next/cache";

export async function POST(req: Request) {
  try {
    const currentUser = await auth();
    const { chatId } = await req.json();

    if (!currentUser || !currentUser.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!chatId) {
      return new NextResponse("Chat ID missing", { status: 400 });
    }

    const chat = await db.chat.findUnique({
      where: { id: chatId },
      include: { messages: true },
    });

    if (!chat) {
      return new NextResponse("Chat not found", { status: 404 });
    }

    // Update all unread messages to READ
    await db.message.updateMany({
      where: {
        chatId: chatId,
        receiverId: currentUser.user.id,
        status: { not: "READ" },
      },
      data: { status: "READ" },
    });

    // Reset unread count
    if (chat.initiatorId === currentUser.user.id) {
      await db.chat.update({
        where: { id: chatId },
        data: { unreadCountInitiator: 0 },
      });
    } else {
      await db.chat.update({
        where: { id: chatId },
        data: { unreadCountParticipant: 0 },
      });
    }
    revalidateTag("fetchChat");
    revalidatePath("/", "layout");

    return new NextResponse("All messages marked as read", { status: 200 });
  } catch (error) {
    console.error("[MESSAGE_STATUS_UPDATE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
