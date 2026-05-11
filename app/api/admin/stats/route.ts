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

    const now = new Date();
    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);

    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - 7);

    const startOfMonth = new Date(now);
    startOfMonth.setDate(now.getDate() - 30);

    const [
      articlesCount,
      pollsCount,
      votesCount,
      viewsToday,
      viewsWeek,
      viewsMonth,
      viewsTotal,
      upvotesTotal,
      commentsTotal,
      usersTotal,
      topArticles
    ] = await Promise.all([
      prisma.news.count(),
      prisma.poll.count(),
      prisma.pollVote.count(),
      prisma.pageView.count({ where: { created_at: { gte: startOfToday } } }),
      prisma.pageView.count({ where: { created_at: { gte: startOfWeek } } }),
      prisma.pageView.count({ where: { created_at: { gte: startOfMonth } } }),
      prisma.pageView.count(),
      prisma.newsUpvote.count(),
      prisma.opinion.count(),
      prisma.user.count(),
      prisma.pageView.groupBy({
        by: ["news_id"],
        _count: { news_id: true },
        orderBy: { _count: { news_id: "desc" } },
        take: 5,
        where: { news_id: { not: null }, created_at: { gte: startOfWeek } }
      })
    ]);

    // Enrich top articles with headlines
    const enrichedTop = await Promise.all(
      topArticles.map(async (row: any) => {
        const article = await prisma.news.findUnique({
          where: { id: row.news_id },
          select: { id: true, headline: true, slug: true }
        });
        return { ...article, views: row._count.news_id };
      })
    );

    return NextResponse.json({
      articles: articlesCount,
      polls: pollsCount,
      votes: votesCount,
      upvotes: upvotesTotal,
      comments: commentsTotal,
      users: usersTotal,
      views: {
        today: viewsToday,
        week: viewsWeek,
        month: viewsMonth,
        total: viewsTotal
      },
      topArticles: enrichedTop,
      uptime: "99.9%"
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
