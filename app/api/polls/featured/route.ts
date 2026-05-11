import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const state = searchParams.get("state");

    // Fetch the latest active poll, prioritize state-specific if state is provided
    const poll = await prisma.poll.findFirst({
      where: {
        expires_at: { gte: new Date() },
        OR: [
          { geo_scope: "NATIONAL" },
          ...(state ? [{ geo_scope: "STATE", state }] : [])
        ]
      },
      orderBy: { created_at: "desc" },
      include: {
        _count: { select: { votes: true } }
      }
    });

    if (!poll) {
      // Return a default poll for testing if no active polls exist
      const defaultPoll = {
        id: "default",
        question: "Should India implement stricter data privacy laws?",
        options: ["Yes, immediately", "No, current laws are sufficient", "Need more debate"],
        results: [
          { label: "Yes, immediately", progress: 45 },
          { label: "No, current laws are sufficient", progress: 30 },
          { label: "Need more debate", progress: 25 }
        ],
        totalVotes: 1240,
        expires_at: new Date(Date.now() + 86400000 * 7)
      };
      return NextResponse.json({ success: true, poll: defaultPoll });
    }

    // Calculate real percentages
    const votes = await prisma.pollVote.findMany({
      where: { poll_id: poll.id }
    });

    const totalVotes = votes.length;
    const options = poll.options as string[];
    const results = options.map(opt => {
      const optVotes = votes.filter(v => v.selected_option === opt).length;
      return {
        label: opt,
        progress: totalVotes > 0 ? Math.round((optVotes / totalVotes) * 100) : 0
      };
    });

    return NextResponse.json({
      success: true,
      poll: {
        ...poll,
        results,
        totalVotes
      }
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
