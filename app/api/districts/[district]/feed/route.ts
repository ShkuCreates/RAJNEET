import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: { district: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { district } = params;
    const { searchParams } = req.nextUrl;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const type = searchParams.get("type"); // "home", "trending", "my-district"
    const skip = (page - 1) * limit;

    let whereClause: any = { district };

    // Handle different feed types
    if (type === "trending") {
      // Get posts from last 24 hours with most likes
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      whereClause = {
        createdAt: { gte: twentyFourHoursAgo },
      };
    } else if (type === "my-district" && session.user.username) {
      // Get user's district
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { district: true },
      });
      if (user?.district) {
        whereClause = { district: user.district };
      }
    }

    const posts = await prisma.post.findMany({
      where: whereClause,
      include: {
        author: {
          select: {
            id: true,
            username: true,
            name: true,
            image: true,
            role: true,
            subRole: true,
          },
        },
        _count: {
          select: {
            comments: true,
            likes: true,
          },
        },
      },
      orderBy: type === "trending" 
        ? [{ likeCount: "desc" }, { createdAt: "desc" }]
        : { createdAt: "desc" },
      skip,
      take: limit,
    });

    // Check if current user liked each post
    const postsWithLikeStatus = await Promise.all(
      posts.map(async (post) => {
        const userLike = await prisma.like.findUnique({
          where: {
            userId_postId: {
              userId: session.user.id,
              postId: post.id,
            },
          },
        });

        return {
          ...post,
          isLiked: !!userLike,
        };
      })
    );

    const totalPosts = await prisma.post.count({
      where: whereClause,
    });

    return NextResponse.json({
      posts: postsWithLikeStatus,
      pagination: {
        page,
        limit,
        total: totalPosts,
        pages: Math.ceil(totalPosts / limit),
      },
    });
  } catch (error) {
    console.error("Feed error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
