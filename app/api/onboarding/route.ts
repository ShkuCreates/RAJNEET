import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import * as z from "zod";

const onboardingSchema = z.object({
  role: z.enum(["CITIZEN", "LAWYER", "JOURNALIST", "ACTIVIST"]),
  state: z.string().min(1),
  district: z.string().min(1),
  username: z.string().optional(),
  bio: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const result = onboardingSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }

    const { role, state, district, username, bio } = result.data;

    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        role,
        state,
        district,
        username: username || undefined,
        bio: bio || undefined,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[ONBOARDING_ERROR]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
