import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { seoOptimize } from "@/lib/automation/seoOptimize";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

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
    // Limit to 15 articles per run// Process max 5 articles at once to avoid Groq limits
    const articlesToProcess = fetchedArticles.slice(0, 5);
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

      try {
        const rawSummary = art.description || art.content || art.title;

        // Use keyword mapping for category - no Gemini needed
        const category = enforceValidCategory(art.category, art.title);
        const sourceImage = extractArticleImage(art);
        const cover_image_url = sourceImage || `/api/og?title=${encodeURIComponent(art.title)}&category=${encodeURIComponent(category)}`;

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
