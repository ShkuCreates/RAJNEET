import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ROLE_THRESHOLDS } from "@/lib/constants";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { role } = body;

    if (!role) {
      return NextResponse.json({ error: "Role required" }, { status: 400 });
    }

    // Check if user has enough followers for the role
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const requiredFollowers = ROLE_THRESHOLDS[role as keyof typeof ROLE_THRESHOLDS];
    if (requiredFollowers && user.followerCount < requiredFollowers) {
      return NextResponse.json(
        { error: "Not enough followers to claim this role" },
        { status: 400 }
      );
    }

    // Update user's role
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: { subRole: role },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("Claim role error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
