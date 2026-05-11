export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET — fetch opinions for an article
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const newsId = searchParams.get('newsId')

  if (!newsId) return NextResponse.json([])

  const opinions = await prisma.opinion.findMany({
    where: { news_id: newsId, parent_id: null },
    orderBy: { created_at: 'desc' },
    include: {
      user: { select: { name: true, image: true, username: true } },
      replies: {
        include: {
          user: { select: { name: true, image: true, username: true } }
        },
        orderBy: { created_at: 'asc' }
      }
    }
  })

  return NextResponse.json(opinions)
}

// POST — submit a new opinion
export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { newsId, stance, content, parentId } = await request.json()

  if (!newsId || !stance || !content) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }

  if (content.length < 10) {
    return NextResponse.json({ error: 'Comment too short' }, { status: 400 })
  }

  const opinion = await prisma.opinion.create({
    data: {
      news_id: newsId,
      user_id: session.user.id,
      stance,
      comment: content,
      parent_id: parentId || null,
    },
    include: {
      user: { select: { name: true, image: true, username: true } }
    }
  })

  return NextResponse.json(opinion)
}
