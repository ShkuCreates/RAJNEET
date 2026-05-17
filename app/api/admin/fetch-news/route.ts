import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { seoOptimize } from "@/lib/automation/seoOptimize";
import Parser from 'rss-parser';

export const dynamic = "force-dynamic";

function enforceValidCategory(rawCategory?: string, title?: string): string {
  if (!rawCategory && !title) return "POLITICAL";
  
  const categoryMap: Record<string, string> = {
    'politics': 'POLITICAL',
    'political': 'POLITICAL',
    'government': 'POLITICAL',
    'election': 'POLITICAL',
    'finance': 'FINANCE',
    'economy': 'FINANCE',
    'business': 'FINANCE',
    'sports': 'SPORTS',
    'cricket': 'SPORTS',
    'world': 'WORLD',
    'international': 'WORLD',
    'crime': 'CRIMINAL',
    'criminal': 'CRIMINAL',
    'infrastructure': 'INFRASTRUCTURE',
    'environment': 'ENVIRONMENT',
    'health': 'HEALTH',
    'technology': 'TECHNOLOGY',
    'tech': 'TECHNOLOGY'
  };
  
  const keywords = (rawCategory + ' ' + (title || '')).toLowerCase();
  
  for (const [key, value] of Object.entries(categoryMap)) {
    if (keywords.includes(key)) {
      return value;
    }
  }
  
  return "POLITICAL";
}

function extractArticleImage(art: any) {
  if (art.image_url) return art.image_url;
  if (art.image) return art.image;
  if (art.enclosure?.url) return art.enclosure.url;
  if (art.enclosure) return art.enclosure;
  if (Array.isArray(art["media:content"]) && art["media:content"]?.[0]?.$?.url) return art["media:content"][0].$.url;
  if (Array.isArray(art["media:content"]) && art["media:content"]?.[0]?.url) return art["media:content"][0].url;
  if (art["media:content"]?.$?.url) return art["media:content"].$.url;
  if (art["media:content"]?.url) return art["media:content"].url;
  if (Array.isArray(art["media:thumbnail"]) && art["media:thumbnail"]?.[0]?.$?.url) return art["media:thumbnail"][0].$.url;
  if (Array.isArray(art["media:thumbnail"]) && art["media:thumbnail"]?.[0]?.url) return art["media:thumbnail"][0].url;
  if (art["media:thumbnail"]?.$?.url) return art["media:thumbnail"].$.url;
  if (art["media:thumbnail"]?.url) return art["media:thumbnail"].url;
  if (art.og_image) return art.og_image;
  if (Array.isArray(art.images) && art.images[0]) return art.images[0];
  if (art.thumbnail) return art.thumbnail;
  return null;
}

function decodeXmlText(s: string): string {
  return s
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/gi, "$1")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .trim();
}

function stripHtmlTags(s: string): string {
  return s.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function extractFirstImageFromHtml(html: string): string | null {
  const imgRegex = /<img[^>]+src=["']([^"']+)["']/i;
  const match = html.match(imgRegex);
  return match ? match[1] : null;
}

const RSS_FEEDS = [
  "https://www.pib.gov.in/rssfeed.aspx?ModId=6",
  "https://aninews.in/rss/india.xml",
  "https://www.thehindu.com/news/national/feeder/default.rss",
  "https://indianexpress.com/section/india/feed/",
  "https://timesofindia.indiatimes.com/rssfeeds/-2128936835.cms",
  "https://www.ndtv.com/india-news/rss",
  "https://www.hindustantimes.com/feeds/rss/india-news/rssfeed.xml",
];

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email || session.user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    console.log("Fetching news from RSS feeds...");
    const parser = new Parser();
    const savedArticles = [];
    const skipped = [];

    for (const feedUrl of RSS_FEEDS) {
      try {
        console.log(`Fetching RSS feed: ${feedUrl}`);
        
        const feed = await parser.parseURL(feedUrl);
        const items = feed.items || [];
        console.log(`Got ${items.length} items from ${feedUrl}`);

        for (const item of items.slice(0, 3)) {
          if (!item.title) { skipped.push("no-title"); continue; }

          const link = item.link || item.guid;
          if (!link) { skipped.push("no-link"); continue; }

          const existing = await prisma.news.findFirst({
            where: { source_url: link }
          });
          if (existing) { skipped.push(`duplicate: ${item.title.substring(0, 30)}`); continue; }

          try {
            const rawTitle = decodeXmlText(item.title);
            const rawDescription = item.contentSnippet || item.content || item.summary || rawTitle;
            const cleanedDescription = stripHtmlTags(decodeXmlText(rawDescription));
            const category = enforceValidCategory(item.categories?.[0], rawTitle);
            const sourceImage = extractArticleImage(item);
            const cover_image_url = sourceImage || `/api/og?title=${encodeURIComponent(rawTitle)}&category=${encodeURIComponent(category)}`;

            const seoData = await seoOptimize({
              headline: rawTitle,
              summary: cleanedDescription,
              category,
              state_name: "National",
              cover_image_url: sourceImage,
              published_at: item.pubDate || new Date().toISOString()
            });

            const newArt = await prisma.news.create({
              data: {
                headline: rawTitle.trim(),
                summary: seoData.clean_summary || cleanedDescription.substring(0, 200),
                body: seoData.seo_body || cleanedDescription,
                category,
                source_url: link,
                cover_image_url,
                status: "PUBLISHED",
                geo_level: "NATIONAL",
                state: "National",
                posted_by: undefined,
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
            console.log(`✓ Saved: ${rawTitle.substring(0, 50)}`);
            
          } catch (articleError: any) {
            console.error(`✗ Failed to process: ${item.title?.substring(0, 50)} — ${articleError.message}`);
            continue;
          }
        }
      } catch (feedError: any) {
        console.error(`Failed to fetch RSS feed ${feedUrl}:`, feedError.message);
        continue;
      }
    }

    return NextResponse.json({ 
      success: true, 
      saved: savedArticles.length,
      skipped: skipped.length,
      feedsFetched: RSS_FEEDS.length
    });
  } catch (error: any) {
    console.error("[ADMIN_FETCH_NEWS_ERROR]", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
