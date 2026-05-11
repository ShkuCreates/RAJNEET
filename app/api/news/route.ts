import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const CATEGORY_FILTERS: Record<string, string[]> = {
  Politics: ["POLITICS", "POLITICAL"],
  Finance: ["FINANCE"],
  Sports: ["SPORTS"],
  World: ["WORLD", "INTERNATIONAL"],
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");
  const limit = Number.parseInt(searchParams.get("limit") || "12", 10);
  const categoryValues = category ? CATEGORY_FILTERS[category] ?? [category.toUpperCase()] : null;

  try {
    const news = await prisma.news.findMany({
      where: {
        status: "PUBLISHED",
        ...(categoryValues ? { category: { in: categoryValues } } : {}),
      },
      include: {
        author: {
          select: { name: true, avatar_url: true, role: true },
        },
        _count: {
          select: { opinions: true, upvotes: true, pageViews: true },
        },
        opinions: {
          select: { stance: true },
        },
      },
      orderBy: { created_at: "desc" },
      take: Number.isNaN(limit) ? 12 : limit,
    });

    const latestArticle = await prisma.news.findFirst({
      where: { status: "PUBLISHED" },
      orderBy: { created_at: "desc" },
      select: { created_at: true },
    });

    return NextResponse.json({
      news,
      latestFetchAt: latestArticle?.created_at.toISOString() ?? null,
    });
  } catch (error) {
    console.error("News fetch error:", error);
    return NextResponse.json({ news: [], latestFetchAt: null });
  }
}
