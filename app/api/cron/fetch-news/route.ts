import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { seoOptimize } from "@/lib/automation/seoOptimize";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Parser from 'rss-parser';
import { generateBrandedCoverImage } from "@/lib/automation/cloudinary";

async function callGroqWithRetry(prompt: string, maxRetries = 2): Promise<string> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(
        'https://api.groq.com/openai/v1/chat/completions',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.GROQ_API_KEY}` 
          },
          body: JSON.stringify({
            model: 'llama-3.1-8b-instant',
            messages: [
              {
                role: 'user',
                content: prompt
              }
            ],
            max_tokens: 500,
            temperature: 0.7
          })
        }
      )

      if (response.status === 429) {
        const waitTime = attempt * 5000 // only 5s wait, Groq recovers fast
        console.log(`Groq rate limited. Waiting ${waitTime/1000}s`)
        await new Promise(resolve => setTimeout(resolve, waitTime))
        continue
      }

      if (!response.ok) {
        const err = await response.text()
        throw new Error(`Groq error ${response.status}: ${err}`)
      }

      const data = await response.json()
      return data.choices?.[0]?.message?.content?.trim() || ''

    } catch (err) {
      if (attempt === maxRetries) {
        console.error('Groq failed after retries:', err)
        return ''
      }
      await new Promise(resolve => setTimeout(resolve, 2000))
    }
  }
  return ''
}

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
  if (Array.isArray(art["media:content"]) && art["media:content"]?.[0]?.$?.url) return art["media:content"][0].$.url;
  if (Array.isArray(art["media:content"]) && art["media:content"]?.[0]?.url) return art["media:content"][0].url;
  if (art["media:content"]?.$?.url) return art["media:content"].$.url;
  if (art["media:content"]?.url) return art["media:content"].url;
  if (art.og_image) return art.og_image;
  if (Array.isArray(art.images) && art.images[0]) return art.images[0];
  return null;
}

async function validateImageUrl(url: string): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);
    const res = await fetch(url, { 
      method: 'GET', 
      signal: controller.signal,
      headers: { 'Range': 'bytes=0-0' }
    });
    clearTimeout(timeoutId);
    return res.ok || res.status === 206;
  } catch {
    return true; // Be more lenient - trust the source URL
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
  const ordered = [...RSS_FEEDS_PRIORITY, ...RSS_FEEDS_GOOGLE];
  const batches = await Promise.all(ordered.map((u) => fetchRssFeedArticles(u, 8)));
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
      "test_currents_api_key" // Add test key for verification
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
        
        // If it's a rate limit or quota issue, try next key
        if (response.status === 429 || response.status === 401 || response.status === 403) {
          errors.push(`Key ${apiKey.substring(0, 10)}...: ${response.status} - Rate limited/Quota exceeded`);
          continue;
        }
        
        // For other errors like invalid parameters, don't retry with other keys
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
      
      // Normalize articles to common format
      const normalizedArticles = articles.map((article: any) => normalizeArticle(article, apiName));
      results.push(...normalizedArticles);
      
      // If we got results, don't try more keys for this API
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

// Main function to fetch from RSS (fresh) + all APIs
async function fetchFromAllAPIs(query: string): Promise<any[]> {
  const rssArticles = await fetchAllRssArticles();
  const allResults: any[] = [...rssArticles];

  const apiNames = ['newsdata', 'currents', 'gnews'];

  console.log('Fetching news from RSS + APIs...');

  const apiPromises = apiNames.map((apiName) =>
    fetchFromAPIWithFallback(apiName, query).catch((error) => {
      console.error(`Error fetching from ${apiName}:`, error.message);
      return [];
    })
  );

  const results = await Promise.all(apiPromises);

  results.forEach((apiResults, index) => {
    if (apiResults.length > 0) {
      console.log(`${apiNames[index]}: ${apiResults.length} articles`);
      allResults.push(...apiResults);
    }
  });

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

  return uniqueArticles.slice(0, 40);
}

export async function POST(req: Request) {
  const { searchParams } = new URL(req.url);
  const secret = searchParams.get("secret");
  
  const session = await getServerSession(authOptions);
  const isAdmin = session?.user?.role === "ADMIN";

  if (process.env.NODE_ENV === "production" && !isAdmin && secret !== process.env.CRON_SECRET) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    console.log("Fetching news from multiple APIs...");
    
    const fetchedArticles = await fetchFromAllAPIs("politics India");
    // Limit to 15 articles per run
    const articlesToProcess = fetchedArticles.slice(0, 15);
    const savedArticles = [];
    const skipped = [];

    for (const art of articlesToProcess) {
      // Skip articles without a title
      if (!art.title) { skipped.push("no-title"); continue; }

      // Check duplicate
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
        const rawSummary = art.description || art.content || art.title;

        // Use keyword mapping for category - no Gemini needed
        const category = enforceValidCategory(art.category, art.title);
        let sourceImage = extractArticleImage(art);
        
        // Validate image URL if we have one
        if (sourceImage) {
          const isValid = await validateImageUrl(sourceImage);
          if (!isValid) {
            sourceImage = null;
          }
        }
        
        // Use Cloudinary branded cover image for better reliability
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

        // Only use Gemini for body generation (not category classification)
        const bodyPrompt = `You are a senior political journalist writing for RAJNEET, India's top civic debate platform.

