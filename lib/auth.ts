import { NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import GoogleProvider from "next-auth/providers/google";
import { prisma } from "./prisma";
import { Adapter } from "next-auth/adapters";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as Adapter,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role || "CITIZEN";
        token.state = (user as any).state || null;
        token.onboarding_complete = (user as any).onboarding_complete || false;
        token.avatar_url = (user as any).avatar_url || user.image;
        token.username = (user as any).username || null;
      }
      
      if (trigger === "update" && session) {
        // Update token with new session data
        if (session.name) token.name = session.name;
        if (session.onboarding_complete !== undefined) token.onboarding_complete = session.onboarding_complete;
        if (session.state) token.state = session.state;
        if (session.username) token.username = session.username;
      }
      
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.state = token.state as string | null;
        session.user.onboarding_complete = token.onboarding_complete as boolean;
        session.user.avatar_url = token.avatar_url as string | null;
        session.user.username = token.username as string | null;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      return url.startsWith(baseUrl) ? url : baseUrl;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 36000, // 10 hours
  },
};
