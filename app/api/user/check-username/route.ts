import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const { searchParams } = new URL(req.url);
    const username = searchParams.get("username")?.toLowerCase();

    if (!username || username.length < 3) {
      return NextResponse.json({ available: false });
    }

    const existingUser = await prisma.user.findFirst({
      where: { 
        username,
        NOT: {
          email: session?.user?.email || undefined
        }
      },
    });

    return NextResponse.json({ available: !existingUser });
  } catch (error) {
    return new NextResponse("Internal Error", { status: 500 });
  }
}
