import type { $Enums, Account, Chat, Message, User } from "@prisma/client";

export type ChatListWithmessage = Chat & {
  initiatorId: User;
  participantId: User;
  messages: Message;
};

export type ChatList = User[];

export type text = Message[];

export type user = User;

export type MessageData = {
  id: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  senderId: string;
  receiverId: string;
  chatId: string;
  status: $Enums.MessageStatus;
  type: $Enums.MessageType;
};

export type MessageReturn = MessageData[];
