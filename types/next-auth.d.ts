import NextAuth, { DefaultSession } from "next-auth"
import { JWT } from "next-auth/jwt"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      role: string
      state?: string | null
      onboarding_complete: boolean
      avatar_url?: string | null
      username?: string | null
    } & DefaultSession["user"]
  }

  interface User {
    id: string
    role: string
    state?: string | null
    onboarding_complete: boolean
    avatar_url?: string | null
    username?: string | null
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    role: string
    state?: string | null
    onboarding_complete: boolean
    avatar_url?: string | null
    username?: string | null
  }
}
