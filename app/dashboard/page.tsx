import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import DashboardHomeClient from "@/components/dashboard/DashboardHomeClient";

export const dynamic = "force-dynamic";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: { category?: string };
}) {
  const session = await getServerSession(authOptions);
  const user = session?.user;
  const selectedCategory = searchParams.category || null;

  return (
    <DashboardHomeClient
      currentUser={user}
      selectedCategory={selectedCategory}
    />
  );
}
