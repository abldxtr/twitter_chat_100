import db from "./prisma";
import { unstable_cache } from "@/lib/unstable-cache";


export const fetchChat = unstable_cache(
  async () => {
    const data = await db.user.findMany();

  

    return data;
  },
  ["fetchChat"],
  { tags: ["fetchChat"] }
);


