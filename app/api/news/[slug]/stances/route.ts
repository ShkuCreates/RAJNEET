export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  const article = await prisma.news.findUnique({
    where: { slug: params.slug },
    select: { id: true }
  })

  if (!article) return NextResponse.json({ for: 0, against: 0, neutral: 0 })

  const [forCount, againstCount, neutralCount] = await Promise.all([
    prisma.opinion.count({ where: { newsId: article.id, stance: 'FOR' } }),
    prisma.opinion.count({ where: { newsId: article.id, stance: 'AGAINST' } }),
    prisma.opinion.count({ where: { newsId: article.id, stance: 'NEUTRAL' } }),
  ])

  const total = forCount + againstCount + neutralCount || 1

  return NextResponse.json({
    for: Math.round((forCount / total) * 100),
    against: Math.round((againstCount / total) * 100),
    neutral: Math.round((neutralCount / total) * 100),
    total
  })
}
