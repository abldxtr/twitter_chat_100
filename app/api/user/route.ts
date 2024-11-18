import { auth } from "@/auth";
import { fetchChatsWithUnreadCount } from "@/lib/data";
import db from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const currentUser = await auth();
    const { searchParams } = new URL(req.url);

    const userId = searchParams.get("userId");
    //   const chatId = searchParams.get("chatId");
    // console.log("api/message", currentUser);
    // console.log("api/message searchparam", cursor);

    // console.log("api/message", chatId);

    if (!currentUser || !currentUser.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!userId) {
      return new NextResponse("user ID missing", { status: 400 });
    }

    const a = new Promise((resolve) => {
      setTimeout(() => {
        resolve("");
      }, 5000);
    });

    // a.then(async () => {
    const users = await db.chat.findMany({
      where: {
        OR: [{ initiatorId: userId }, { participantId: userId }],
        NOT: {
          AND: [{ initiatorId: userId }, { participantId: userId }],
        },
      },
      select: {
        id: true,
        unreadCountInitiator: true,
        unreadCountParticipant: true,
        initiator: true,
        participant: true,
        messages: {
          orderBy: {
            createdAt: "desc",
          },
          take: 1, // آخرین پیام برای هر چت
          select: {
            id: true,
            content: true,
            createdAt: true,
            status: true,
            senderId: true,
            receiverId: true,
          },
        },
      },
    });
    // محاسبه تعداد پیام‌های خوانده‌نشده برای هر کاربر
    const updatedChats = users.map((chat) => {
      const isInitiator = chat.initiator.id === userId;
      const unreadCount = isInitiator
        ? chat.unreadCountInitiator
        : chat.unreadCountParticipant;

      return {
        ...chat,
        unreadCount,
      };
    });
    return NextResponse.json(updatedChats);
    // });

    // return updatedChats;

    //   revalidateTag("fetchChat");
    //   revalidatePath("/", "layout");
  } catch (error) {
    // console.log("[MESSAGES_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
