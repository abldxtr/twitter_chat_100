import { NextResponse } from "next/server";
import { auth } from "@/auth";

const MESSAGES_BATCH = 10;

export async function GET(req: Request) {
  try {
    const currentUser = await auth();

    return NextResponse.json({
      currentUser,
    });
  } catch (error) {
    // console.log("[MESSAGES_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
