import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { name, username, category, state, mobile } = await req.json();

    if (!name || !username || !category || !state) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    // Check if username is taken (just in case)
    const existingUser = await prisma.user.findFirst({
      where: {
        username: username.toLowerCase(),
        NOT: {
          email: session.user.email
        }
      }
    });

    if (existingUser) {
      return new NextResponse("Username already taken", { status: 400 });
    }

    await prisma.user.update({
      where: { email: session.user.email },
      data: {
        name,
        username: username.toLowerCase(),
        category,
        state,
        mobile: mobile || null,
        onboarding_complete: true,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[ONBOARDING_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
