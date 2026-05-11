import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const [articlesCount, pollsCount, votesCount] = await Promise.all([
      prisma.news.count(),
      prisma.poll.count(),
      prisma.pollVote.count()
    ]);

    return NextResponse.json({
      articles: articlesCount,
      polls: pollsCount,
      votes: votesCount,
      uptime: "99.9%" // Simulated for now
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
