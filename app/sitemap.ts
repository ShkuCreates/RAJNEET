import { MetadataRoute } from 'next'
import { prisma } from '@/lib/prisma'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://rajneet.co.in'

  let articleUrls: MetadataRoute.Sitemap = []

  try {
    const news = await prisma.news.findMany({
      where: { status: 'PUBLISHED' },
      select: { slug: true, created_at: true },
      orderBy: { created_at: 'desc' },
      take: 1000,
    })

    articleUrls = news.map((article) => ({
      url: `${baseUrl}/news/${article.slug}`,
      lastModified: article.created_at,
      changeFrequency: 'daily' as const,
      priority: 0.8,
    }))
  } catch (error) {
    console.error('Sitemap article fetch error:', error)
  }

  const staticUrls: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}`,
      lastModified: new Date(),
      changeFrequency: 'hourly' as const,
      priority: 1.0,
    },
    {
      url: `${baseUrl}/polls`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/parliament`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.7,
    },
  ]

  return [...staticUrls, ...articleUrls]
}
