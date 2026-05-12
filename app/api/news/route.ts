export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const category = searchParams.get('category')
  const limit = Math.min(parseInt(searchParams.get('limit') || '100'), 100) // Max 100 articles per page

  try {
    const where: any = { status: 'PUBLISHED' }
    
    if (category) {
      // Map category names to database values
      const categoryMap: Record<string, string> = {
        'Politics': 'POLITICAL',
        'Finance': 'FINANCE',
        'Sports': 'SPORTS',
        'World': 'WORLD',
        'Entertainment': 'ENTERTAINMENT',
        'Others': 'OTHER'
      }
      if (categoryMap[category]) {
        where.category = categoryMap[category]
      } else if (category === 'Others') {
        // For 'Others', show categories not in main list
        where.NOT = {
          category: { in: ['POLITICAL', 'FINANCE', 'SPORTS', 'WORLD', 'ENTERTAINMENT'] }
        }
      }
    }

    // Auto-cleanup: Remove old articles if there are more than 100
    const totalArticles = await prisma.news.count({ where })
    if (totalArticles > 100) {
      const articlesToDelete = await prisma.news.findMany({
        where,
        orderBy: { created_at: 'asc' },
        take: totalArticles - 100,
        select: { id: true }
      })
      
      if (articlesToDelete.length > 0) {
        await prisma.news.deleteMany({
          where: {
            id: { in: articlesToDelete.map(a => a.id) }
          }
        })
        console.log(`[NEWS_CLEANUP] Deleted ${articlesToDelete.length} old articles to maintain 100 article limit`)
      }
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
