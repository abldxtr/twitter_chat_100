import { Server as NetServer, Socket } from "net";
import { NextApiResponse } from "next";
import { Server as SocketIOServer } from "socket.io";
import { Chat, Account, Message, User } from "@prisma/client";

// export type ServerWithMembersWithProfiles = Chat & {
//   members: (Member & { profile: Profile })[];
// };

export type NextApiResponseServerIo = NextApiResponse & {
  socket: Socket & {
    server: NetServer & {
      io: SocketIOServer;
    };
  };
};
