import type { Account, Chat, Message, User } from "@prisma/client";

export type ChatListWithmessage = Chat & {
  initiatorId: User;
  participantId: User;
  messages: Message;
};

export type ChatList = User[];

export type text = Message[];

export type user = User;
