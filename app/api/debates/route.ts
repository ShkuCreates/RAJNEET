import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const debates = await prisma.debate.findMany({
      orderBy: { created_at: "desc" },
      include: {
        participants: true,
        audience: true,
      },
    });
    return NextResponse.json({ success: true, debates });
  } catch (error: any) {
    console.error("[GET_DEBATES_ERROR]", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email || session.user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { 
      topic, 
      description, 
      image_url,
      scheduled_at, 
      duration_minutes,
      max_for_participants,
      max_against_participants,
    } = body;

    if (!topic) {
      return NextResponse.json({ error: "Topic is required" }, { status: 400 });
    }

    const debate = await prisma.debate.create({
      data: {
        topic,
        description,
        image_url,
        created_by: session.user.id || "",
        status: "upcoming",
        scheduled_at: scheduled_at ? new Date(scheduled_at) : null,
        duration_minutes: duration_minutes || 60,
        max_for_participants: max_for_participants || 5,
        max_against_participants: max_against_participants || 5,
      },
    });

    return NextResponse.json({ success: true, debate });
  } catch (error: any) {
    console.error("[CREATE_DEBATE_ERROR]", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
