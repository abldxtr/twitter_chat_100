import { NextResponse } from "next/server";
import { auth } from "@/auth";
import db from "@/lib/prisma";
import { revalidatePath, revalidateTag } from "next/cache";

export async function POST(req: Request) {
  try {
    const currentUser = await auth();
    const { messageId } = await req.json();

    if (!currentUser || !currentUser.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!messageId || typeof messageId !== "string") {
      return new NextResponse("Message ID missing or invalid", {
        status: 400,
      });
    }

    const message = await db.message.findUnique({
      where: {
        id: messageId,
        // receiverId: currentUser.user.id,
        status: "SENT",
      },
      include: { chat: true },
    });

    if (!message) {
      return new NextResponse("Message not found or already read", {
        status: 404,
      });
    }

    // Update message status to "READ"
    await db.message.update({
      where: { id: messageId },
      data: { status: "READ" },
    });

    // Update unread count for the chat
    const updateField =
      message.chat.initiatorId === currentUser.user.id
        ? "unreadCountInitiator"
        : "unreadCountParticipant";

    await db.chat.update({
      where: { id: message.chatId },
      data: {
        [updateField]: { decrement: 1 },
      },
    });

    // Revalidate cache
    revalidateTag("fetchChat");
    revalidatePath("/", "layout");

    return new NextResponse("Status updated successfully", { status: 200 });
  } catch (error) {
    console.error("[MESSAGE_STATUS_UPDATE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
