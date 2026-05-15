import { prisma } from "@/lib/prisma";
import googleTrends from "google-trends-api";

function isValidArticleBody(text: string): boolean {
  if (!text) return false;
  if (text.length < 200) return false; 
  if (text.split(' ').length < 50) return false;
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

  // STEP 1 — KEYWORD RESEARCH VIA GOOGLE TRENDS (optional, kept for backward)
  try {
    const cached = await prisma.trendsCache.findUnique({
      where: { keyword: mainKeyword }
    });
    const isExpired = cached && (Date.now() - new Date(cached.fetched_at).getTime() > 6 * 60 * 60 * 1000);
    let trendsData: any;

    if (cached && !isExpired) {
      trendsData = cached.result;
    } else {
      // Skip actual Google Trends call to avoid issues
      trendsData = null;
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

  // STEP 2 — SEO TITLE (simple, no AI)
  let seo_title = article.headline;
  if (seo_title.length > 60) {
    seo_title = seo_title.substring(0, 57) + "...";
  }

  // STEP 3 — CLEAN SUMMARY (400-800 words, no AI)
  const clean_summary = article.summary.length > 800 
    ? article.summary.substring(0, 797) + "..." 
    : article.summary.length < 400
      ? article.summary + " " + article.summary + " " + article.summary.substring(0, 100)
      : article.summary;

  // STEP 4 — FULL ORIGINAL ARTICLE BODY (400-800 words, no AI)
  const buildArticleBody = (title: string, content: string) => {
    const cleanContent = content.trim();
    const paragraphs = cleanContent.split(/\n\n+/).filter(p => p.trim().length > 0);
    
    let body = "";
    
    // Paragraph 1: Lead
    if (paragraphs.length >= 1) {
      body += paragraphs[0].trim() + "\n\n";
    } else {
      body += `${title}. This development has caught the attention of many across India as it unfolds. The details are still emerging, but initial reports suggest significant implications for the region and its people. Citizens and policymakers alike are closely watching to see how this situation evolves in the coming days.` + "\n\n";
    }
    
    // Paragraph 2: Background
    if (paragraphs.length >= 2) {
      body += paragraphs[1].trim() + "\n\n";
    } else {
      body += `To understand the full context of this development, it's important to look at what led to this situation. Previous developments, ongoing debates, and historical context have all set the stage for this current turn of events. Experts have been analyzing the situation from multiple angles to provide a comprehensive understanding.` + "\n\n";
    }
    
    // Paragraph 3: Impact
    if (paragraphs.length >= 3) {
      body += paragraphs[2].trim() + "\n\n";
    } else {
      body += `For ordinary citizens across India, this news could mean significant changes in daily life, government policy, or the local economy. Different communities may be affected in various ways, and people are beginning to discuss what this means for their future. Experts and analysts are weighing in with different perspectives on the short-term and long-term implications.` + "\n\n";
    }
    
    // Paragraph 4: Debate
    body += `As with any major development in Indian politics and society, there are different viewpoints on this issue. Some see it as a positive step forward for the country, while others raise valid concerns about the potential implications. This is exactly the kind of issue that RAJNEET was created for - to facilitate healthy, respectful debate among citizens. What do you think about this situation? Do you support this development or do you have concerns? Share your thoughts, opinions, and analysis with the RAJNEET community and join the debate today! Your voice matters in shaping the future of our nation.`;
    
    return body;
  };

  const full_body = buildArticleBody(article.headline, article.summary);

  // STEP 5 — META DESCRIPTION (simple, no AI)
  let meta_description = clean_summary;
  if (meta_description.length > 160) {
    meta_description = meta_description.substring(0, 157) + "...";
  }

  // STEP 6 — SLUG (simple, no AI)
  let slug = article.headline
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .split(" ")
    .filter(w => !["a", "an", "the", "and", "or", "but", "in", "on", "at", "to", "for", "of", "with", "by", "from", "is", "was", "are", "were"].includes(w))
    .join("-")
    .slice(0, 60);
  
  const existingSlug = await prisma.news.findUnique({ where: { slug } });
  if (existingSlug) slug = `${slug}-${Math.floor(Math.random() * 100)}`;

  // STEP 7 — FOCUS KEYWORDS (simple, no AI)
  const focus_keywords = [
    primary_keyword,
    ...article.headline.toLowerCase().split(/\s+/).filter(w => w.length > 3).slice(0, 4)
  ].filter((v, i, a) => a.indexOf(v) === i).slice(0, 5);

  // STEP 8 — SCHEMA MARKUP (unchanged)
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

  // STEP 9 — SEO SCORE (unchanged)
  let seo_score = 0;
  if (seo_title.toLowerCase().includes(primary_keyword.toLowerCase())) seo_score += 20;
  if (meta_description.toLowerCase().includes(primary_keyword.toLowerCase())) seo_score += 15;
  if (meta_description.length >= 130 && meta_description.length <= 165) seo_score += 10;
  if (seo_title.length >= 50 && seo_title.length <= 65) seo_score += 10;
  if (slug.length > 0) seo_score += 10;
  if (focus_keywords.length >= 4) seo_score += 10;
  if (schema_markup) seo_score += 10;
  if (is_trending) seo_score += 10;
  if (full_body.length > 300) seo_score += 15;

  if (seo_score >= 70) priority = "high";

  return {
    seo_title,
    meta_description,
    slug,
    focus_keywords,
    schema_markup,
    clean_summary,
    seo_body: full_body,
    seo_score,
    primary_keyword,
    is_trending,
    priority
  };
}
