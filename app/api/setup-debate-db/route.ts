
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    console.log('Setting up Debate table columns...');
    
    const columnsToAdd = [
      { name: 'image_url', type: 'TEXT', nullable: true },
      { name: 'duration_minutes', type: 'INTEGER', nullable: false, default: 60 },
      { name: 'max_for_participants', type: 'INTEGER', nullable: false, default: 5 },
      { name: 'max_against_participants', type: 'INTEGER', nullable: false, default: 5 },
    ];

    for (const col of columnsToAdd) {
      try {
        const checkQuery = `SELECT "${col.name}" FROM "Debate" LIMIT 1`;
        await prisma.$queryRawUnsafe(checkQuery);
        console.log(`Column "${col.name}" already exists`);
      } catch (e) {
        console.log(`Adding column "${col.name}"...`);
        let alterQuery = `ALTER TABLE "Debate" ADD COLUMN IF NOT EXISTS "${col.name}" ${col.type}`;
        if (col.default !== undefined) {
          alterQuery += ` DEFAULT ${col.default}`;
        }
        if (!col.nullable) {
          alterQuery += ` NOT NULL`;
        }
        await prisma.$queryRawUnsafe(alterQuery);
        console.log(`Added column "${col.name}" successfully!`);
      }
    }

    return NextResponse.json({ success: true, message: 'Debate table columns set up successfully!' });
  } catch (error) {
    console.error('Error setting up Debate DB:', error);
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}
