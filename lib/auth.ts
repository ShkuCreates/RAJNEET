import { NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import GoogleProvider from "next-auth/providers/google";
import { prisma } from "./prisma";
import { Adapter } from "next-auth/adapters";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as Adapter,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: 'select_account',
          access_type: 'online',
          response_type: 'code',
          scope: 'openid email profile',
        },
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (!user.email) return false;

      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email: user.email }
      });

      if (existingUser) {
        // Link the new account to the existing user if not already linked
        const existingAccount = await prisma.account.findFirst({
          where: {
            userId: existingUser.id,
            provider: account?.provider,
            providerAccountId: account?.providerAccountId
          }
        });

        if (!existingAccount && account) {
          await prisma.account.create({
            data: {
              userId: existingUser.id,
              type: account.type,
              provider: account.provider,
              providerAccountId: account.providerAccountId,
              refresh_token: account.refresh_token,
              access_token: account.access_token,
              expires_at: account.expires_at,
              token_type: account.token_type,
              scope: account.scope,
              id_token: account.id_token,
              session_state: account.session_state
            }
          });
        }
        return true;
      }
      return true;
    },
    async jwt({ token, user, trigger, session }) {
      if (user) {
        // Fetch full user from DB to get latest onboarding status
        const dbUser = await prisma.user.findUnique({
          where: { email: user.email! }
        });
        
        token.id = user.id;
        token.role = (dbUser as any)?.role || "CITIZEN";
        token.state = (dbUser as any)?.state || null;
        token.onboarding_complete = (dbUser as any)?.onboarding_complete || false;
        token.avatar_url = (dbUser as any)?.avatar_url || user.image;
        token.username = (dbUser as any)?.username || null;
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
    maxAge: 1296000, // 15 days
  },
};
