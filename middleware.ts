import NextAuth from "next-auth";
import { NextRequest } from "next/server";

import { auth } from "@/auth";
import type { NextAuthConfig } from "next-auth";
export { auth as middleware } from "@/auth";

export default auth((req) => {
  const { nextUrl } = req;

  const isAuthenticated = !!req.auth;
  // const isPublicRoute = PUBLIC_ROUTES.includes(nextUrl.pathname);

  // if (isPublicRoute && isAuthenticated)
  //  return Response.redirect(new URL(DEFAULT_REDIRECT, nextUrl));

  if (!isAuthenticated) return Response.redirect(new URL("/login", nextUrl));
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
