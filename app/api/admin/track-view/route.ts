import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const { newsId, path } = await req.json();
    const session = await getServerSession(authOptions);
    const ip = req.headers.get("x-forwarded-for") || "unknown";

    await prisma.pageView.create({
      data: {
        news_id: newsId || null,
        path: path || "/",
        user_id: session?.user?.id || null,
        ip
      }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    // Silent fail — don't block article reading
    return NextResponse.json({ success: false }, { status: 200 });
  }
}
