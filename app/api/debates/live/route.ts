import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // Fetch live debates (status = "live") and upcoming debates (status = "upcoming")
    const debates = await prisma.debate.findMany({
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
        arguments: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                avatar_url: true
              }
            }
          }
        },
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                avatar_url: true
              }
            }
          }
        }
      },
      orderBy: [
        { status: "asc" }, // live first, then upcoming
        { scheduled_at: "asc" }
      ]
    });

    return NextResponse.json({ 
      success: true, 
      debates: debates.map(debate => ({
        id: debate.id,
        topic: debate.topic,
        description: debate.description,
        status: debate.status,
        scheduled_at: debate.scheduled_at?.toISOString(),
        ends_at: debate.ends_at?.toISOString(),
        participant_count: debate.participant_count,
        winner_side: debate.winner_side,
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
