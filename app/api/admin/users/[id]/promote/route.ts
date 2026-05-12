import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email || session.user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    await prisma.user.update({
      where: { id: params.id },
      data: { role: "ADMIN" }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[PROMOTE_USER_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
