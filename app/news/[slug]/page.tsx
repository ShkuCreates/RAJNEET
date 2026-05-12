import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import Script from "next/script";
import ArticlePageClient from "@/components/news/ArticlePageClient";

export const dynamic = "force-dynamic";

const slugFromHeadline = (headline: string) =>
  headline
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .split(" ")
    .filter((w) => !["a", "an", "the", "and", "or", "but", "in", "on", "at", "to", "for", "of", "with", "by", "from", "is", "was", "are", "were"].includes(w))
    .join("-")
    .slice(0, 60);

async function getArticleBySlug(slug: string) {
  const bySlug = await prisma.news.findUnique({
    where: { slug },
    include: { author: { select: { name: true, avatar_url: true, role: true } } },
  });
  if (bySlug) return bySlug;

  const fallback = await prisma.news.findMany({
    where: { slug: null, status: "PUBLISHED" },
    include: { author: { select: { name: true, avatar_url: true, role: true } } },
  });
  return fallback.find((n) => slugFromHeadline(n.headline || "") === slug) || null;
}

export async function generateStaticParams() {
  // Return empty array to avoid database connection issues during build
  // Routes will be generated dynamically at runtime
  return [];
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const article = await getArticleBySlug(params.slug);
  if (!article) return {};

  const slug = article.slug || slugFromHeadline(article.headline || "article");
  const title = article.seo_title || article.headline;
  const description = article.meta_description || article.summary;
  const coverImage = article.cover_image_url || `https://rajneet.co.in/api/og?title=${encodeURIComponent(title)}&category=${encodeURIComponent(article.category || "POLITICAL")}`;
  const keywords = Array.isArray(article.focus_keywords) ? article.focus_keywords : [];

  return {
    title,
    description,
    keywords,
    openGraph: {
      title,
      description,
      url: `https://rajneet.co.in/news/${slug}`,
      type: "article",
      images: [coverImage],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [coverImage],
    },
    alternates: {
      canonical: `https://rajneet.co.in/news/${slug}`,
    },
  };
}

export default async function ArticlePage({ params }: { params: { slug: string } }) {
  const article = await getArticleBySlug(params.slug);
  if (!article) notFound();

  return (
    <>
      {article.schema_markup && (
        <Script
          id={`schema-${article.id}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: article.schema_markup }}
        />
      )}
      <ArticlePageClient article={article} />
    </>
  );
}
