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
    
    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { id } = params;
    const body = await req.json();
    const { role, side } = body; // role: "FOR | "AGAINST" | "AUDIENCE"

    const debate = await prisma.debate.findUnique({
      where: { id },
      include: { participants: true, audience: true },
    });

    if (!debate) {
      return NextResponse.json({ error: "Debate not found" }, { status: 404 });
    }

    if (role === "AUDIENCE") {
      // Join as audience
      const existing = await prisma.debateAudience.findUnique({
        where: { debate_id_user_id: { debate_id: id, user_id: session.user.id } }
      });
      if (!existing) {
        await prisma.debateAudience.create({
          data: {
            debate_id: id,
            user_id: session.user.id,
          }
        });
        await prisma.debate.update({
          where: { id },
          data: { audience_count: { increment: 1 } }
        });
      }
    } else {
        // Join as participant
        if (!side || !["FOR", "AGAINST"].includes(side)) {
          return NextResponse.json({ error: "Side is required" }, { status: 400 });
        }
        const maxParticipants = side === "FOR" 
          ? debate.max_for_participants 
          : debate.max_against_participants;
        const currentCount = debate.participants.filter(p => p.side === side).length;
        if (currentCount >= maxParticipants) {
          return NextResponse.json({ error: "No slots left for this side" }, { status: 400 });
        }
        // Check if already joined as participant
        const existingParticipant = await prisma.debateParticipant.findUnique({
          where: { debate_id_user_id: { debate_id: id, user_id: session.user.id } }
        });
        if (existingParticipant) {
          return NextResponse.json({ error: "Already joined as participant" }, { status: 400 });
        }
        // If joined as audience, remove
        await prisma.debateAudience.deleteMany({
          where: { debate_id: id, user_id: session.user.id }
        });
        await prisma.debateParticipant.create({
          data: {
            debate_id: id,
            user_id: session.user.id,
            side,
          }
        });
        await prisma.debate.update({
          where: { id },
          data: { participant_count: { increment: 1 } }
        });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("[JOIN_DEBATE_ERROR]", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
