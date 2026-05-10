import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { content, type = "General" } = body;

    if (!content || content.trim().length === 0) {
      return NextResponse.json({ error: "Content is required" }, { status: 400 });
    }

    // Get user's district and state
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { district: true, state: true, role: true },
    });

    if (!user?.district || !user?.state) {
      return NextResponse.json({ error: "User district not set" }, { status: 400 });
    }

    // Validate post type
    const validTypes = ["General", "Announcement", "Debate", "Propaganda"];
    if (!validTypes.includes(type)) {
      return NextResponse.json({ error: "Invalid post type" }, { status: 400 });
    }

    // Only political roles can create announcements
    if (type === "Announcement" && user.role === "CITIZEN") {
      return NextResponse.json({ error: "Only political roles can create announcements" }, { status: 403 });
    }

    const post = await prisma.post.create({
      data: {
        content: content.trim(),
        type,
        authorId: session.user.id,
        district: user.district,
        state: user.state,
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            name: true,
            image: true,
            role: true,
            subRole: true,
          },
        },
        _count: {
          select: {
            comments: true,
            likes: true,
          },
        },
      },
    });

    return NextResponse.json({ ...post, isLiked: false });
  } catch (error) {
    console.error("Create post error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
