import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

async function fetchNewsFromCron() {
  try {
    const res = await fetch(`${process.env.NEXTAUTH_URL || "http://localhost:3000"}/api/cron/fetch-news`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });
    return res.ok;
  } catch (e) {
    console.error(e);
    return false;
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email || session.user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const success = await fetchNewsFromCron();
    
    if (success) {
      return NextResponse.json({ success: true });
    } else {
      return new NextResponse("Failed to fetch news", { status: 500 });
    }
  } catch (error) {
    console.error("[ADMIN_FETCH_NEWS_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
