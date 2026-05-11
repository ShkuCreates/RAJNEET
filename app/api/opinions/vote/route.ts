import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { opinionId, type } = body;

    if (!opinionId || !type) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    if (!["insightful", "biased", "misleading"].includes(type)) {
      return NextResponse.json({ success: false, error: "Invalid vote type" }, { status: 400 });
    }

    // Check if user already voted (simplified - in production you'd track individual votes)
    const opinion = await prisma.opinion.findUnique({
      where: { id: opinionId },
      select: { user_id: true },
    });

    if (!opinion) {
      return NextResponse.json({ success: false, error: "Opinion not found" }, { status: 404 });
    }

    // Update opinion based on vote type
    const updateData: any = {};
    if (type === "insightful") {
      updateData.insightful_count = { increment: 1 };
    } else if (type === "biased") {
      updateData.biased_count = { increment: 1 };
    } else if (type === "misleading") {
      updateData.misleading_count = { increment: 1 };
    }

    await prisma.opinion.update({
      where: { id: opinionId },
      data: updateData,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error voting on opinion:", error);
    return NextResponse.json({ success: false, error: "Failed to vote" }, { status: 500 });
  }
}
