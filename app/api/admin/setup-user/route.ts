import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { email, username, name, role } = await req.json();

    if (!email || !username) {
      return new NextResponse("Email and username required", { status: 400 });
    }

    // Check if user already exists
    let user = await prisma.user.findUnique({
      where: { email }
    });

    // Check if username is taken by another user
    const existingUsername = await prisma.user.findFirst({
      where: {
        username: username.toLowerCase(),
        NOT: { email }
      }
    });

    if (existingUsername) {
      return new NextResponse("Username already taken", { status: 400 });
    }

    if (user) {
      // Update existing user
      user = await prisma.user.update({
        where: { email },
        data: {
          username: username.toLowerCase(),
          name: name || user.name,
          role: role || "CITIZEN",
        }
      });
    } else {
      // Create new user
      user = await prisma.user.create({
        data: {
          email,
          username: username.toLowerCase(),
          name: name || username,
          role: role || "CITIZEN",
          onboarding_complete: true,
        }
      });
    }

    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error("[SETUP_USER_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
