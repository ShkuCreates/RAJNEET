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
    
    const data: any = {};
    if (body.status) {
      data.status = body.status;
      if (body.status === "live") data.scheduled_at = new Date();
    }
    if (body.topic) data.topic = body.topic;
    if (body.description !== undefined) data.description = body.description;
    if (body.image_url !== undefined) data.image_url = body.image_url;
    if (body.scheduled_at) data.scheduled_at = new Date(body.scheduled_at);
    if (body.duration_minutes !== undefined) data.duration_minutes = body.duration_minutes;
    if (body.max_for_participants !== undefined) data.max_for_participants = body.max_for_participants;
    if (body.max_against_participants !== undefined) data.max_against_participants = body.max_against_participants;

    const debate = await prisma.debate.update({
      where: { id },
      data,
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
