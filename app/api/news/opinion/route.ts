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

    const { newsId, stance, comment, tag } = await req.json();

    const opinion = await prisma.opinion.create({
      data: {
        news_id: newsId,
        user_id: session.user.id,
        stance,
        comment,
        tag,
      },
      include: {
        user: {
          select: {
            name: true,
            avatar_url: true,
            role: true
          }
        }
      }
    });

    return NextResponse.json({ success: true, opinion });
  } catch (error: any) {
    console.error("Opinion Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const newsId = searchParams.get("newsId");

  if (!newsId) {
    return new NextResponse("Missing newsId", { status: 400 });
  }

  const opinions = await prisma.opinion.findMany({
    where: { news_id: newsId },
    orderBy: { created_at: "desc" },
    include: {
      user: {
        select: {
          name: true,
          avatar_url: true,
          role: true
        }
      }
    }
  });

  return NextResponse.json({ opinions });
}
