import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const news = await prisma.news.findMany({
      where: { status: 'PUBLISHED' },
      select: { headline: true, category: true, geo_level: true },
      orderBy: { created_at: 'desc' },
      take: 20,
    })
    return NextResponse.json(news)
  } catch (error) {
    console.error('Ticker API error:', error)
    return NextResponse.json([])
  }
}
