import db from "@/lib/prisma";

export const getUserByEmail = async (email: string) => {
  try {
    const user = await db.user.findUnique({ where: { email } });

    if (user !== null) {
      await db.user.update({
        where: {
          id: user.id,
        },
        data: {
          lastSeen: new Date().toISOString(),
        },
      });
    }

    return user;
  } catch {
    return null;
  }
};

export const getUserById = async (id: string) => {
  try {
    const user = await db.user.findUnique({ where: { id } });

    return user;
  } catch {
    return null;
  }
};
