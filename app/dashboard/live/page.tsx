import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import DashboardHomeClient from "@/components/dashboard/DashboardHomeClient";

export const dynamic = "force-dynamic";

export default async function DashboardLivePage() {
  const session = await getServerSession(authOptions);

  return (
    <DashboardHomeClient
      news={[]}
      currentUser={session?.user}
      selectedCategory={null}
      latestFetchAt={null}
      showLiveOnly
    />
  );
}
