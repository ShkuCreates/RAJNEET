import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email || !session.user.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { id } = params;
    const body = await req.json();
    const { role, side } = body; // role: "FOR | "AGAINST" | "AUDIENCE"

    let debate;
    let participants = [];
    try {
      debate = await prisma.debate.findUnique({
        where: { id },
        include: { participants: true },
      });
      if (debate) participants = debate.participants;
    } catch (includeError) {
      console.warn("[JOIN_DEBATE] Failed to include participants, fetching without:", includeError);
      debate = await prisma.debate.findUnique({
        where: { id },
      });
    }

    if (!debate) {
      return NextResponse.json({ error: "Debate not found" }, { status: 404 });
    }

    if (role === "AUDIENCE") {
      // Join as audience
      const existing = await (prisma as any).debateAudience.findUnique({
        where: { debate_id_user_id: { debate_id: id, user_id: session.user.id } }
      }).catch(() => null);
      
      if (!existing) {
        await (prisma as any).debateAudience.create({
          data: {
            debate_id: id,
            user_id: session.user.id,
          }
        }).catch(() => null);
      }
    } else {
        // Join as participant
        if (!side || !["FOR", "AGAINST"].includes(side)) {
          return NextResponse.json({ error: "Side is required" }, { status: 400 });
        }
        
        const maxFor = (debate as any).max_for_participants || 5;
        const maxAgainst = (debate as any).max_against_participants || 5;
        const maxParticipants = side === "FOR" ? maxFor : maxAgainst;
        
        const currentCount = participants.filter((p: any) => p.side === side).length;
        
        if (currentCount >= maxParticipants) {
          return NextResponse.json({ error: "No slots left for this side" }, { status: 400 });
        }
        
        // Check if already joined as participant using raw SQL
        const existingParticipant = await prisma.$queryRaw`
          SELECT id FROM "DebateParticipant" 
          WHERE debate_id = ${id} AND user_id = ${session.user.id}
        `.catch(() => null);
        
        if (existingParticipant) {
          return NextResponse.json({ error: "Already joined as participant" }, { status: 400 });
        }
        
        // If joined as audience, remove
        await (prisma as any).debateAudience.deleteMany({
          where: { debate_id: id, user_id: session.user.id }
        }).catch(() => null);
        
        try {
          await prisma.$executeRaw`
            INSERT INTO "DebateParticipant" (debate_id, user_id, side)
            VALUES (${id}, ${session.user.id}, ${side})
            ON CONFLICT (debate_id, user_id) DO NOTHING
          `;
        } catch (sqlError) {
          console.warn("[JOIN_DEBATE] Raw SQL failed, trying minimal prisma create:", sqlError);
          await prisma.$executeRaw`
            INSERT INTO "DebateParticipant" (debate_id, user_id, side)
            VALUES (${id}, ${session.user.id}, ${side})
          `;
        }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("[JOIN_DEBATE_ERROR]", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
