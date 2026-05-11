export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const opinionId = params.id

  // Check if already liked
  const existing = await prisma.opinionLike.findUnique({
    where: {
      user_id_opinion_id: {
        user_id: session.user.id,
        opinion_id: opinionId
      }
    }
  })

  if (existing) {
    // Unlike
    await prisma.opinionLike.delete({
      where: { user_id_opinion_id: { user_id: session.user.id, opinion_id: opinionId } }
    })
    await prisma.opinion.update({
      where: { id: opinionId },
      data: { like_count: { decrement: 1 } }
    })
    return NextResponse.json({ liked: false })
  } else {
    // Like
    await prisma.opinionLike.create({
      data: { user_id: session.user.id, opinion_id: opinionId }
    })
    await prisma.opinion.update({
      where: { id: opinionId },
      data: { like_count: { increment: 1 } }
    })
    return NextResponse.json({ liked: true })
  }
}
