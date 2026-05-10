import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        party: {
          select: {
            id: true,
            name: true,
            color: true,
            logo: true,
          },
        },
        _count: {
          select: {
            followers: true,
            following: true,
            posts: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get user's posts count
    const postsCount = await prisma.post.count({
      where: { authorId: user.id },
    });

    // Get follower count (should match _count.followers)
    const followerCount = await prisma.follow.count({
      where: { followingId: user.id },
    });

    // Get following count
    const followingCount = await prisma.follow.count({
      where: { followerId: user.id },
    });

    const userProfile = {
      id: user.id,
      username: user.username,
      name: user.name,
      email: user.email,
      image: user.image,
      bio: user.bio,
      role: user.role,
      subRole: user.subRole,
      state: user.state,
      district: user.district,
      party: user.party,
      followerCount: followerCount,
      followingCount: followingCount,
      postsCount: postsCount,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    return NextResponse.json(userProfile);
  } catch (error) {
    console.error("Get user profile error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
