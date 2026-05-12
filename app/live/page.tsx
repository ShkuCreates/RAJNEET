import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import LiveDebatesClient from "@/components/debates/LiveDebatesClient";

export const dynamic = "force-dynamic";

export default async function LiveDebatesPage() {
  const session = await getServerSession(authOptions);

  return (
    <LiveDebatesClient
      currentUser={session?.user}
    />
  );
}
