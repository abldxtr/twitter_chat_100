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

<<<<<<< HEAD

=======
>>>>>>> 487e3807854ec7e2f1d4758206d619c0977ebd26
// export async function fetchChat() {
//   try {
//     const data = await db.user.findMany();

//     return data;
//   } catch (error) {
//     console.log("fetchChat error");
//   }
// }
<<<<<<< HEAD


=======
>>>>>>> 487e3807854ec7e2f1d4758206d619c0977ebd26
