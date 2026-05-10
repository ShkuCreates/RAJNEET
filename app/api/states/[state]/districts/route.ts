import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: { state: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { state } = params;

    // Get all districts in the state with their stats
    const districts = await prisma.district.findMany({
      where: { state },
      include: {
        _count: {
          select: {
            // Note: We need to add users relation to District model for this to work
            // For now, we'll fetch user counts separately
          },
        },
      },
      orderBy: { name: "asc" },
    });

    // Get user counts for each district
    const districtsWithStats = await Promise.all(
      districts.map(async (district) => {
        const userCount = await prisma.user.count({
          where: { district: district.name },
        });

        // Get ruling party
        const rulingParty = district.rulingPartyId
          ? await prisma.party.findUnique({
              where: { id: district.rulingPartyId },
            })
          : null;

        // Get MLA
        const mla = district.mlaId
          ? await prisma.user.findUnique({
              where: { id: district.mlaId },
              select: { id: true, username: true, name: true, image: true },
            })
          : null;

        return {
          id: district.id,
          name: district.name,
          state: district.state,
          citizenCount: userCount,
          treasury: district.treasury,
          approvalRating: district.approvalRating,
          corruptionScore: district.corruptionScore,
          nextElection: district.nextElection,
          rulingParty: rulingParty ? {
            id: rulingParty.id,
            name: rulingParty.name,
            color: rulingParty.color,
            logo: rulingParty.logo,
          } : null,
          mla: mla,
        };
      })
    );

    return NextResponse.json(districtsWithStats);
  } catch (error) {
    console.error("Get state districts error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
