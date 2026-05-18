
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const debates = await prisma.debate.findMany({
      orderBy: { created_at: 'desc' },
    });
    console.log('Found debates:', debates);
    return NextResponse.json({ 
      success: true, 
      total: debates.length, 
      debates: debates 
    });
  } catch (error) {
    console.error('[DEBUG_DEBATES_ERROR]', error);
    return NextResponse.json({ 
      success: false, 
      error: String(error) 
    }, { status: 500 });
  }
}
