import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email?: string | null;
      name?: string | null;
      image?: string | null;
      username: string | null;
      role: string;
      subRole: string;
      provider: string;
      state?: string | null;
      partyId?: string | null;
    };
  }

  interface User {
    id: string;
    email?: string | null;
    name?: string | null;
    image?: string | null;
    username?: string | null;
    role?: string;
    subRole?: string;
    provider?: string;
  }
}
