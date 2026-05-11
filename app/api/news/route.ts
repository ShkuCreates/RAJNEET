import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const VALID_CATEGORIES = ["Politics", "Finance", "Sports", "World"] as const;

// Map query category → legacy DB category aliases
const CATEGORY_FILTERS: Record<(typeof VALID_CATEGORIES)[number], string[]> = {
  Politics: ["POLITICAL", "POLITICS"],

  Finance: ["FINANCE", "FINANCE", "BUSINESS", "CORPORATE", "ECONOMY"],
  Sports: ["SPORTS", "SPORT", "CRICKET", "FOOTBALL", "IPL", "OLYMPICS", "FIFA"],
  World: ["WORLD", "INTERNATIONAL", "FOREIGN", "GLOBAL", "DIPLOMACY"],
};


export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");
  const limit = Number.parseInt(searchParams.get("limit") || "12", 10);

  const categoryValues = category && (VALID_CATEGORIES as readonly string[]).includes(category)
    ? CATEGORY_FILTERS[category as (typeof VALID_CATEGORIES)[number]]
    : null;


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
