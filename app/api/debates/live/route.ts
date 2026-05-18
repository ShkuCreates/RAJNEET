import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // Fetch live debates (status = "live") and upcoming debates (status = "upcoming")
    let debates: any[];
    try {
      debates = await (prisma as any).debate.findMany({
        where: {
          status: {
            in: ["live", "upcoming"]
          }
        },
        include: {
          created_by: {
            select: {
              id: true,
              name: true,
              avatar_url: true
            }
          },
          arguments: true,
          participants: true,
        },
        orderBy: [
          { status: "asc" }, // live first, then upcoming
          { scheduled_at: "asc" }
        ]
      });
    } catch (includeError) {
      console.warn("[LIVE_DEBATES] Failed to include participants, fetching without:", includeError);
      debates = await (prisma as any).debate.findMany({
        where: {
          status: {
            in: ["live", "upcoming"]
          }
        },
        include: {
          created_by: {
            select: {
              id: true,
              name: true,
              avatar_url: true
            }
          },
          arguments: true,
        },
        orderBy: [
          { status: "asc" }, // live first, then upcoming
          { scheduled_at: "asc" }
        ]
      });
      debates = debates.map(d => ({ ...d, participants: [] }));
    }

    return NextResponse.json({ 
      success: true, 
      debates: debates.map((debate: any) => ({
        id: debate.id,
        topic: debate.topic,
        description: debate.description,
        status: debate.status,
        scheduled_at: debate.scheduled_at?.toISOString(),
        created_by: debate.created_by,
        arguments: debate.arguments,
        participants: debate.participants
      }))
    });
  } catch (error) {
    console.error("Error fetching live debates:", error);
    return NextResponse.json({ 
      success: false, 
      error: "Failed to fetch debates" 
    }, { status: 500 });
  }
}
