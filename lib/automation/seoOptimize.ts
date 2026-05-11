import { prisma } from "@/lib/prisma";
import googleTrends from "google-trends-api";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

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
  const seo_title = await callGemini(
    `You are an expert SEO title writer for RAJNEET, India's premier political debate platform. Write ONE title: 55-60 characters, includes the primary keyword, creates urgency without clickbait, sounds like a professional Indian news headline. Return ONLY the title.`,
    `Headline: ${article.headline}\nKeyword: ${primary_keyword}\nCategory: ${article.category}\nState: ${article.state_name}`
  );

  // STEP 3 — CLEAN SUMMARY (2-3 sentences, RAJNEET's own words)
  const clean_summary = await callGemini(
    `You are a news writer for RAJNEET, India's political debate platform. Write a 2-3 sentence summary of this news story IN YOUR OWN WORDS. Do NOT copy the original text. Make it clear, factual, engaging for Indian citizens. No fluff.`,
    `Original news: ${article.summary}\nHeadline: ${article.headline}\nState: ${article.state_name}`
  );

  // STEP 4 — FULL ORIGINAL ARTICLE BODY (SEO-optimized, 700-900 words)
  const full_body = await callGemini(
    `You are a senior political journalist at RAJNEET, India's civic engagement platform. Write a complete, ORIGINAL news article based on the information provided. 

RULES:
- Write entirely in YOUR OWN WORDS. Do NOT copy the original text.
- 700 to 900 words total
- Structure it like a premium news article with HTML tags:
  * Start with <p class="lead-para"><strong>[2-sentence engaging intro with primary keyword]</strong></p>
  * Use <h2> for section headings (3-4 sections)
  * Use <p> for body paragraphs (2-3 sentences each)
  * Use <ul><li> for key facts or bullet points where relevant
  * End with <div class="debate-hook"><p><strong>What does this mean for you?</strong> [1 sentence connecting to citizens] Share your stance in the debate below.</p></div>
- Include primary keyword naturally in first paragraph and at least 2 more times
- Include at least 2 focus keywords naturally
- Write for an Indian audience; reference Indian context where relevant
- Tone: factual, clear, slightly opinionated — like The Wire or Scroll but punchier
- Do NOT use words: delve, crucial, realm, landscape, furthermore, moreover, it is worth noting, in conclusion
- Return ONLY the HTML article content, nothing else`,
    `Original news: ${article.summary}\nHeadline: ${article.headline}\nPrimary keyword: ${primary_keyword}\nFocus keywords: ${risingQueries.join(", ") || primary_keyword}\nCategory: ${article.category}\nState: ${article.state_name}`
  );

  // STEP 5 — META DESCRIPTION
  const meta_description = await callGemini(
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
      "url": "https://rajneet.in",
      "logo": { "@type": "ImageObject", "url": "https://rajneet.in/logo.png" }
    },
    "mainEntityOfPage": { "@type": "WebPage", "@id": `https://rajneet.in/news/${slug}` },
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

async function callGemini(systemPrompt: string, userMessage: string) {
  try {
    const fullPrompt = `${systemPrompt}\n\nUser: ${userMessage}`;
    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    return response.text().trim();
  } catch (e) {
    console.error("Gemini API Error:", e);
    return userMessage.slice(0, 55);
  }
}
