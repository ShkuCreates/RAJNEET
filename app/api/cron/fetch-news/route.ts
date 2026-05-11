import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { seoOptimize } from "@/lib/automation/seoOptimize";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

function extractArticleImage(art: any) {
  if (art.image_url) return art.image_url;
  if (art.enclosure?.url) return art.enclosure.url;
  if (Array.isArray(art["media:content"]) && art["media:content"]?.[0]?.url) return art["media:content"][0].url;
  if (art["media:content"]?.url) return art["media:content"].url;
  if (art.og_image) return art.og_image;
  if (Array.isArray(art.images) && art.images[0]) return art.images[0];
  return null;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const secret = searchParams.get("secret");
  
  const session = await getServerSession(authOptions);
  const isAdmin = session?.user?.role === "ADMIN";

  if (process.env.NODE_ENV === "production" && !isAdmin && secret !== process.env.CRON_SECRET) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    console.log("Fetching news from NewsData API...");
    
    const response = await fetch(
      `https://newsdata.io/api/1/news?apikey=${process.env.NEWSDATA_API_KEY}&q=politics%20India&language=en&size=10`
    );
    const data = await response.json();
    
    if (!data.results) {
      throw new Error(data.message || "Failed to fetch news from API");
    }

    const fetchedArticles = data.results;
    const savedArticles = [];
    const skipped = [];

    for (const art of fetchedArticles) {
      // Skip articles without a title
      if (!art.title) { skipped.push("no-title"); continue; }

      // Check duplicate
      const existing = await prisma.news.findFirst({
        where: { source_url: art.link }
      });
      if (existing) { skipped.push(art.title); continue; }

      try {
        const rawSummary = art.description || art.content || art.title;

        // Run the full SEO + AI content pipeline
        const seoData = await seoOptimize({
          headline: art.title,
          summary: rawSummary,
          category: "POLITICAL",
          state_name: "National",
          cover_image_url: undefined, // Don't pass original image
          published_at: art.pubDate || new Date().toISOString()
        });

        const category = Array.isArray(art.category)
          ? art.category[0].toUpperCase()
          : (art.category?.toUpperCase() || "POLITICAL");
        const sourceImage = extractArticleImage(art);
        const cover_image_url = sourceImage || `/api/og?title=${encodeURIComponent(seoData.seo_title || art.title)}&category=${encodeURIComponent(category)}`;

        const status = seoData.seo_score < 50 ? "DRAFT" : "PUBLISHED";

        const newArt = await prisma.news.create({
          data: {
            headline: art.title,
            // Use Gemini's clean 2-3 sentence summary (our own words)
            summary: seoData.clean_summary || rawSummary.substring(0, 200),
            // Use Gemini's full 700-900 word original article
            body: seoData.seo_body,
            category,
            source_url: art.link,
            cover_image_url,
            status,
            geo_level: "NATIONAL",
            state: "National",
            posted_by: null,
            
            // SEO Fields
            seo_title: seoData.seo_title,
            meta_description: seoData.meta_description,
            slug: seoData.slug,
            focus_keywords: seoData.focus_keywords,
            schema_markup: seoData.schema_markup,
            seo_body: seoData.seo_body,
            seo_score: seoData.seo_score,
            primary_keyword: seoData.primary_keyword,
            is_trending: seoData.is_trending,
            priority: seoData.priority
          }
        });
        savedArticles.push(newArt);
        console.log(`✓ Saved: ${art.title.substring(0, 50)}`);
      } catch (articleError: any) {
        console.error(`✗ Failed to process: ${art.title?.substring(0, 50)} — ${articleError.message}`);
        // Continue with next article
      }
    }

    // Auto Poll Generation (every 10 articles)
    const count24h = await prisma.news.count({
      where: { created_at: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } }
    });

    return NextResponse.json({ 
      success: true, 
      fetched: fetchedArticles.length,
      saved: savedArticles.length,
      skipped: skipped.length,
      published: savedArticles.filter(a => a.status === "PUBLISHED").length,
      draft: savedArticles.filter(a => a.status === "DRAFT").length,
    });
  } catch (error: any) {
    console.error("Cron error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
