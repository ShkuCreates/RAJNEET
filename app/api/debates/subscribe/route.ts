import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, email, topicPreferences } = body;

    if (!email || !topicPreferences || topicPreferences.length === 0) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    const user = userId
      ? await prisma.user.findUnique({ where: { id: userId } })
      : await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    }

    const existing = await prisma.debateNotificationSubscriber.findUnique({
      where: { user_id: user.id },
    });

    if (existing) {
      await prisma.debateNotificationSubscriber.update({
        where: { user_id: user.id },
        data: {
          topic_preferences: topicPreferences,
          is_active: true,
          email,
        },
      });
    } else {
      await prisma.debateNotificationSubscriber.create({
        data: {
          user_id: user.id,
          email,
          topic_preferences: topicPreferences,
          is_active: true,
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error subscribing to debate notifications:", error);
    return NextResponse.json({ success: false, error: "Failed to subscribe" }, { status: 500 });
  }
}
