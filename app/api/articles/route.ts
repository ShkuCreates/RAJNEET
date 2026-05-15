import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get("q") || "";

  try {
    const articles = await prisma.article.findMany({
      where: {
        status: "approved",
        OR: query ? [
          { title: { contains: query, mode: "insensitive" } },
          { author_username: { contains: query.replace("@", ""), mode: "insensitive" } },
          { tags: { hasSome: [query.replace("#", "")] } },
        ] : undefined,
      },
      orderBy: { created_at: "desc" },
      take: 50,
      select: {
        id: true,
        title: true,
        excerpt: true,
        author_username: true,
        is_verified: true,
        is_featured: true,
        status: true,
        tags: true,
        word_count: true,
        upvote_count: true,
        created_at: true,
        cover_image_url: true,
        slug: true,
      },
    });

    return NextResponse.json({ success: true, articles });
  } catch (error) {
    console.error("Error fetching articles:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch articles" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { title, body: content, tags, cover_image_url, source_urls } = body;

    // Validation
    if (!title || !content || !tags || !Array.isArray(tags)) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    if (content.split(" ").length < 800) {
      return NextResponse.json({ success: false, error: "Article must be at least 800 words" }, { status: 400 });
    }

    if (!source_urls || !Array.isArray(source_urls) || source_urls.length === 0) {
      return NextResponse.json({ success: false, error: "At least one source URL is required" }, { status: 400 });
    }

    // Generate slug from title
    const slug = title
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .split(" ")
      .filter((w: string) => !["a", "an", "the", "and", "or", "but", "in", "on", "at", "to", "for", "of", "with", "by"].includes(w))
      .join("-")
      .slice(0, 80);

    // Generate excerpt
    const excerpt = content.split(" ").slice(0, 50).join(" ") + "...";

    // Calculate read time
    const wordCount = content.split(" ").length;
    const readTimeMinutes = Math.ceil(wordCount / 200);

    const article = await prisma.article.create({
      data: {
        title,
        body: content,
        excerpt,
        cover_image_url,
        author_id: session.user.id,
        author_username: session.user.username || session.user.name || "user",
        tags,
        source_urls,
        slug,
        word_count: wordCount,
        read_time_minutes: readTimeMinutes,
        status: "pending_review",
        is_verified: session.user.role === "ADMIN",
      },
    });

    return NextResponse.json({
      success: true,
      article,
      message: "Your article has been submitted for review. We will notify you within 24 hours.",
    });
  } catch (error) {
    console.error("Error creating article:", error);
    return NextResponse.json({ success: false, error: "Failed to create article" }, { status: 500 });
  }
}
