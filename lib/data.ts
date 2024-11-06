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


// export async function fetchChat() {
//   try {
//     const data = await db.user.findMany();

//     return data;
//   } catch (error) {
//     console.log("fetchChat error");
//   }
// }