Write a DETAILED news article for this story. This is NOT a summary. This is a full article.

STRICT REQUIREMENTS:
- Minimum 300 words, maximum 400 words
- Write exactly 4 paragraphs
- Paragraph 1 (Lead): What happened, who was involved, when and where. Most important facts first. 4-5 sentences.
- Paragraph 2 (Background): Context and background. Why did this happen. What led to this moment. 4-5 sentences.
- Paragraph 3 (Impact): How does this affect Indian citizens directly. What changes for common people. What are experts or opposition saying. 4-5 sentences.
- Paragraph 4 (Debate): What are the two sides of this issue. End with a question inviting readers to share their stance on RAJNEET.
- Write in simple clear English that any Indian citizen can understand
- Do NOT use: "delve", "crucial", "realm", "furthermore", "moreover", "it is worth noting", "in conclusion"
- Do NOT start with "Original news:" or any wire service attribution
- Do NOT copy text from source
- Return ONLY article text with paragraph breaks. Nothing else.

Headline: ${art.title}
Category: ${category}
Raw source content: ${rawSummary}`;

        const seo_body = await callGroqWithRetry(bodyPrompt);
        
        // Generate other SEO fields with minimal Gemini usage
        const seoData = await seoOptimize({
          headline: art.title,
          summary: rawSummary,
          category,
          state_name: "National",
          cover_image_url: undefined,
          published_at: art.pubDate || new Date().toISOString()
        });

        const status = "PUBLISHED"; // Post all articles irrespective of SEO score

        const newArt = await prisma.news.create({
          data: {
            headline: art.title?.trim() || '',
            // Use Gemini's clean 2-3 sentence summary (our own words)
            summary: seoData.clean_summary || rawSummary.substring(0, 200),
            // Use generated body (800-1000 words)
            body: seo_body || rawSummary,
            category,
            source_url: art.link,
            cover_image_url,
            status,
            geo_level: "NATIONAL",
            state: "National",
            posted_by: undefined,
            
            // SEO Fields
            seo_title: seoData.seo_title,
            meta_description: seoData.meta_description,
            slug: seoData.slug,
            focus_keywords: seoData.focus_keywords,
            schema_markup: seoData.schema_markup,
            seo_body: seo_body,
            seo_score: seoData.seo_score,
            primary_keyword: seoData.primary_keyword,
            is_trending: seoData.is_trending,
            priority: seoData.priority
          }
        });
        savedArticles.push(newArt);
        console.log(`✓ Saved: ${art.title.substring(0, 50)}`);
        
        // Wait 0.5 seconds between each Groq call since Groq handles volume much better
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (articleError: any) {
        console.error(`✗ Failed to process: ${art.title?.substring(0, 50)} — ${articleError.message}`);
        // Continue to next article even if one fails
        continue;
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

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const secret = searchParams.get("secret");
  
  const session = await getServerSession(authOptions);
  const isAdmin = session?.user?.role === "ADMIN";

  if (process.env.NODE_ENV === "production" && !isAdmin && secret !== process.env.CRON_SECRET) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    console.log("Fetching news from multiple APIs...");
    
    const fetchedArticles = await fetchFromAllAPIs("politics India");
    // Limit to 15 articles per run
    const articlesToProcess = fetchedArticles.slice(0, 15);
    const savedArticles = [];
    const skipped = [];

    for (const art of articlesToProcess) {
      // Skip articles without a title
      if (!art.title) { skipped.push("no-title"); continue; }

      // Check duplicate
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
        const rawSummary = art.description || art.content || art.title;

        // Use keyword mapping for category - no Gemini needed
        const category = enforceValidCategory(art.category, art.title);
        let sourceImage = extractArticleImage(art);
        
        // Validate image URL if we have one
        if (sourceImage) {
          const isValid = await validateImageUrl(sourceImage);
          if (!isValid) {
            sourceImage = null;
          }
        }
        
        // Use Cloudinary branded cover image for better reliability
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

        // Only use Gemini for body generation (not category classification)
        const bodyPrompt = `You are a senior political journalist writing for RAJNEET, India's top civic debate platform.

