import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { seoOptimize } from "@/lib/automation/seoOptimize";
import { uploadToCloudinary } from "@/lib/automation/cloudinary";

// This is a cron job endpoint. In production, protect it with CRON_SECRET header.
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const secret = searchParams.get("secret");

  if (process.env.NODE_ENV === "production" && secret !== process.env.CRON_SECRET) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    console.log("Fetching real news from NewsData API...");
    
    const response = await fetch(
      `https://newsdata.io/api/1/news?apikey=${process.env.NEWSDATA_API_KEY}&q=politics%20India&language=en`
    );
    const data = await response.json();
    
    if (!data.results) {
      throw new Error(data.message || "Failed to fetch news from API");
    }

    const fetchedArticles = data.results;
    const savedArticles = [];

    for (const art of fetchedArticles) {
      // Check if article already exists
      const existing = await prisma.news.findFirst({
        where: { source_url: art.link }
      });

      if (!existing) {
        // Enforce SEO Optimization step
        const seoData = await seoOptimize({
          headline: art.title,
          summary: art.description || art.content || art.title,
          category: "POLITICAL", // Default to political for this fetch
          state_name: "National", 
          cover_image_url: art.image_url,
          published_at: art.pubDate || new Date().toISOString()
        });

        // 1. Upload cover image to Cloudinary
        let cover_image_url = art.image_url;
        if (art.image_url) {
          cover_image_url = await uploadToCloudinary(art.image_url, `${seoData.slug}-cover`);
        }

        const status = seoData.seo_score < 60 ? "DRAFT" : "PUBLISHED";
        
        const newArt = await prisma.news.create({
          data: {
            headline: art.title,
            summary: art.description.substring(0, 200) + "...",
            body: seoData.seo_body || art.description,
            category: art.category,
            source_url: art.link,
            cover_image_url: cover_image_url,
            status: status,
            geo_level: "NATIONAL",
            state: "National",
            posted_by: "ADMIN_SYSTEM", // Placeholder for system user
            
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
      }
    }

    // 2. Auto Poll Generation Logic
    // Check total articles in last 24h
    const count24h = await prisma.news.count({
      where: {
        created_at: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
        }
      }
    });

    if (count24h > 0 && count24h % 10 === 0) {
      console.log("Triggering auto-poll generation...");
      // Logic to call Claude API and generate a poll
      // await generateAutoPoll(mockArticles.map(a => a.title));
    }

    return NextResponse.json({ 
      success: true, 
      fetched: fetchedArticles.length, 
      saved: savedArticles.length,
      triggered_poll: count24h % 10 === 0
    });
  } catch (error: any) {
    console.error("Cron error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
