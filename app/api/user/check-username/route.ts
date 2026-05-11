import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const username = searchParams.get("username")?.toLowerCase();

    if (!username || username.length < 3) {
      return NextResponse.json({ available: false });
    }

    const existingUser = await prisma.user.findUnique({
      where: { username },
    });

    return NextResponse.json({ available: !existingUser });
  } catch (error) {
    return new NextResponse("Internal Error", { status: 500 });
  }
}
