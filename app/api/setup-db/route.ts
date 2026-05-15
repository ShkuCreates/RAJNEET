import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    console.log("Checking and adding is_pinned columns...");
    
    // Check if News table has is_pinned column
    try {
      await prisma.$queryRaw`SELECT "is_pinned" FROM "News" LIMIT 1`;
      console.log("News table already has is_pinned column");
    } catch (e) {
      console.log("Adding is_pinned to News table...");
      await prisma.$executeRaw`ALTER TABLE "News" ADD COLUMN IF NOT EXISTS "is_pinned" BOOLEAN NOT NULL DEFAULT false`;
      console.log("Added is_pinned to News table");
    }
    
    // Check if Article table has is_pinned column
    try {
      await prisma.$queryRaw`SELECT "is_pinned" FROM "Article" LIMIT 1`;
      console.log("Article table already has is_pinned column");
    } catch (e) {
      console.log("Adding is_pinned to Article table...");
      await prisma.$executeRaw`ALTER TABLE "Article" ADD COLUMN IF NOT EXISTS "is_pinned" BOOLEAN NOT NULL DEFAULT false`;
      console.log("Added is_pinned to Article table");
    }
    
    return NextResponse.json({ success: true, message: "is_pinned columns added or already exist!" });
  } catch (error) {
    console.error("Error adding columns:", error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
