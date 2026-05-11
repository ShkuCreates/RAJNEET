export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const count = await prisma.news.count()
    const sample = await prisma.news.findFirst({ 
      orderBy: { created_at: 'desc' }
    })
    
    // Also check published count
    const publishedCount = await prisma.news.count({
      where: { status: 'PUBLISHED' }
    })
    
    return NextResponse.json({ 
      total: count,
      published: publishedCount,
      latest: sample?.headline,
      status: sample?.status,
      category: sample?.category,
      created_at: sample?.created_at
    })
  } catch (error) {
    console.error('Debug endpoint error:', error)
    return NextResponse.json({ 
      error: 'Database error',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
