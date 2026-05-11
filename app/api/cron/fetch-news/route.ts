import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// This is a cron job endpoint. In production, protect it with CRON_SECRET header.
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const secret = searchParams.get("secret");

  if (process.env.NODE_ENV === "production" && secret !== process.env.CRON_SECRET) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    console.log("Fetching news...");
    
    // 1. Fetch news from NewsData API (Mocking for now as we don't have the key in env yet)
    // In real implementation: 
    // const response = await fetch(`https://newsdata.io/api/1/news?apikey=${process.env.NEWSDATA_API_KEY}&q=politics%20India&language=en`);
    // const data = await response.json();
    
    // For demonstration, we'll create some mock articles
    const mockArticles = [
      {
        title: "Supreme Court stays implementation of new rules on digital platforms",
        link: "https://example.com/sc-stay",
        description: "The Supreme Court of India today issued an interim stay on the implementation of recently notified rules for digital media platforms...",
        category: "POLITICAL",
        image_url: "https://images.unsplash.com/photo-1505664194779-8beaceb93744?auto=format&fit=crop&q=80&w=1000",
        source_id: "The Hindu",
        pubDate: new Date().toISOString()
      },
      {
        title: "New Infrastructure project announced for Uttar Pradesh worth ₹50,000 Cr",
        link: "https://example.com/up-infra",
        description: "The Central Government has approved a massive infrastructure package for Uttar Pradesh, focusing on new expressways and industrial corridors...",
        category: "INFRASTRUCTURE",
        image_url: "https://images.unsplash.com/photo-1590674899484-d5640e854abe?auto=format&fit=crop&q=80&w=1000",
        source_id: "Times of India",
        pubDate: new Date().toISOString()
      }
    ];

    const savedArticles = [];

    for (const art of mockArticles) {
      // Check if article already exists
      const existing = await prisma.news.findFirst({
        where: { source_url: art.link }
      });

      if (!existing) {
        // AI Summarization would happen here
        // const summary = await generateAISummary(art.title, art.description);
        
        const newArt = await prisma.news.create({
          data: {
            headline: art.title,
            summary: art.description.substring(0, 200) + "...",
            body: art.description + "\n\nFull story continues at the source link.",
            category: art.category,
            source_url: art.link,
            cover_image_url: art.image_url,
            status: "PUBLISHED",
            geo_level: "NATIONAL",
            state: "National"
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
      fetched: mockArticles.length, 
      saved: savedArticles.length,
      triggered_poll: count24h % 10 === 0
    });
  } catch (error: any) {
    console.error("Cron error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
