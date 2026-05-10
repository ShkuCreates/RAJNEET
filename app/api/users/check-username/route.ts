import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const username = searchParams.get("username");

    if (!username) {
      return NextResponse.json({ error: "Username required" }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({
      where: { username },
    });

    return NextResponse.json({ available: !existingUser });
  } catch (error) {
    console.error("Username check error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
