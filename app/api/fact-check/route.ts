import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendDebateNotificationEmail } from "@/lib/email";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { newsId, reason } = body;

    if (!newsId || !reason) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    // Create fact check request
    const factCheck = await prisma.factCheck.create({
      data: {
        news_id: newsId,
        reason,
        status: "PENDING",
        created_at: new Date(),
      },
    });

    // TODO: Send notification to admin team for review
    // await sendFactCheckNotification(factCheck);

    return NextResponse.json({ success: true, id: factCheck.id });
  } catch (error) {
    console.error("Error creating fact check request:", error);
    return NextResponse.json({ success: false, error: "Failed to create request" }, { status: 500 });
  }
}
