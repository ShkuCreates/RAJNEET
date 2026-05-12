import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email || session.user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Get ALL users without restrictive filtering
    const users = await prisma.user.findMany({
      orderBy: { created_at: "desc" },
      include: {
        _count: {
          select: { opinions: true }
        }
      }
    });

    console.log(`[ADMIN_USERS_DEBUG] Found ${users.length} total users`);

    return NextResponse.json({ users });
  } catch (error) {
    console.error("[ADMIN_USERS_ERROR]", error);
    return NextResponse.json("Internal Error", { status: 500 });
  }
}