Write a DETAILED news article for this story. This is NOT a summary. This is a full article.

STRICT REQUIREMENTS:
- Minimum 300 words, maximum 400 words
- Write exactly 4 paragraphs
- Paragraph 1 (Lead): What happened, who was involved, when and where. Most important facts first. 4-5 sentences.
- Paragraph 2 (Background): Context and background. Why did this happen. What led to this moment. 4-5 sentences.
- Paragraph 3 (Impact): How does this affect Indian citizens directly. What changes for common people. What are experts or opposition saying. 4-5 sentences.
- Paragraph 4 (Debate): What are the two sides of this issue. End with a question inviting readers to share their stance on RAJNEET.
- Write in simple clear English that any Indian citizen can understand
- Do NOT use: "delve", "crucial", "realm", "furthermore", "moreover", "it is worth noting", "in conclusion"
- Do NOT start with "Original news:" or any wire service attribution
- Do NOT copy text from source
- Return ONLY article text with paragraph breaks. Nothing else.

Headline: ${art.title}
Category: ${category}
Raw source content: ${rawSummary}`;

        const seo_body = await callGroqWithRetry(bodyPrompt);
        
        // Generate other SEO fields with minimal Gemini usage
        const seoData = await seoOptimize({
          headline: art.title,
          summary: rawSummary,
          category,
          state_name: "National",
          cover_image_url: undefined,
          published_at: art.pubDate || new Date().toISOString()
        });

        const status = "PUBLISHED"; // Post all articles irrespective of SEO score

        const newArt = await prisma.news.create({
          data: {
            headline: art.title?.trim() || '',
            // Use Gemini's clean 2-3 sentence summary (our own words)
            summary: seoData.clean_summary || rawSummary.substring(0, 200),
            // Use generated body (800-1000 words)
            body: seo_body || rawSummary,
            category,
            source_url: art.link,
            cover_image_url,
            status,
            geo_level: "NATIONAL",
            state: "National",
            posted_by: undefined,
            
            // SEO Fields
            seo_title: seoData.seo_title,
            meta_description: seoData.meta_description,
            slug: seoData.slug,
            focus_keywords: seoData.focus_keywords,
            schema_markup: seoData.schema_markup,
            seo_body: seo_body,
            seo_score: seoData.seo_score,
            primary_keyword: seoData.primary_keyword,
            is_trending: seoData.is_trending,
            priority: seoData.priority
          }
        });
        savedArticles.push(newArt);
        console.log(`✓ Saved: ${art.title.substring(0, 50)}`);
        
        // Wait 0.5 seconds between each Groq call since Groq handles volume much better
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (articleError: any) {
        console.error(`✗ Failed to process: ${art.title?.substring(0, 50)} — ${articleError.message}`);
        // Continue to next article even if one fails
        continue;
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
