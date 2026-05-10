import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { username, state, role, partyAction, partyId } = body;

    // Update user with onboarding data
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        username,
        state,
        subRole: role,
        partyId: partyId || null,
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("Onboarding error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
