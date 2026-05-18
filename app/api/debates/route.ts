import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    console.log("[GET_DEBATES] Fetching all debates...");
    let debates;
    try {
      debates = await prisma.debate.findMany({
        orderBy: { created_at: "desc" },
        include: {
          participants: true,
        },
      });
    } catch (includeError) {
      console.warn("[GET_DEBATES] Failed to include participants, fetching without:", includeError);
      debates = await prisma.debate.findMany({
        orderBy: { created_at: "desc" },
      });
      debates = debates.map(d => ({ ...d, participants: [] }));
    }
    console.log("[GET_DEBATES] Found", debates.length, "debates!");
    console.log("[GET_DEBATES] Debates:", debates);
    return NextResponse.json({ success: true, debates });
  } catch (error: any) {
    console.error("[GET_DEBATES_ERROR]", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    console.log("[CREATE_DEBATE] Starting...");
    const session = await getServerSession(authOptions);
    console.log("[CREATE_DEBATE] Session:", session);
    
    if (!session?.user?.email || session.user.role !== "ADMIN") {
      console.log("[CREATE_DEBATE] Unauthorized");
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    console.log("[CREATE_DEBATE] Body:", body);
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
      console.log("[CREATE_DEBATE] Topic missing");
      return NextResponse.json({ error: "Topic is required" }, { status: 400 });
    }

    const baseData: any = {
      topic,
      description,
      created_by: session.user.id || "",
      status: "upcoming",
      scheduled_at: scheduled_at ? new Date(scheduled_at) : null,
    };

    console.log("[CREATE_DEBATE] Base data:", baseData);

    let debate;
    try {
      const extendedData = { ...baseData };
      if (image_url) extendedData.image_url = image_url;
      if (duration_minutes !== undefined) extendedData.duration_minutes = duration_minutes;
      if (max_for_participants !== undefined) extendedData.max_for_participants = max_for_participants;
      if (max_against_participants !== undefined) extendedData.max_against_participants = max_against_participants;
      
      console.log("[CREATE_DEBATE] Trying extended data:", extendedData);
      debate = await prisma.debate.create({ data: extendedData });
      console.log("[CREATE_DEBATE] Created debate created successfully with extended data! Debate:", debate);
    } catch (dbError) {
      console.warn("[CREATE_DEBATE] Failed with extended fields, falling back to base data:", dbError);
      debate = await prisma.debate.create({ data: baseData });
      console.log("[CREATE_DEBATE] Created with base data! Debate:", debate);
    }

    console.log("[CREATE_DEBATE] Returning success, debating...");
    return NextResponse.json({ success: true, debate });
  } catch (error: any) {
    console.error("[CREATE_DEBATE_ERROR]", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
