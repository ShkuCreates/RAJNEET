import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Parser from 'rss-parser';
import { generateBrandedCoverImage } from "@/lib/automation/cloudinary";

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

async function validateImageUrl(url: string): Promise<boolean> {
  if (!url) return false;
  try {
    new URL(url); // Basic URL validation
    return true; // Be very lenient - trust the source URL
  } catch {
    return false;
  }
}

const MAX_ARTICLE_AGE_MS = 48 * 60 * 60 * 1000;

/** Fetched first (wire-style + major Indian outlets), then Google topic feeds. */
const RSS_FEEDS_PRIORITY = [
  "https://www.pib.gov.in/rssfeed.aspx?ModId=6",
  "https://aninews.in/rss/india.xml",
  "https://www.thehindu.com/news/national/feeder/default.rss",
  "https://indianexpress.com/section/india/feed/",
  "https://timesofindia.indiatimes.com/rssfeeds/-2128936835.cms",
  "https://www.ndtv.com/india-news/rss",
  "https://www.hindustantimes.com/feeds/rss/india-news/rssfeed.xml",
];

const RSS_FEEDS_GOOGLE = [
  "https://news.google.com/rss/search?q=india+politics&hl=en-IN&gl=IN&ceid=IN:en",
  "https://news.google.com/rss/search?q=india+economy&hl=en-IN&gl=IN&ceid=IN:en",
  "https://news.google.com/rss/search?q=india+sports&hl=en-IN&gl=IN&ceid=IN:en",
];

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

function extractXmlTag(block: string, tag: string): string {
  const re = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, "i");
  const m = block.match(re);
  if (!m) return "";
  return decodeXmlText(m[1].trim());
}

function splitRssItems(xml: string): string[] {
  const re = /<item[^>]*>([\s\S]*?)<\/item>/gi;
  const parts: string[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(xml)) !== null) {
    parts.push(m[1]);
    if (parts.length >= 14) break;
  }
  return parts;
}

function articleAgeOk(pubDate?: string): boolean {
  if (!pubDate) return false;
  const t = new Date(pubDate).getTime();
  if (!Number.isFinite(t)) return false;
  return Date.now() - t <= MAX_ARTICLE_AGE_MS;
}

function extractFirstImageFromHtml(html: string): string | null {
  const imgRegex = /<img[^>]+src=["']([^"']+)["']/i;
  const match = html.match(imgRegex);
  return match ? match[1] : null;
}

async function fetchRssFeedArticles(feedUrl: string, perFeedLimit = 8): Promise<any[]> {
  try {
    const res = await fetch(feedUrl, {
      headers: { "User-Agent": "RAJNEET/1.0 (+https://rajneet.co.in)" },
      cache: "no-store",
    });
    if (!res.ok) {
      console.log(`RSS non-OK ${res.status}: ${feedUrl}`);
      return [];
    }
    const xml = await res.text();
    const innerBlocks = splitRssItems(xml);
    const host = (() => {
      try {
        return new URL(feedUrl).hostname;
      } catch {
        return "rss";
      }
    })();
    const out: any[] = [];
    for (const inner of innerBlocks.slice(0, perFeedLimit)) {
      let title = extractXmlTag(inner, "title");
      title = stripHtmlTags(title);
      let link =
        extractXmlTag(inner, "link").replace(/<[^>]+>/g, "").trim() ||
        extractXmlTag(inner, "guid").replace(/<[^>]+>/g, "").trim();
      const pubDate =
        extractXmlTag(inner, "pubDate") ||
        extractXmlTag(inner, "dc:date") ||
        extractXmlTag(inner, "published");
      const description =
        extractXmlTag(inner, "description") || extractXmlTag(inner, "summary") || "";
      if (!title || !link) continue;
      if (!articleAgeOk(pubDate)) continue;
      
      let image_url = null;
      
      const enclosureUrlMatch = inner.match(/<enclosure[^>]+url=["']([^"']+)["']/i);
      if (enclosureUrlMatch) image_url = enclosureUrlMatch[1];
      
      const mediaContentMatch = inner.match(/<media:content[^>]+url=["']([^"']+)["']/i);
      if (!image_url && mediaContentMatch) image_url = mediaContentMatch[1];
      
      const mediaThumbnailMatch = inner.match(/<media:thumbnail[^>]+url=["']([^"']+)["']/i);
      if (!image_url && mediaThumbnailMatch) image_url = mediaThumbnailMatch[1];
      
      if (!image_url) {
        image_url = extractFirstImageFromHtml(description);
      }
      
      out.push({
        title,
        description: stripHtmlTags(description).slice(0, 500),
        content: stripHtmlTags(description).slice(0, 800),
        link,
        pubDate: pubDate || new Date().toISOString(),
        image_url,
        category: "politics",
        source: `rss:${host}`,
      });
    }
    return out;
  } catch (e: any) {
    console.error(`RSS fetch error ${feedUrl}:`, e?.message || e);
    return [];
  }
}

