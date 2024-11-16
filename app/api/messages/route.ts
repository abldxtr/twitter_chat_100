import { NextResponse } from "next/server";
import { Message } from "@prisma/client";
import { auth } from "@/auth";
import db from "@/lib/prisma";
import { revalidatePath, revalidateTag } from "next/cache";
// import { unstable_after as after } from "next/server";

// import { currentProfile } from "@/lib/current-profile";
// import { db } from "@/lib/db";

const MESSAGES_BATCH = 30;

export async function GET(req: Request) {
  try {
    const currentUser = await auth();
    const { searchParams } = new URL(req.url);

    const cursor = searchParams.get("cursor");
    const chatId = searchParams.get("chatId");
    // console.log("api/message", currentUser);
    // console.log("api/message searchparam", cursor);

    // console.log("api/message", chatId);

    if (!currentUser || !currentUser.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!chatId) {
      return new NextResponse("Channel ID missing", { status: 400 });
    }

    let messages: Message[] = [];

    if (cursor) {
      messages = await db.message.findMany({
        take: MESSAGES_BATCH,
        skip: 1,
        cursor: {
          id: cursor,
        },
        where: {
          chatId,
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
        },
        orderBy: {
          createdAt: "desc",
        },
      });
    } else {
      messages = await db.message.findMany({
        take: MESSAGES_BATCH,
        where: {
          chatId,
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
        },
        orderBy: {
          createdAt: "desc",
        },
      });
    }

    let nextCursor = null;

    if (messages.length === MESSAGES_BATCH) {
      nextCursor = messages[MESSAGES_BATCH - 1].id;
    }

    // Update unread count
    const chat = await db.chat.findUnique({
      where: { id: chatId },
    });

    if (chat) {
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
    }

    // after(() => {
    revalidateTag("fetchChat");
    revalidatePath("/", "layout");

    // Execute after the layout is rendered and sent to the user
    // });

    return NextResponse.json({
      items: messages,
      nextCursor,
    });
  } catch (error) {
    // console.log("[MESSAGES_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

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

    await db.message.updateMany({
      where: {
        chatId,
        receiverId: currentUser.user.id,
        status: {
          not: "READ",
        },
      },
      data: {
        status: "READ",
      },
    });

    return new NextResponse("Status updated", { status: 200 });
  } catch (error) {
    console.error("[MESSAGE_STATUS_UPDATE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
