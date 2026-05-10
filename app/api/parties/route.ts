import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const parties = await prisma.party.findMany({
      include: {
        _count: {
          select: { members: true },
        },
      },
    });

    return NextResponse.json(parties);
  } catch (error) {
    console.error("Get parties error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { name, tagline, color, logo } = body;

    if (!name) {
      return NextResponse.json({ error: "Party name required" }, { status: 400 });
    }

    // Create party
    const party = await prisma.party.create({
      data: {
        name,
        tagline,
        color: color || "#D4AF37",
        logo,
        leaderId: session.user.id,
      },
    });

    // Update user's party
    await prisma.user.update({
      where: { id: session.user.id },
      data: { partyId: party.id },
    });

    return NextResponse.json(party);
  } catch (error) {
    console.error("Create party error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
