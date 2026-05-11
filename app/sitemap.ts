import { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

export const revalidate = 3600;

const BASE_URL = "https://rajneet.in";

const slugFromHeadline = (headline: string) =>
  headline
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .split(" ")
    .filter((w) => !["a", "an", "the", "and", "or", "but", "in", "on", "at", "to", "for", "of", "with", "by", "from", "is", "was", "are", "were"].includes(w))
    .join("-")
    .slice(0, 60);

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const news = await prisma.news.findMany({
    where: { status: "PUBLISHED" },
    select: { slug: true, headline: true, created_at: true },
    orderBy: { created_at: "desc" },
  });

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${BASE_URL}/`, lastModified: new Date() },
    { url: `${BASE_URL}/dashboard`, lastModified: new Date() },
    { url: `${BASE_URL}/parliament`, lastModified: new Date() },
    { url: `${BASE_URL}/polls`, lastModified: new Date() },
  ];

  const newsRoutes: MetadataRoute.Sitemap = news.map((article) => {
    const slug = article.slug || slugFromHeadline(article.headline || "article");
    return {
      url: `${BASE_URL}/news/${slug}`,
      lastModified: article.created_at,
      changeFrequency: "hourly",
      priority: 0.8,
    };
  });

  return [...staticRoutes, ...newsRoutes];
}
