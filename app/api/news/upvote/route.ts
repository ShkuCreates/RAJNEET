import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { newsId } = await req.json();

    // Check if already upvoted
    const existing = await prisma.newsUpvote.findUnique({
      where: {
        news_id_user_id: {
          news_id: newsId,
          user_id: session.user.id
        }
      }
    });

    if (existing) {
      // Remove upvote (toggle)
      await prisma.newsUpvote.delete({
        where: { id: existing.id }
      });
      return NextResponse.json({ success: true, action: "removed" });
    } else {
      // Add upvote
      await prisma.newsUpvote.create({
        data: {
          news_id: newsId,
          user_id: session.user.id
        }
      });
      return NextResponse.json({ success: true, action: "added" });
    }
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
