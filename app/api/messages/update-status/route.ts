import { NextResponse } from "next/server";
import { auth } from "@/auth";
import db from "@/lib/prisma";
import { revalidatePath, revalidateTag } from "next/cache";

export async function POST(req: Request) {
  try {
    const currentUser = await auth();
    const { messageIds } = await req.json();

    if (!currentUser || !currentUser.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    let messageIdsArray: string[];

    if (typeof messageIds === "string") {
      messageIdsArray = [messageIds];
    } else if (
      Array.isArray(messageIds) &&
      messageIds.every((id) => typeof id === "string")
    ) {
      messageIdsArray = messageIds;
    } else {
      return new NextResponse("Invalid message ID(s) format", { status: 400 });
    }

    if (messageIdsArray.length === 0) {
      return new NextResponse("No message IDs provided", { status: 400 });
    }

    const messages = await db.message.findMany({
      where: {
        id: { in: messageIdsArray },
        status: "SENT",
      },
      include: { chat: true },
    });

    if (messages.length === 0) {
      return new NextResponse("No valid messages found", { status: 404 });
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
      if (message.chat.initiatorId === currentUser.user.id) {
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
    revalidateTag("fetchChat");
    revalidatePath("/", "layout");

    return new NextResponse("Statuses updated successfully", { status: 200 });
  } catch (error) {
    console.error("[MESSAGE_STATUS_UPDATE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// import { NextResponse } from "next/server";
// import { auth } from "@/auth";
// import db from "@/lib/prisma";
// import { revalidatePath, revalidateTag } from "next/cache";

// export async function POST(req: Request) {
//   try {
//     const currentUser = await auth();
//     const { messageId } = await req.json();

//     if (!currentUser || !currentUser.user) {
//       return new NextResponse("Unauthorized", { status: 401 });
//     }

//     if (!messageId || typeof messageId !== "string") {
//       return new NextResponse("Message ID missing or invalid", {
//         status: 400,
//       });
//     }

//     const message = await db.message.findUnique({
//       where: {
//         id: messageId,
//         // receiverId: currentUser.user.id,
//         status: "SENT",
//       },
//       include: { chat: true },
//     });

//     if (!message) {
//       return new NextResponse("Message not found or already read", {
//         status: 404,
//       });
//     }

//     // Update message status to "READ"
//     await db.message.update({
//       where: { id: messageId },
//       data: { status: "READ" },
//     });

//     // Update unread count for the chat
//     const updateField =
//       message.chat.initiatorId === currentUser.user.id
//         ? "unreadCountInitiator"
//         : "unreadCountParticipant";

//     await db.chat.update({
//       where: { id: message.chatId },
//       data: {
//         [updateField]: { decrement: 1 },
//       },
//     });

//     // Revalidate cache
//     revalidateTag("fetchChat");
//     revalidatePath("/", "layout");

//     return new NextResponse("Status updated successfully", { status: 200 });
//   } catch (error) {
//     console.error("[MESSAGE_STATUS_UPDATE]", error);
//     return new NextResponse("Internal Error", { status: 500 });
//   }
// }
