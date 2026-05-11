export const dynamic = 'force-dynamic'

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== "ADMIN") {
      return new NextResponse("Forbidden", { status: 403 });
    }

    // Fallback: if automationLog table doesn't exist, return empty list
    const logs = (prisma as any).automationLog
      ? await (prisma as any).automationLog.findMany({
          orderBy: { run_at: "desc" },
          take: 50,
        })
      : [];


    return NextResponse.json(logs);
  } catch (error) {
    console.error("automation-logs GET error:", error);
    return NextResponse.json([]);
  }
}

