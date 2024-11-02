import db from "./prisma";

export async function fetchChat() {
  try {
    const data = await db.user.findMany();

    return data;
  } catch (error) {
    console.log("fetchChat error");
  }
}
