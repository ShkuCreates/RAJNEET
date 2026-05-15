import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const debates = await prisma.debate.findMany({
      orderBy: { created_at: "desc" },
    });
    return NextResponse.json({ success: true, debates });
  } catch (error: any) {
    console.error("[GET_DEBATES_ERROR]", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email || session.user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { topic, description, scheduled_at } = body;

    if (!topic) {
      return NextResponse.json({ error: "Topic is required" }, { status: 400 });
    }

    const debate = await prisma.debate.create({
      data: {
        topic,
        description,
        created_by: session.user.id || "",
        status: "upcoming",
        scheduled_at: scheduled_at ? new Date(scheduled_at) : null,
      },
    });

    return NextResponse.json({ success: true, debate });
  } catch (error: any) {
    console.error("[CREATE_DEBATE_ERROR]", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
