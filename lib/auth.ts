import { NextAuthOptions } from "next-auth";
import { Adapter } from "next-auth/adapters";
import GoogleProvider from "next-auth/providers/google";
import DiscordProvider from "next-auth/providers/discord";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "./prisma";

const baseAdapter = PrismaAdapter(prisma);

export const authOptions: NextAuthOptions = {
  adapter: {
    ...baseAdapter,
    createUser: async (data) => {
      // Destructure to strip any unknown fields before passing to Prisma
      const { name, email, image, emailVerified } = data as any;

      return baseAdapter.createUser!({
        name,
        email,
        image,
        emailVerified,
        provider: "unknown", // safe default — overwritten in signIn callback
      } as any);
    },
  } as Adapter,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    DiscordProvider({
      clientId: process.env.DISCORD_CLIENT_ID || "",
      clientSecret: process.env.DISCORD_CLIENT_SECRET || "",
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider && user?.id) {
        // Update provider to the real value ("google" or "discord")
        await prisma.user.update({
          where: { id: user.id },
          data: { provider: account.provider },
        }).catch(() => null);
      }
      // DO NOT attach any extra properties to the user object here
      // NextAuth spreads user into Prisma — unknown fields will crash
      return true;
    },

    async redirect({ url, baseUrl }) {
      // Always handled — never fall through to error
      return url.startsWith(baseUrl) ? url : baseUrl + "/onboarding";
    },

    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
        session.user.username = (user as any).username || null;
        session.user.role = (user as any).role || "CITIZEN";
        session.user.subRole = (user as any).subRole || "Citizen";
        session.user.provider = (user as any).provider || "unknown";
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "database",
    maxAge: 36000, // 10 hours in seconds
  },
};