async function fetchAllRssArticles(): Promise<any[]> {
  const ordered = [...RSS_FEEDS_PRIORITY];
  const batches: any[] = [];
  
  for (const u of ordered) {
    const articles = await fetchRssFeedArticles(u, 5);
    batches.push(articles);
  }
  
  return batches.flat();
}

// Multiple API configurations for different news sources
const API_CONFIGS = {
  newsdata: {
    keys: [
      process.env.NEWSDATA_API_KEY,
      process.env.NEWSDATA_API_KEY_2,
      process.env.NEWSDATA_API_KEY_3,
      "5gRpK5NKilKfCPdtkvC2oEZBFHNuT-z1bbozEY6Cq42JY--H"
    ].filter(Boolean),
    baseUrl: "https://newsdata.io/api/1/news",
    queryParams: "&language=en"
  },
  currents: {
    keys: [
      process.env.CURRENTS_API_KEY,
      process.env.CURRENTS_API_KEY_2,
      process.env.CURRENTS_API_KEY_3,
      "test_currents_api_key"
    ].filter(Boolean),
    baseUrl: "https://api.currentsapi.services/v1/search",
    queryParams: "&language=en&limit=10"
  },
  gnews: {
    keys: [
      process.env.GNEWS_API_KEY,
      process.env.GNEWS_API_KEY_2,
      "4d0204f121a0846d1a8a1096d5352f08"
    ].filter(Boolean),
    baseUrl: "https://gnews.io/api/v4/search",
    queryParams: "&lang=en&max=10&sortby=publishedAt"
  }
};

// Normalize article data from different APIs to common format
function normalizeArticle(article: any, source: string): any {
  switch (source) {
    case 'newsdata':
      return {
        title: article.title,
        description: article.description,
        content: article.content,
        link: article.link,
        pubDate: article.pubDate,
        image_url: article.image_url,
        category: article.category,
        source: 'newsdata'
      };
    
    case 'currents':
      return {
        title: article.title,
        description: article.description,
        content: article.description, // Currents API doesn't have separate content field
        link: article.url,
        pubDate: article.published,
        image_url: article.image,
        category: article.category || 'general',
        source: 'currents'
      };
    
    case 'gnews':
      return {
        title: article.title,
        description: article.description,
        content: article.content,
        link: article.url,
        pubDate: article.publishedAt,
        image_url: article.image,
        category: article.source?.name || 'general',
        source: 'gnews'
      };
    
    default:
      return article;
  }
}

