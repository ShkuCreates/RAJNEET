import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email || session.user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { id } = params;
    const body = await req.json();
    const { status } = body;

    const debate = await prisma.debate.update({
      where: { id },
      data: {
        status,
        ...(status === "live" ? { scheduled_at: new Date() } : {}),
      },
    });

    return NextResponse.json({ success: true, debate });
  } catch (error: any) {
    console.error("[UPDATE_DEBATE_ERROR]", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email || session.user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { id } = params;

    await prisma.debate.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("[DELETE_DEBATE_ERROR]", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
