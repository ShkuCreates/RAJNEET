import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

const TWENTY_ONE_DAYS_MS = 21 * 24 * 60 * 60 * 1000;

/**
 * Deletes published news older than 21 days only when the story is not "important":
 * at most 1000 page views and at most 50 comments (opinions).
 * Ping daily via UptimeRobot with ?secret=CRON_SECRET (same pattern as fetch-news).
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const secret = searchParams.get("secret");

  const session = await getServerSession(authOptions);
  const isAdmin = session?.user?.role === "ADMIN";

  if (process.env.NODE_ENV === "production" && !isAdmin && secret !== process.env.CRON_SECRET) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const cutoff = new Date(Date.now() - TWENTY_ONE_DAYS_MS);

    const deletedCount = await prisma.$executeRaw(
      Prisma.sql`
        DELETE FROM "News" n
        WHERE n."created_at" < ${cutoff}
        AND (SELECT COUNT(*)::int FROM "PageView" p WHERE p."news_id" = n.id) <= 1000
        AND (SELECT COUNT(*)::int FROM "Opinion" o WHERE o."news_id" = n.id) <= 50
      `
    );

    return NextResponse.json({
      success: true,
      deletedCount: typeof deletedCount === "number" ? deletedCount : 0,
      cutoff: cutoff.toISOString(),
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("cleanup-old-news:", error);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
