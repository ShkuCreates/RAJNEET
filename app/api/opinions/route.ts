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
    const { newsId, stance, content } = body;

    if (!newsId || !stance || !content) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    if (content.length > 280) {
      return NextResponse.json({ success: false, error: "Opinion must be 280 characters or less" }, { status: 400 });
    }

    // Extract hashtags from content
    const hashtags = content.match(/#\w+/g)?.map((tag) => tag.slice(1)) || [];

    // Create opinion
    const opinion = await prisma.opinion.create({
      data: {
        news_id: newsId,
        user_id: session.user.id,
        username: session.user.username || session.user.name || "user",
        stance,
        comment: content,
        hashtags,
      },
      include: {
        user: {
          select: {
            reputation_score: true,
          },
        },
      },
    });

    // Add reputation event for posting opinion
    await prisma.reputationEvent.create({
      data: {
        user_id: session.user.id,
        event_type: "opinion_posted",
        points_change: 1,
        reference_id: opinion.id,
      },
    });

    // Update user reputation
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { reputation_score: true },
    });

    if (user) {
      const newScore = user.reputation_score + 1;
      const newTier = getReputationTier(newScore);
      await prisma.user.update({
        where: { id: session.user.id },
        data: {
          reputation_score: newScore,
          reputation_tier: newTier,
        },
      });
    }

    return NextResponse.json({ success: true, opinion });
  } catch (error) {
    console.error("Error creating opinion:", error);
    return NextResponse.json({ success: false, error: "Failed to create opinion" }, { status: 500 });
  }
}

function getReputationTier(score: number): string {
  if (score >= 5000) return "RAJNEET Legend";
  if (score >= 2500) return "Political Analyst";
  if (score >= 1000) return "Community Leader";
  if (score >= 500) return "Voice of the People";
  if (score >= 200) return "Active Citizen";
  return "Citizen";
}
