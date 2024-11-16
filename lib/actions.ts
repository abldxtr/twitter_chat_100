"use server";

import * as z from "zod";
// import bcrypt from "bcryptjs";

import db from "@/lib/prisma";
import { RegisterSchema, LoginSchema } from "@/index";

import { getUserByEmail } from "@/data/user";
import { auth, signIn } from "@/auth";
import { PrismaClient } from "@prisma/client";
import { revalidateTag } from "next/cache";

const prisma = new PrismaClient();

export const register = async (values: z.infer<typeof RegisterSchema>) => {
  const validatedFields = RegisterSchema.safeParse(values);

  if (!validatedFields.success) {
    return {
      success: false,
      message: "Invalid fields!",
    };
  }

  const { email, password, name } = validatedFields.data;
  //   const hashedPassword = await bcrypt.hash(password, 10);

  const existingUser = await getUserByEmail(email);

  if (existingUser) {
    return {
      success: false,
      message: "Email already in use!",
    };
  }

  await db.user.create({
    data: {
      name,
      email,
      password,
    },
  });

  return {
    success: true,
    message: "you success to register",
  };
};

export async function login({
  email,
  password,
}: {
  email: string;
  password: string;
}) {
  try {
    const validatedFields = LoginSchema.safeParse({ email, password });
    if (!validatedFields.success) {
      return {
        success: false,
        message: "Email or password is incorrect.",
      };
    }
    const existingUser = await getUserByEmail(email);

    if (!existingUser) {
      return {
        success: false,
        message: "the user not exist ",
      };
    }
    const matchPass = existingUser.password === password;
    if (!matchPass) {
      return {
        success: false,
        message: "Email or password is incorrect.",
      };
    }

    const res = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });

    return {
      success: true,
      data: res,
    };
  } catch (error: any) {
    return {
      success: false,
      message: "Email or password is incorrect.",
    };
  }
}

export async function createChat({
  senderId,
  receiverId,
}: {
  senderId: string;
  receiverId: string;
}) {
  const user = await auth();

  if (!senderId || !receiverId) {
    throw new Error("Missing required fields");
  }

  // Find or create a chat between the sender and receiver
  const chat = await db.chat.upsert({
    where: {
      initiatorId_participantId: {
        initiatorId: senderId,
        participantId: receiverId,
      },
    },
    create: {
      initiatorId: senderId,
      participantId: receiverId,
    },
    update: {},
  });
  if (chat.initiatorId === user?.user.id) {
    return chat.participantId;
  } else {
    return chat.initiatorId;
  }
  return chat;

  // Create the message
  //   const message = await prisma.message.create({
  //     data: {
  //       content,
  //       senderId: senderId,
  //       receiverId: receiverId,
  //       chatId: chat.id,
  //       status: "SENT",
  //       type: "TEXT",
  //     },
  //   });

  //   return message;
}

export async function sendMassage({
  senderId,
  receiverId,
  text,
  id,
}: {
  senderId: string;
  receiverId: string;
  text: string;
  id: string;
}) {
  if (!text || !senderId || !receiverId) {
    throw new Error("Missing required fields");
  }

  // Create the message
  const message = await prisma.message.create({
    data: {
      content: text,
      senderId: senderId,
      receiverId: receiverId,
      chatId: id,
      status: "SENT",
      type: "TEXT",
    },
  });

  return message;
}

export async function updateLastSeen({ userId }: { userId: string }) {
  try {
    console.log("dataeeee", new Date());
    await db.user.update({
      where: { id: userId },
      data: { lastSeen: new Date() },
    });
    // revalidateTag("fetchChat");

    return {
      success: true,
      // data: res,
    };
  } catch (error: any) {
    return {
      success: false,
      // message: "Email or password is incorrect.",
    };
  }
}

export async function updateMessageReadStatus(messageId: string) {
  try {
    const response = await fetch("/api/messages/update-status", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ messageId }),
    });

    if (!response.ok) {
      throw new Error("Failed to update message status");
    }
  } catch (error) {
    console.error("Error updating message status:", error);
    throw error;
  }
}

export async function updateMessageReadStatusAll(chatId: string) {
  try {
    const response = await fetch("/api/messages/update-all-status", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ chatId }),
    });

    if (!response.ok) {
      throw new Error("Failed to update all message status");
    }
  } catch (error) {
    console.error("Error updating all message status:", error);
    throw error;
  }
}
