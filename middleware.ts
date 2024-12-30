import {
  convexAuthNextjsMiddleware,
  createRouteMatcher,
  nextjsMiddlewareRedirect,
} from "@convex-dev/auth/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

const isPublicPage = createRouteMatcher(["/login", "/register"]);

export default convexAuthNextjsMiddleware(
  async (request, { convexAuth }) => {
    const isAuth = await convexAuth.isAuthenticated();
    console.log({ isAuth });
    const isPublic = isPublicPage(request);

    console.log({ isPublic });
    if (isPublic && !isAuth) {
      return NextResponse.next();
    }

    if (!isPublic && !isAuth) {
      // return NextResponse.next();
      return nextjsMiddlewareRedirect(request, "/login");
    }

    if (isPublic && isAuth) {
      return nextjsMiddlewareRedirect(request, "/");
    }
  },
  {
    verbose: true,
  }
);

export const config = {
  // The following matcher runs middleware on all routes
  // except static assets.
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
