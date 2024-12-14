import { supabase } from "@/utils/supabase/server";
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

    supabase
      .channel("online1")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "Message",
        },
        (event: any) => {
          console.log("sssssssssssssss",{...event});
          io.emit("aaaa", { data: event });

          // revalidatePath("/");
        }
      )
      .subscribe();

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
      // socket.emit(`${first?.id}:update`, { other });
      socket.on("update", () => {
        console.log("updateeeeeeeee");
        // `${userId}:update`
        // io.emit(`${other}:update`, { queryKey });
        io.emit("abcd");
      });

      socket.on("disconnect", () => {
        console.log("A user disconnected");
      });
    });
    res.socket.server.io = io;
  }

  res.end();
};

export default ioHandler;