async function fetchFromAPIWithFallback(apiName: string, query: string): Promise<any[]> {
  const config = API_CONFIGS[apiName as keyof typeof API_CONFIGS];
  if (!config || config.keys.length === 0) {
    console.log(`No API keys configured for ${apiName}`);
    return [];
  }

  const results: any[] = [];
  const errors: string[] = [];
  
  for (const apiKey of config.keys) {
    if (!apiKey) {
      continue; // Skip null/undefined keys
    }
    
    try {
      console.log(`Trying ${apiName} API key: ${apiKey.substring(0, 10)}...`);
      
      let url = `${config.baseUrl}?`;
      
      if (apiName === 'newsdata') {
        url += `apikey=${apiKey}&q=${encodeURIComponent(query)}${config.queryParams}&timeframe=12&prioritydomain=top`;
      } else if (apiName === 'currents') {
        url += `apiKey=${apiKey}&keywords=${encodeURIComponent(query)}${config.queryParams}`;
      } else if (apiName === 'gnews') {
        url += `token=${apiKey}&q=${encodeURIComponent(query)}${config.queryParams}`;
      }
      
      const response = await fetch(url);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[${apiName.toUpperCase()}_API_ERROR] Key ${apiKey.substring(0, 10)}...:`, response.status, errorText);
        
        if (response.status === 429 || response.status === 401 || response.status === 403) {
          errors.push(`Key ${apiKey.substring(0, 10)}...: ${response.status} - Rate limited/Quota exceeded`);
          continue;
        }
        
        if (response.status === 422 || response.status === 400) {
          console.log(`Parameter error with ${apiName}, skipping this API`);
          return [];
        }
        
        errors.push(`Key ${apiKey.substring(0, 10)}...: ${response.status} - ${errorText}`);
        continue;
      }

      const contentType = response.headers.get("content-type") || "";
      if (!contentType.includes("application/json")) {
        errors.push(`Key ${apiKey.substring(0, 10)}...: Invalid response type`);
        continue;
      }

      const data = await response.json();
      let articles: any[] = [];
      
      if (apiName === 'newsdata' && data.results) {
        articles = data.results;
      } else if (apiName === 'currents' && data.news) {
        articles = data.news;
      } else if (apiName === 'gnews' && data.articles) {
        articles = data.articles;
      }
      
      if (articles.length === 0) {
        errors.push(`Key ${apiKey.substring(0, 10)}...: No articles in response`);
        continue;
      }
      
      console.log(`✓ Success with ${apiName} key ${apiKey.substring(0, 10)}...: ${articles.length} articles`);
      
      const normalizedArticles = articles.map((article: any) => normalizeArticle(article, apiName));
      results.push(...normalizedArticles);
      
      break;
      
    } catch (error: any) {
      console.error(`${apiName} key ${apiKey.substring(0, 10)}... failed:`, error.message);
      errors.push(`Key ${apiKey.substring(0, 10)}...: ${error.message}`);
      continue;
    }
  }
  
  if (results.length === 0 && errors.length > 0) {
    console.log(`All ${apiName} API keys failed. Errors: ${errors.join('; ')}`);
  }
  
  return results;
}

async function fetchFromAllAPIs(query: string): Promise<any[]> {
  const rssArticles = await fetchAllRssArticles();
  const allResults: any[] = [...rssArticles];

  const apiNames = ['newsdata'];

  console.log('Fetching news from RSS + APIs...');

  for (const apiName of apiNames) {
    try {
      const apiResults = await fetchFromAPIWithFallback(apiName, query);
      if (apiResults.length > 0) {
        console.log(`${apiName}: ${apiResults.length} articles`);
        allResults.push(...apiResults);
        break;
      }
    } catch (error) {
      console.error(`Error fetching from ${apiName}:`, error);
    }
  }

  console.log(`Total articles before dedupe: ${allResults.length}`);

  const uniqueArticles: any[] = [];
  const seenUrls = new Set<string>();

  for (const article of allResults) {
    if (article.link && !seenUrls.has(article.link)) {
      seenUrls.add(article.link);
      uniqueArticles.push(article);
    }
  }

  uniqueArticles.sort((a, b) => {
    const ta = new Date(a.pubDate || 0).getTime();
    const tb = new Date(b.pubDate || 0).getTime();
    return tb - ta;
  });

  console.log(`Unique articles after dedupe: ${uniqueArticles.length}`);

  return uniqueArticles.slice(0, 20);
}

async function processArticles(art: any, category: string) {
  const rawSummary = art.description || art.content || art.title;
  
  let sourceImage = extractArticleImage(art);
  
  if (sourceImage) {
    const isValid = await validateImageUrl(sourceImage);
    if (!isValid) {
      sourceImage = null;
    }
  }
  
  let cover_image_url = sourceImage;
  if (!sourceImage) {
    try {
      const tempSlug = art.title.substring(0, 50).toLowerCase().replace(/[^a-z0-9]/g, '-');
      cover_image_url = await generateBrandedCoverImage(art.title, category, tempSlug);
    } catch (e) {
      console.error('Failed to generate cover image:', e);
      cover_image_url = `/api/og?title=${encodeURIComponent(art.title)}&category=${encodeURIComponent(category)}`;
    }
  }

  const generateSimpleSeoData = (headline: string, description: string, content: string) => {
    const seoTitle = headline.length > 60 ? headline.substring(0, 57) + "..." : headline;
    
    const fullText = [description, content, headline].filter(Boolean).join(" ");
    const cleanText = stripHtmlTags(decodeXmlText(fullText));
    
    let cleanSummary = cleanText.substring(0, 250);
    if (cleanSummary.length === 250) {
      const lastPeriod = cleanSummary.lastIndexOf('.');
      const lastSpace = cleanSummary.lastIndexOf(' ');
      const cutOff = Math.max(lastPeriod, lastSpace);
      if (cutOff > 100) {
        cleanSummary = cleanSummary.substring(0, cutOff + 1);
      }
    }
    
    const metaDesc = cleanSummary.length > 160 ? cleanSummary.substring(0, 157) + "..." : cleanSummary;
    const slug = headline
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
      .substring(0, 100);
    const focusKeywords = headline
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 3)
      .slice(0, 5);
    
    return {
      seo_title: seoTitle,
      meta_description: metaDesc,
      slug,
      focus_keywords: focusKeywords,
      primary_keyword: focusKeywords[0] || category.toLowerCase(),
      clean_summary: cleanSummary,
      is_trending: false,
      priority: "normal",
      seo_score: 75,
      schema_markup: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "NewsArticle",
        headline: seoTitle,
        description: metaDesc,
        datePublished: art.pubDate || new Date().toISOString(),
      })
    };
  };

  const buildArticleBody = (title: string, description: string, content: string) => {
    const allContent = [content, description, title].filter(Boolean).join(" ");
    const cleanText = stripHtmlTags(decodeXmlText(allContent)).trim();
    const sentences = cleanText.match(/[^.!?]+[.!?]+/g) || [cleanText];
    
    let body = "";
    
    if (sentences.length >= 2) {
      const numSentences = Math.min(sentences.length, 5);
      const firstPart = sentences.slice(0, numSentences).join(' ').trim();
      body += firstPart + "\n\n";
      
      if (sentences.length > numSentences) {
        const secondPart = sentences.slice(numSentences, numSentences + 3).join(' ').trim();
        if (secondPart.length > 50) {
          body += secondPart + "\n\n";
        }
      }
    } else {
      body += `${title}. This is an important development that has caught the attention of people across India. The news is being widely discussed and has significant implications for the region.` + "\n\n";
      body += `According to initial reports, ${cleanText.substring(0, Math.min(cleanText.length, 300))}. This situation is evolving rapidly, and more details are expected to emerge in the coming hours and days.` + "\n\n";
    }
    
    body += `This story is still developing, and there are multiple perspectives on what this means for India. Some view this as a positive step forward, while others have concerns about the implications. What do you think about this development? Join the debate on RAJNEET and share your opinion with the community.`;
    
    return body;
  };

  const seoData = generateSimpleSeoData(art.title, art.description, art.content);
  const articleBody = buildArticleBody(art.title, art.description, art.content);

  const status = "PUBLISHED";

  return prisma.news.create({
    data: {
      headline: art.title?.trim() || '',
      summary: seoData.clean_summary || rawSummary.substring(0, 200),
      body: articleBody,
      category,
      source_url: art.link,
      cover_image_url,
      status,
      geo_level: "NATIONAL",
      state: "National",
      posted_by: undefined,
      
      seo_title: seoData.seo_title,
      meta_description: seoData.meta_description,
      slug: seoData.slug,
      focus_keywords: seoData.focus_keywords,
      schema_markup: seoData.schema_markup,
      seo_body: articleBody,
      seo_score: seoData.seo_score,
      primary_keyword: seoData.primary_keyword,
      is_trending: seoData.is_trending,
      priority: seoData.priority
    }
  });
}

async function handleRequest(req: Request) {
  const { searchParams } = new URL(req.url);
  const secret = searchParams.get("secret");
  
  const session = await getServerSession(authOptions);
  const isAdmin = session?.user?.role === "ADMIN";

  if (process.env.NODE_ENV === "production" && !isAdmin && secret !== process.env.CRON_SECRET) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    console.log("Fetching news from RSS...");
    
    const fetchedArticles = await fetchFromAllAPIs("politics India");
    const articlesToProcess = fetchedArticles.slice(0, 8);
    const savedArticles = [];
    const skipped = [];

    for (const art of articlesToProcess) {
      if (!art.title) { skipped.push("no-title"); continue; }

      const existing = await prisma.news.findFirst({
        where: { source_url: art.link }
      });
      if (existing) { skipped.push(art.title); continue; }

      if (art.pubDate) {
        const pubTs = new Date(art.pubDate).getTime();
        if (Number.isFinite(pubTs) && Date.now() - pubTs > MAX_ARTICLE_AGE_MS) {
          console.log("Skipping old article:", art.title);
          skipped.push("too-old");
          continue;
        }
      }

      try {
        const category = enforceValidCategory(art.category, art.title);
        const newArt = await processArticles(art, category);
        savedArticles.push(newArt);
        console.log(`✓ Saved: ${art.title.substring(0, 50)}`);
      } catch (articleError: any) {
        console.error(`✗ Failed to process: ${art.title?.substring(0, 50)} — ${articleError.message}`);
        continue;
      }
    }

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

export async function POST(req: Request) {
  return handleRequest(req);
}

export async function GET(req: Request) {
  return handleRequest(req);
}
