import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, topicPreferences } = body;

    if (!email || !topicPreferences || topicPreferences.length === 0) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    // Check if email already exists
    const existing = await prisma.debateNotificationSubscriber.findUnique({
      where: { user_id: email }, // Using email as user_id for non-logged-in users
    });

    if (existing) {
      // Update existing subscription
      await prisma.debateNotificationSubscriber.update({
        where: { user_id: email },
        data: {
          topic_preferences: topicPreferences,
          is_active: true,
        },
      });
    } else {
      // Create new subscription
      await prisma.debateNotificationSubscriber.create({
        data: {
          user_id: email,
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
