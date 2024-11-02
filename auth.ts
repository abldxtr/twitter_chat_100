import { randomUUID } from "crypto";
import NextAuth, { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { encode as defaultEncode } from "next-auth/jwt";
import db from "@/lib/prisma";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { LoginSchema } from ".";
import { getUserById } from "./data/user";
// import bcrypt from "bcrypt";

const authConfig: NextAuthConfig = {
  pages: {
    signIn: "/signup",
  },
  providers: [
    Credentials({
      credentials: {
        email: {},
        password: {},
      },
      async authorize(credentials) {
        const { email, password } = credentials;

        const validatedFields = LoginSchema.safeParse(credentials);
        // console.log("login", validatedFields);

        if (validatedFields.success) {
          const { email, password } = validatedFields.data;

          const user = await db.user.findUnique({ where: { email } });
          if (!user || !user.password) return null;
          // const passwordsMatch = await bcrypt.compare(password, user.password);
          const passwordsMatch = password === user.password;

          if (passwordsMatch) return user;
        }
        return null;
      },
    }),
  ],
  callbacks: {
    async session({ token, session }) {
      if (token.sub && session.user) {
        // session.user.id = token.sub;
        session.user.id = token.sub;
        session.user.name = token.name;
        session.user.email = token.email!;
        session.user.image = token.picture;
        session.user.username = token.username;
      }
      // console.log("session", session);

      return session;
    },
    async jwt({ token, user }) {
      if (!token.sub) return token;

      const existingUser = await getUserById(token.sub);
      // console.log("existingUser", existingUser);
      // const prismaUser = await db.user.findFirst({
      //   where: {
      //     email: token.email,
      //   },
      // });

      if (!existingUser) {
        // if (user.id) {
        //   token.id = user.id;
        // }
        return token;
      }

      token.name = existingUser.name;
      token.email = existingUser.email;
      token.id = existingUser.id;
      token.picture = existingUser.image;
      token.username = existingUser.username;
      // console.log("token", token);

      return token;
    },
  },

  secret: process.env.AUTH_SECRET!,
  adapter: PrismaAdapter(db),
  session: { strategy: "jwt" },
};

export const { handlers, signIn, signOut, auth } = NextAuth(authConfig);
