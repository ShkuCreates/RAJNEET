import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: { district: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { district } = params;

    // Get district info
    const districtInfo = await prisma.district.findUnique({
      where: { name: district },
    });

    // Count total citizens in district
    const totalCitizens = await prisma.user.count({
      where: { district },
    });

    // Count active users (last 30 minutes)
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
    const activeUsers = await prisma.user.count({
      where: {
        district,
        updatedAt: { gte: thirtyMinutesAgo },
      },
    });

    // Get ruling party
    const rulingParty = districtInfo?.rulingPartyId
      ? await prisma.party.findUnique({
          where: { id: districtInfo.rulingPartyId },
        })
      : null;

    // Get current MLA
    const mla = districtInfo?.mlaId
      ? await prisma.user.findUnique({
          where: { id: districtInfo.mlaId },
          select: { id: true, username: true, name: true, image: true },
        })
      : null;

    // Get recent posts for engagement metrics
    const recentPosts = await prisma.post.findMany({
      where: { district },
      take: 100,
      orderBy: { createdAt: "desc" },
    });

    const stats = {
      totalCitizens,
      activeUsers,
      treasury: districtInfo?.treasury || 0,
      approvalRating: districtInfo?.approvalRating || 50,
      corruptionScore: districtInfo?.corruptionScore || 0,
      rulingParty: rulingParty ? {
        id: rulingParty.id,
        name: rulingParty.name,
        color: rulingParty.color,
        logo: rulingParty.logo,
      } : null,
      mla: mla,
      nextElection: districtInfo?.nextElection,
      recentActivity: recentPosts.length,
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error("District stats error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
