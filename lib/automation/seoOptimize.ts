import { prisma } from "@/lib/prisma";
import googleTrends from "google-trends-api";

async function callGeminiWithRetry(prompt: string, maxRetries = 3): Promise<string> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }]
          })
        }
      )

      if (response.status === 429) {
        const waitTime = attempt * 45000 // 45s, 90s, 135s
        console.log(`Rate limited. Waiting ${waitTime/1000}s before retry ${attempt}/${maxRetries}`)
        await new Promise(resolve => setTimeout(resolve, waitTime))
        continue
      }

      if (!response.ok) {
        throw new Error(`Gemini error: ${response.status}`)
      }

      const data = await response.json()
      return data.candidates?.[0]?.content?.parts?.[0]?.text || ''

    } catch (err) {
      if (attempt === maxRetries) throw err
      await new Promise(resolve => setTimeout(resolve, 5000))
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
  const seo_title = await callGeminiWithRetry(
    `You are an expert SEO title writer for RAJNEET, India's premier political debate platform. Write ONE title: 55-60 characters, includes the primary keyword, creates urgency without clickbait, sounds like a professional Indian news headline. Return ONLY the title.`,
    `Headline: ${article.headline}\nKeyword: ${primary_keyword}\nCategory: ${article.category}\nState: ${article.state_name}`
  );

  // STEP 3 — CLEAN SUMMARY (2-3 sentences, RAJNEET's own words)
  const clean_summary = await callGeminiWithRetry(
    `You are a news writer for RAJNEET, India's political debate platform. Write a 2-3 sentence summary of this news story IN YOUR OWN WORDS. Do NOT copy the original text. Make it clear, factual, engaging for Indian citizens. No fluff.`,
    `Original news: ${article.summary}\nHeadline: ${article.headline}\nState: ${article.state_name}`
  );

  // STEP 4 — FULL ORIGINAL ARTICLE BODY (300-400 words with 4 paragraphs)
  const full_body = await callGeminiWithRetry(
    `You are a senior political journalist writing for RAJNEET, India's top civic debate platform.

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
- Do NOT copy text from the source
- Return ONLY the article text with paragraph breaks. Nothing else.

Headline: ${article.headline}
Category: ${article.category}
Raw source content: ${article.summary}`
  );

  // STEP 5 — META DESCRIPTION
  const meta_description = await callGeminiWithRetry(
    `Write a Google meta description for this article: exactly 150-160 characters, includes the primary keyword, ends with a subtle CTA. Return ONLY the meta description.`,
    `SEO Title: ${seo_title}\nKeyword: ${primary_keyword}\nSummary: ${clean_summary}`
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
  const focusKeywordsText = await callGemini(
    `Generate exactly 5 SEO focus keywords for this Indian political article. Return ONLY a JSON array of 5 strings.`,
    `Headline: ${article.headline}\nKeyword: ${primary_keyword}\nCategory: ${article.category}\nState: ${article.state_name}\nTrending: ${risingQueries.join(", ")}`
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

