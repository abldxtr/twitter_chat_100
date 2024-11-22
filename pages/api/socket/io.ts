import { Server as NetServer } from "http";
import { NextApiRequest } from "next";
import { Server as ServerIO } from "socket.io";

export const config = {
  api: {
    bodyParser: false,
  },
};

const ioHandler = (req: NextApiRequest, res: any) => {
  if (!res.socket.server.io) {
    const path = "/api/socket/io";
    const httpServer: NetServer = res.socket.server as any;
    const io = new ServerIO(httpServer, {
      path: path,
      addTrailingSlash: false,
    });
    io.on("connection", (socket) => {
      console.log("A user connected");

      socket.on("isTyping", (data) => {
        // console.log(`${data.userId} is typing...`);
        io.emit("typing", { isTyping: true, userId: data.userId });
      });

      socket.on("stopTyping", (data) => {
        // console.log(`${data.userId} stopped typing`);
        io.emit("stoptype", { isTyping: false, userId: data.userId });
      });

      io.on("disconnect", () => {
        console.log("A user disconnected");
      });
    });
    res.socket.server.io = io;
  }

  res.end();
};

export default ioHandler;
