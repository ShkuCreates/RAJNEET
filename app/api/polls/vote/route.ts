import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { pollId, option } = await req.json();

    const vote = await prisma.pollVote.upsert({
      where: {
        poll_id_user_id: {
          poll_id: pollId,
          user_id: session.user.id
        }
      },
      update: {
        selected_option: option
      },
      create: {
        poll_id: pollId,
        user_id: session.user.id,
        selected_option: option
      }
    });

    return NextResponse.json({ success: true, vote });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
