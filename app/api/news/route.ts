export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const category = searchParams.get('category')
  const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 50) // Max 50 articles per page

  try {
    const where: any = { status: 'PUBLISHED' }
    
    if (category && ['Politics', 'Finance', 'Sports', 'World'].includes(category)) {
      // Map category names to database values
      const categoryMap: Record<string, string> = {
        'Politics': 'POLITICAL',
        'Finance': 'FINANCE',
        'Sports': 'SPORTS',
        'World': 'WORLD'
      }
      where.category = categoryMap[category] || category
    }

    const articles = await prisma.news.findMany({
      where,
      orderBy: { created_at: 'desc' },
      take: limit,
      include: {
        author: {
          select: { name: true, avatar_url: true, role: true },
        },
        _count: {
          select: { opinions: true, upvotes: true, pageViews: true },
        },
        opinions: {
          select: { stance: true },
        },
      },
    })

    // Return in the expected format for the dashboard
    return NextResponse.json({
      news: articles,
      latestFetchAt: articles.length > 0 ? articles[0].created_at.toISOString() : null
    })
  } catch (error) {
    console.error('News API error:', error)
    return NextResponse.json({ news: [], latestFetchAt: null })
  }
}
