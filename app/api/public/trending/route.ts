import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const news = await prisma.news.findMany({
      where: { status: 'PUBLISHED' },
      select: {
        id: true,
        headline: true,
        slug: true,
        category: true,
      },
      orderBy: { created_at: 'desc' },
      take: 10,
    })
    return NextResponse.json(news)
  } catch (error) {
    console.error('Trending news API error:', error)
    return NextResponse.json([])
  }
}
