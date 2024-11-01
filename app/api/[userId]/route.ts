import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  const users = [
    {
      name: "GE Aerospace",
      id: "@GE_Aerospace",
      img: "https://pbs.twimg.com/profile_images/1564361710554734593/jgWXrher_normal.jpg",
      href: "12345",
    },
    {
      name: "Abldxtr",
      id: "@Abldxtr",
      img: "https://pbs.twimg.com/profile_images/1564361710554734593/jgWXrher_normal.jpg",
      href: "12346",
    },
  ];

  const href = params.userId;
  const user = users.find((item) => item.href === href);
  console.log("route", user);

  if (user) {
    return NextResponse.json(JSON.stringify(user), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } else {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }
}
