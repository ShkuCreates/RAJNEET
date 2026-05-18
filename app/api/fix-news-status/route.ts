
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const totalNewsBefore = await prisma.news.count();
    const updatedCount = await prisma.news.updateMany({
      where: { status: { not: 'PUBLISHED' } },
      data: { status: 'PUBLISHED' },
    });
    
    const totalNewsAfter = await prisma.news.count();
    const publishedCount = await prisma.news.count({ where: { status: 'PUBLISHED' } });
    
    return NextResponse.json({
      success: true,
      totalNews: totalNewsAfter,
      publishedCount,
      updated: updatedCount.count,
    });
  } catch (error) {
    console.error('Error updating news status:', error);
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}
