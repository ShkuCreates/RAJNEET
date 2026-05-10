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
    const { followingId } = body;

    if (!followingId) {
      return NextResponse.json({ error: "followingId required" }, { status: 400 });
    }

    if (followingId === session.user.id) {
      return NextResponse.json({ error: "Cannot follow yourself" }, { status: 400 });
    }

    // Check if already following
    const existingFollow = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: session.user.id,
          followingId,
        },
      },
    });

    if (existingFollow) {
      // Unfollow
      await prisma.follow.delete({
        where: {
          id: existingFollow.id,
        },
      });

      // Update follower count
      await prisma.user.update({
        where: { id: followingId },
        data: {
          followerCount: {
            decrement: 1,
          },
        },
      });

      return NextResponse.json({ following: false });
    } else {
      // Follow
      await prisma.follow.create({
        data: {
          followerId: session.user.id,
          followingId,
        },
      });

      // Update follower count
      await prisma.user.update({
        where: { id: followingId },
        data: {
          followerCount: {
            increment: 1,
          },
        },
      });

      return NextResponse.json({ following: true });
    }
  } catch (error) {
    console.error("Follow error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
