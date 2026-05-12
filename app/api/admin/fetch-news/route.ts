import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { seoOptimize } from "@/lib/automation/seoOptimize";

export const dynamic = "force-dynamic";

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
  if (art.enclosure?.url) return art.enclosure.url;
  if (Array.isArray(art["media:content"]) && art["media:content"]?.[0]?.url) return art["media:content"][0].url;
  if (art["media:content"]?.url) return art["media:content"].url;
  if (art.og_image) return art.og_image;
  if (Array.isArray(art.images) && art.images[0]) return art.images[0];
  return null;
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email || session.user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    console.log("Fetching news from NewsData API...");
    
    if (!process.env.NEWSDATA_API_KEY) {
      throw new Error("NEWSDATA_API_KEY is not set in environment variables");
    }

    const response = await fetch(
      `https://newsdata.io/api/1/news?apikey=${process.env.NEWSDATA_API_KEY}&q=politics%20India&language=en&size=15`
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[NEWSDATA_API_ERROR]", response.status, errorText);
      throw new Error(`NewsData API error: ${response.status} - ${errorText || "Unknown error"}`);
    }

    const contentType = response.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
      const text = await response.text();
      console.error("[NEWSDATA_API_INVALID_RESPONSE]", text);
      throw new Error("NewsData API returned non-JSON response");
    }

    let data;
    try {
      data = await response.json();
    } catch (parseError: any) {
      console.error("[NEWSDATA_API_PARSE_ERROR]", parseError);
      throw new Error("Failed to parse NewsData API response");
    }
    
    if (!data.results) {
      throw new Error(data.message || "Failed to fetch news from API");
    }

    const fetchedArticles = data.results;
    const articlesToProcess = fetchedArticles.slice(0, 15);
    const savedArticles = [];
    const skipped = [];

    for (const art of articlesToProcess) {
      if (!art.title) { skipped.push("no-title"); continue; }

      const existing = await prisma.news.findFirst({
        where: { source_url: art.link }
      });
      if (existing) { skipped.push(art.title); continue; }

      try {
        const rawSummary = art.description || art.content || art.title;
        const category = enforceValidCategory(art.category, art.title);
        const sourceImage = extractArticleImage(art);
        const cover_image_url = sourceImage || `/api/og?title=${encodeURIComponent(art.title)}&category=${encodeURIComponent(category)}`;

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
        
        const seoData = await seoOptimize({
          headline: art.title,
          summary: rawSummary,
          category,
          state_name: "National",
          cover_image_url: undefined,
          published_at: art.pubDate || new Date().toISOString()
        });

        const status = "PUBLISHED";

        const newArt = await prisma.news.create({
          data: {
            headline: art.title?.trim() || '',
            summary: seoData.clean_summary || rawSummary.substring(0, 200),
            body: seo_body || rawSummary,
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
            seo_body: seo_body,
            seo_score: seoData.seo_score,
            primary_keyword: seoData.primary_keyword,
            is_trending: seoData.is_trending,
            priority: seoData.priority
          }
        });
        savedArticles.push(newArt);
        console.log(`✓ Saved: ${art.title.substring(0, 50)}`);
        
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (articleError: any) {
        console.error(`✗ Failed to process: ${art.title?.substring(0, 50)} — ${articleError.message}`);
        continue;
      }
    }

    return NextResponse.json({ 
      success: true, 
      fetched: fetchedArticles.length,
      saved: savedArticles.length,
      skipped: skipped.length
    });
  } catch (error: any) {
    console.error("[ADMIN_FETCH_NEWS_ERROR]", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
