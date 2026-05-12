import { prisma } from "@/lib/prisma";
import googleTrends from "google-trends-api";

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

function isValidArticleBody(text: string): boolean {
  if (!text) return false;
  if (text.length < 800) return false; // Minimum 800 characters
  if (text.split(' ').length < 150) return false; // Minimum 150 words
  if (text.toLowerCase().startsWith('original news')) return false;
  if (text.toLowerCase().startsWith('original:')) return false;
  if (text.split('\n\n').length < 3) return false; // Minimum 3 paragraphs
  return true;
}

interface SEOData {
  headline: string;
  summary: string;
  category: string;
  state_name: string;
  cover_image_url?: string;
  published_at: string;
}

export async function seoOptimize(article: SEOData) {
  let primary_keyword = "";
  let is_trending = false;
  let priority = "normal";
  let risingQueries: string[] = [];
  
  const mainKeyword = article.headline
    .split(" ")
    .filter(w => w.length > 3)
    .slice(0, 3)
    .join(" ");

  // STEP 1 — KEYWORD RESEARCH VIA GOOGLE TRENDS
  try {
    const cached = await prisma.trendsCache.findUnique({
      where: { keyword: mainKeyword }
    });
    const isExpired = cached && (Date.now() - new Date(cached.fetched_at).getTime() > 6 * 60 * 60 * 1000);
    let trendsData: any;

    if (cached && !isExpired) {
      trendsData = cached.result;
    } else {
      await new Promise(resolve => setTimeout(resolve, 2000));
      const res = await googleTrends.relatedQueries({
        keyword: mainKeyword,
        geo: 'IN',
        startTime: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      });
      trendsData = JSON.parse(res);
      await prisma.trendsCache.upsert({
        where: { keyword: mainKeyword },
        update: { result: trendsData, fetched_at: new Date() },
        create: { keyword: mainKeyword, result: trendsData }
      });
    }

    if (trendsData?.default?.rankedList?.[1]?.rankedKeyword) {
      const rising = trendsData.default.rankedList[1].rankedKeyword;
      risingQueries = rising.slice(0, 5).map((q: any) => q.query);
      primary_keyword = risingQueries[0] || mainKeyword;
      is_trending = true;
      priority = "high";
    } else {
      primary_keyword = mainKeyword;
    }
  } catch (error) {
    primary_keyword = mainKeyword;
  }

  // STEP 2 — SEO TITLE
  const seo_title = await callGroqWithRetry(
    `You are a world-class SEO expert for Google ranking optimization. Write ONE SEO-optimized title for RAJNEET, India's political debate platform.

CRITICAL SEO REQUIREMENTS FOR GOOGLE RANKING:
- Length: 50-60 characters (Google displays 50-60 characters in search results)
- Primary keyword placement: Include the primary keyword at the beginning or within first 10 characters
- Search intent: Address user's intent (informational, transactional, or navigational)
- No clickbait: Professional, trustworthy, fact-based
- Indian context: Use terms relevant to Indian politics and current affairs
- Emotional hook: Create urgency or curiosity without being misleading
- Brand mention: Include "RAJNEET" if space allows for brand recognition
- Power words: Use strong action verbs and impactful words
- Numbers: Include relevant numbers/percentages if available

OUTPUT FORMAT: Return ONLY the title text, nothing else.

Headline: ${article.headline}
Primary Keyword: ${primary_keyword}
Category: ${article.category}
State: ${article.state_name}
Trending Keywords: ${risingQueries.join(", ")}`
  );

  // STEP 3 — CLEAN SUMMARY (2-3 sentences, RAJNEET's own words)
  const clean_summary = await callGroqWithRetry(
    `You are an expert SEO content writer for RAJNEET, India's political debate platform. Write a 2-3 sentence summary optimized for Google ranking.

SEO OPTIMIZATION REQUIREMENTS:
- Primary keyword inclusion: Naturally include the primary keyword in the summary
- Search intent: Address what users are searching for regarding this topic
- Readability: Use simple, clear language that scores high on readability tests
- Original content: Write IN YOUR OWN WORDS - do NOT copy from the source
- Indian context: Make it relevant to Indian citizens and current affairs
- Engagement: Make it compelling and share-worthy
- Length: 2-3 sentences, 150-200 characters total
- No fluff: Every word must add value

OUTPUT FORMAT: Return ONLY the summary text, nothing else.

Original news: ${article.summary}
Headline: ${article.headline}
Primary Keyword: ${primary_keyword}
Category: ${article.category}
State: ${article.state_name}`
  );

  // STEP 4 — FULL ORIGINAL ARTICLE BODY (300-400 words with 4 paragraphs)
  const full_body = await callGroqWithRetry(
    `You are a senior political journalist and SEO content expert writing for RAJNEET, India's top civic debate platform.

Write a DETAILED SEO-OPTIMIZED news article for this story. This is NOT a summary. This is a full article.

SEO CONTENT OPTIMIZATION REQUIREMENTS:
- Primary keyword: Naturally include the primary keyword 2-3 times throughout the article
- Secondary keywords: Include 1-2 related keywords from the trending list
- Readability: Use simple, clear language (Flesch Reading Ease score > 60)
- Structure: Use clear paragraph breaks and logical flow
- Indian context: Make it relevant to Indian citizens and current affairs
- Engagement: Include questions and call-to-actions for reader interaction
- Length: Minimum 300 words, maximum 400 words
- Paragraphs: Write exactly 4 paragraphs

PARAGRAPH STRUCTURE:
- Paragraph 1 (Lead): What happened, who was involved, when and where. Include primary keyword. Most important facts first. 4-5 sentences.
- Paragraph 2 (Background): Context and background. Why did this happen. What led to this moment. Include secondary keyword. 4-5 sentences.
- Paragraph 3 (Impact): How does this affect Indian citizens directly. What changes for common people. What are experts or opposition saying. 4-5 sentences.
- Paragraph 4 (Debate): What are the two sides of this issue. End with a question inviting readers to share their stance on RAJNEET. Include primary keyword. 4-5 sentences.

STYLE REQUIREMENTS:
- Write in simple clear English that any Indian citizen can understand
- Do NOT use: "delve", "crucial", "realm", "furthermore", "moreover", "it is worth noting", "in conclusion"
- Do NOT start with "Original news:" or any wire service attribution
- Do NOT copy text from the source
- Return ONLY the article text with paragraph breaks. Nothing else.

Headline: ${article.headline}
Primary Keyword: ${primary_keyword}
Category: ${article.category}
State: ${article.state_name}
Trending Keywords: ${risingQueries.join(", ")}
Raw source content: ${article.summary}`
  );

  // STEP 5 — META DESCRIPTION
  const meta_description = await callGroqWithRetry(
    `You are a Google SEO expert specializing in meta descriptions that drive high CTR and rankings. Write ONE compelling meta description for this article.

GOOGLE META DESCRIPTION OPTIMIZATION REQUIREMENTS:
- Length: 150-160 characters (Google displays 155-160 characters in search results)
- Primary keyword: Include the primary keyword naturally in the first 120 characters
- Search intent: Address what users want to know about this topic
- CTA: End with a strong call-to-action (e.g., "Read more", "Learn more", "Get details")
- Value proposition: Highlight why this content matters to the reader
- Indian context: Make it relevant to Indian citizens and current affairs
- Emotional hook: Create curiosity or urgency without being misleading
- No clickbait: Be factual and trustworthy
- Brand mention: Include "RAJNEET" if space allows

OUTPUT FORMAT: Return ONLY the meta description text, nothing else.

SEO Title: ${seo_title}
Primary Keyword: ${primary_keyword}
Summary: ${clean_summary}
Category: ${article.category}
State: ${article.state_name}`
  );

  // STEP 6 — SLUG
  let slug = seo_title
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .split(" ")
    .filter(w => !["a", "an", "the", "and", "or", "but", "in", "on", "at", "to", "for", "of", "with", "by", "from", "is", "was", "are", "were"].includes(w))
    .join("-")
    .slice(0, 60);
  
  const existingSlug = await prisma.news.findUnique({ where: { slug } });
  if (existingSlug) slug = `${slug}-${Math.floor(Math.random() * 100)}`;

  // STEP 7 — FOCUS KEYWORDS
  const focusKeywordsText = await callGroqWithRetry(
    `You are an expert SEO keyword researcher for Google ranking. Generate exactly 5 high-value SEO focus keywords for this Indian political article.

KEYWORD RESEARCH REQUIREMENTS FOR GOOGLE RANKING:
- Primary keyword: Include the main primary keyword as the first result
- Long-tail keywords: Include 2-3 long-tail keywords (3+ words) with lower competition
- Local SEO: Include 1-2 location-specific keywords (state/city names if relevant)
- Search volume: Focus on keywords with good search volume but lower competition
- User intent: Mix of informational, navigational, and transactional intent keywords
- Indian context: Use terms relevant to Indian politics and current affairs
- No duplicates: All 5 keywords must be unique
- Lowercase: Return all keywords in lowercase

OUTPUT FORMAT: Return ONLY a JSON array of 5 strings, nothing else.

Headline: ${article.headline}
Primary Keyword: ${primary_keyword}
Category: ${article.category}
State: ${article.state_name}
Trending Keywords: ${risingQueries.join(", ")}`
  );
  
  let focus_keywords = [primary_keyword];
  try {
    const cleaned = focusKeywordsText.replace(/```json|```/g, "").trim();
    focus_keywords = JSON.parse(cleaned);
  } catch (e) { /* use default */ }

  // STEP 8 — SCHEMA MARKUP
  const schema_markup = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    "headline": seo_title,
    "description": meta_description,
    "keywords": focus_keywords.join(", "),
    "datePublished": article.published_at,
    "dateModified": article.published_at,
    "author": { "@type": "Organization", "name": "RAJNEET Editorial" },
    "publisher": {
      "@type": "Organization",
      "name": "RAJNEET",
      "url": "https://rajneet.co.in",
      "logo": { "@type": "ImageObject", "url": "https://rajneet.co.in/logo.png" }
    },
    "mainEntityOfPage": { "@type": "WebPage", "@id": `https://rajneet.co.in/news/${slug}` },
    "articleSection": article.category,
    "contentLocation": { "@type": "Place", "name": article.state_name || "India" },
    "image": article.cover_image_url
  });

  // STEP 9 — SEO SCORE
  let seo_score = 0;
  if (seo_title.toLowerCase().includes(primary_keyword.toLowerCase())) seo_score += 20;
  if (meta_description.toLowerCase().includes(primary_keyword.toLowerCase())) seo_score += 15;
  if (meta_description.length >= 130 && meta_description.length <= 165) seo_score += 10;
  if (seo_title.length >= 50 && seo_title.length <= 65) seo_score += 10;
  if (slug.length > 0) seo_score += 10;
  if (focus_keywords.length >= 4) seo_score += 10;
  if (schema_markup) seo_score += 10;
  if (is_trending) seo_score += 10;
  if (full_body.length > 500) seo_score += 15;

  if (seo_score >= 70) priority = "high";

  return {
    seo_title,
    meta_description,
    slug,
    focus_keywords,
    schema_markup,
    // summary is the clean 2-3 sentence version
    clean_summary,
    // body is the full 700-900 word original article
    seo_body: full_body,
    seo_score,
    primary_keyword,
    is_trending,
    priority
  };
}

