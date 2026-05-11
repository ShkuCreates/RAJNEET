import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const news = await prisma.news.findMany({
      where: { 
        status: 'PUBLISHED',
        cover_image_url: { not: null },
      },
      select: {
        id: true,
        headline: true,
        summary: true,
        cover_image_url: true,
        category: true,
        geo_level: true,
        state: true,
        created_at: true,
        slug: true,
      },
      orderBy: { created_at: 'desc' },
      take: 9,
    })
    return NextResponse.json(news)
  } catch (error) {
    console.error('Preview news API error:', error)
    return NextResponse.json([])
  }
}
