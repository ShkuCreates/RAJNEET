import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { seoOptimize } from "@/lib/automation/seoOptimize";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) return NextResponse.json({ success: false, error: "Missing ID" }, { status: 400 });

  try {
    const article = await prisma.news.findUnique({ where: { id } });
    if (!article) return NextResponse.json({ success: false, error: "Article not found" }, { status: 404 });

    const seoData = await seoOptimize({
      headline: article.headline,
      summary: article.summary,
      category: article.category,
      state_name: article.state || "National",
      cover_image_url: article.cover_image_url || undefined,
      published_at: article.created_at.toISOString()
    });

    const updated = await prisma.news.update({
      where: { id },
      data: {
        seo_title: seoData.seo_title,
        meta_description: seoData.meta_description,
        slug: seoData.slug,
        focus_keywords: seoData.focus_keywords,
        schema_markup: seoData.schema_markup,
        seo_body: seoData.seo_body,
        seo_score: seoData.seo_score,
        primary_keyword: seoData.primary_keyword,
        is_trending: seoData.is_trending,
        priority: seoData.priority,
        // Also update the visible body if it's high score
        body: seoData.seo_body || article.body
      }
    });

    return NextResponse.json({ success: true, article: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
