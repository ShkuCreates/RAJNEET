import { prisma } from "@/lib/prisma";

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
  
  // STEP 1 — KEYWORD RESEARCH VIA GOOGLE TRENDS
  try {
    const mainKeyword = article.headline
      .split(" ")
      .filter(w => w.length > 3)
      .slice(0, 3)
      .join(" ");
    
    const serpResponse = await fetch(`https://serpapi.com/search.json?engine=google_trends&q=${encodeURIComponent(mainKeyword)}&geo=IN&date=now+7-d&hl=en&api_key=${process.env.SERPAPI_KEY}`);
    const trendsData = await serpResponse.json();
    
    if (trendsData.rising_queries?.rising) {
      risingQueries = trendsData.rising_queries.rising.slice(0, 5).map((q: any) => q.query);
      primary_keyword = risingQueries[0] || mainKeyword;
      
      // Interest over time check
      const interest = trendsData.interest_over_time?.timelineData;
      if (interest && interest.length > 0) {
        const lastValue = interest[interest.length - 1].value[0];
        const prevValue = interest[interest.length - 2]?.value[0] || 0;
        if (lastValue > prevValue) {
          priority = "high";
          is_trending = true;
        }
      }
    } else {
      primary_keyword = mainKeyword;
    }
  } catch (error) {
    console.error("SerpAPI Error:", error);
    primary_keyword = article.headline.split(" ").slice(0, 4).join(" ");
  }

  // STEP 2 — SEO TITLE GENERATION (Mocking Claude for now)
  const seo_title = await callClaude(`You are an expert SEO title writer for an Indian political news platform called RAJNEET. Your titles must rank on Google India for political news searches. Rules: title must be 55 to 60 characters exactly, must include the primary keyword naturally, must create urgency or curiosity without being clickbait, must be factually accurate to the article, must sound like a professional Indian news headline, must include the year if the event is current, must not use ALL CAPS. Return only the title text, nothing else.`, 
    `Article headline: ${article.headline}\nPrimary keyword: ${primary_keyword}\nCategory: ${article.category}\nState: ${article.state_name}\nSummary: ${article.summary}`);

  // STEP 3 — META DESCRIPTION GENERATION
  const meta_description = await callClaude(`You are an expert meta description writer for an Indian political news platform. Write a meta description for Google search results. Rules: exactly 150 to 160 characters, must include the primary keyword in the first 20 words, must summarize what the reader will learn, must end with a subtle call to action like 'Read the full debate' or 'Share your opinion', must not repeat the title word for word, must be written for an Indian audience searching in English. Return only the meta description text, nothing else.`,
    `SEO Title: ${seo_title}\nPrimary keyword: ${primary_keyword}\nSummary: ${article.summary}\nCategory: ${article.category}`);

  // STEP 4 — SLUG GENERATION
  let slug = seo_title
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .split(" ")
    .filter(w => !["a", "an", "the", "and", "or", "but", "in", "on", "at", "to", "for", "of", "with", "by", "from", "is", "was", "are", "were", "be", "been", "has", "have", "had"].includes(w))
    .join("-")
    .slice(0, 60);
  
  if (!slug.includes(primary_keyword.toLowerCase().replace(/ /g, "-"))) {
    slug = `${primary_keyword.toLowerCase().replace(/ /g, "-")}-${slug}`.slice(0, 60);
  }

  // Ensure unique slug
  const existing = await prisma.news.findUnique({ where: { slug } });
  if (existing) {
    slug = `${slug}-${Math.floor(Math.random() * 100)}`;
  }

  // STEP 5 — FOCUS KEYWORDS ARRAY
  const focusKeywordsText = await callClaude(`You are an SEO keyword researcher for Indian political news. Generate exactly 5 focus keywords for this article. Rules: first keyword is the primary exact match keyword, second is a long tail variation (4 to 6 words), third is a question keyword starting with what, why, how, when, or who that Indians search on Google, fourth is a location-specific keyword if the article is state or district specific, fifth is a related trending keyword from Indian political discourse. Return only a JSON array of 5 strings, nothing else.`,
    `Headline: ${article.headline}\nPrimary keyword: ${primary_keyword}\nCategory: ${article.category}\nState: ${article.state_name}\nRising queries from Google Trends: ${risingQueries.join(", ")}`);
  
  let focus_keywords = [primary_keyword];
  try {
    focus_keywords = JSON.parse(focusKeywordsText);
  } catch (e) {
    console.error("Keyword parse error");
  }

  // STEP 6 — SCHEMA MARKUP GENERATION
  const schema_markup = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    "headline": seo_title,
    "description": meta_description,
    "keywords": focus_keywords.join(", "),
    "datePublished": article.published_at,
    "dateModified": article.published_at,
    "author": {
      "@type": "Organization",
      "name": "RAJNEET Editorial"
    },
    "publisher": {
      "@type": "Organization",
      "name": "RAJNEET",
      "url": "https://rajneet.in",
      "logo": {
        "@type": "ImageObject",
        "url": "https://rajneet.in/logo.png"
      }
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `https://rajneet.in/news/${slug}`
    },
    "articleSection": article.category,
    "contentLocation": {
      "@type": "Place",
      "name": article.state_name || "India"
    },
    "image": article.cover_image_url
  });

  // STEP 7 — SEO BODY ENRICHMENT
  const seo_body = await callClaude(`You are an SEO content writer for RAJNEET, an Indian political news platform. Rewrite the given article summary to be SEO optimized. Rules: 180 to 220 words total, include the primary keyword in the first sentence naturally, include at least 2 focus keywords naturally throughout, use short paragraphs of 2 to 3 sentences each, write in simple clear English that any Indian citizen can understand, include one sentence explaining why this matters to common citizens, do not use the words 'delve', 'crucial', 'realm', 'landscape', 'furthermore', 'moreover', or 'it is worth noting', end with one sentence that encourages debate such as 'What do you think — share your stance below'. Return only the rewritten body text, nothing else.`,
    `Original summary: ${article.summary}\nPrimary keyword: ${primary_keyword}\nFocus keywords: ${focus_keywords.join(", ")}\nCategory: ${article.category}\nState: ${article.state_name}`);

  // STEP 8 — SEO SCORE CALCULATION
  let seo_score = 0;
  if (seo_title.toLowerCase().includes(primary_keyword.toLowerCase())) seo_score += 20;
  if (meta_description.toLowerCase().includes(primary_keyword.toLowerCase())) seo_score += 15;
  if (meta_description.length >= 150 && meta_description.length <= 160) seo_score += 10;
  if (seo_title.length >= 55 && seo_title.length <= 60) seo_score += 10;
  if (slug.includes(primary_keyword.toLowerCase().replace(/ /g, "-"))) seo_score += 10;
  if (focus_keywords.length === 5) seo_score += 10;
  if (schema_markup) seo_score += 10;
  if (is_trending) seo_score += 10;
  if (article.cover_image_url) seo_score += 5;

  if (seo_score >= 80) priority = "high";

  return {
    seo_title,
    meta_description,
    slug,
    focus_keywords,
    schema_markup,
    seo_body,
    seo_score,
    primary_keyword,
    is_trending,
    priority
  };
}

async function callClaude(systemPrompt: string, userMessage: string) {
  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY || "",
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-3-haiku-20240307", // Using available haiku model
        max_tokens: 1024,
        system: systemPrompt,
        messages: [{ role: "user", content: userMessage }]
      })
    });
    const data = await response.json();
    return data.content[0].text;
  } catch (e) {
    console.error("Claude API Error:", e);
    return userMessage.slice(0, 55); // Fallback
  }
}
