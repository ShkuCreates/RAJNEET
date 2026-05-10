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

    // Get all states with citizen and district counts
    const states = await prisma.user.groupBy({
      by: ["state"],
      where: {
        state: {
          not: null,
        },
      },
      _count: {
        id: true,
      },
    });

    // Get district counts for each state
    const statesWithDistrictCounts = await Promise.all(
      states.map(async (state) => {
        const districts = await prisma.district.findMany({
          where: { state: state.state },
          select: { id: true },
        });

        return {
          name: state.state,
          citizenCount: state._count.id,
          districtCount: districts.length,
        };
      })
    );

    // Sort by citizen count (descending)
    statesWithDistrictCounts.sort((a, b) => b.citizenCount - a.citizenCount);

    return NextResponse.json(statesWithDistrictCounts);
  } catch (error) {
    console.error("Get states error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
