
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const totalNews = await prisma.news.count();
    
    const newsByStatus = await prisma.news.groupBy({
      by: ['status'],
      _count: { _all: true },
    });
    
    const latestNews = await prisma.news.findMany({
      take: 5,
      orderBy: { created_at: 'desc' },
      select: { id: true, headline: true, status: true, created_at: true },
    });

    return NextResponse.json({
      success: true,
      totalNews,
      newsByStatus,
      latestNews,
    });
  } catch (error) {
    console.error('DB debug error:', error);
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}
