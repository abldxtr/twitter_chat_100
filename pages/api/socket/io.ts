import { Server as NetServer } from "http";
import { NextApiRequest } from "next";
import { Server as ServerIO } from "socket.io";

// import { NextApiResponseServerIo } from "@/types";

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
    // اینجا رویدادهای تایپ را تعریف می‌کنیم
    io.on("connection", (socket) => {
      console.log("A user connected");

      // دریافت رویداد isTyping
      socket.on("isTyping", (data) => {
        console.log(`${data.userId} is typing...`);
        // ارسال وضعیت تایپ به سایر کاربران در همان چت
        io.emit("typing", { isTyping: true, userId: data.userId });
      });

      // دریافت رویداد stopTyping
      socket.on("stopTyping", (data) => {
        console.log(`${data.userId} stopped typing`);
        // ارسال وضعیت توقف تایپ به سایر کاربران
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
