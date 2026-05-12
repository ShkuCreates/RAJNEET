import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const [totalComments, totalLikesResult, totalArticles] = await Promise.all([
      prisma.opinion.count({
        where: { user_id: session.user.id }
      }),
      prisma.opinion.aggregate({
        where: { user_id: session.user.id },
        _sum: { like_count: true }
      }),
      prisma.news.count({
        where: { posted_by: session.user.id }
      })
    ]);

    const totalLikes = totalLikesResult._sum.like_count || 0;
    const totalEngagement = totalComments + totalLikes;

    const userActivities = await prisma.opinion.findMany({
      where: { user_id: session.user.id },
      orderBy: { created_at: 'desc' },
      take: 20,
      include: { 
        news: { select: { headline: true, slug: true } } 
      }
    });

    const userArticles = await prisma.news.findMany({
      where: { posted_by: session.user.id },
      orderBy: { created_at: 'desc' },
      take: 50,
      select: {
        id: true,
        headline: true,
        slug: true,
        created_at: true,
        status: true,
        _count: {
          select: {
            pageViews: true
          }
        }
      }
    });

    return NextResponse.json({
      stats: {
        totalComments,
        totalLikes,
        totalEngagement,
        debateParticipation: totalComments,
        totalArticles
      },
      activities: userActivities,
      articles: userArticles
    });
  } catch (error) {
    console.error("[USER_PROFILE_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
