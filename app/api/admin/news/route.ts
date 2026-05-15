import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import * as z from "zod";
import { generateNewsSummary } from "@/lib/gemini";

const newsSchema = z.object({
  headline: z.string().min(1),
  summary: z.string().max(300).min(1),
  body: z.string().min(1),
  category: z.string(),
  geo_level: z.string(),
  state: z.string().nullable(),
  district: z.string().nullable(),
  source_url: z.string().nullable(),
  cover_image_url: z.string().nullable(),
  status: z.enum(["DRAFT", "PUBLISHED"]),
});

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const result = newsSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: "Invalid data", details: result.error.format() }, { status: 400 });
    }

    // Generate AI summary if not provided
    let summary = result.data.summary;
    if (!summary && result.data.body) {
      try {
        summary = await generateNewsSummary(result.data.body);
      } catch (error) {
        console.error('Failed to generate AI summary:', error);
        // Use first 300 characters of body as fallback
        summary = result.data.body.substring(0, 300) + '...';
      }
    }

    const news = await prisma.news.create({
      data: {
        ...result.data,
        summary,
        posted_by: session.user.id,
      },
    });

    return NextResponse.json(news);
  } catch (error) {
    console.error("[ADMIN_NEWS_POST]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { id, is_pinned } = body;

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    const updatedArticle = await prisma.news.update({
      where: { id },
      data: { is_pinned }
    });

    return NextResponse.json({ success: true, article: updatedArticle });
  } catch (error) {
    console.error("[ADMIN_NEWS_PATCH]", error);
    return NextResponse.json({ success: false, error: "Internal Error" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    await prisma.news.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[ADMIN_NEWS_DELETE]", error);
    return NextResponse.json({ success: false, error: "Internal Error" }, { status: 500 });
  }
}
