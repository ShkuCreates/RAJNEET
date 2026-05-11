import { prisma } from "@/lib/prisma";
import NewsFeed from "@/components/news/NewsFeed";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { DashboardTopBar } from "@/components/dashboard/DashboardTopBar";
import { FilterTabs } from "@/components/news/FilterTabs";
import { DashboardTour } from "@/components/dashboard/DashboardTour";

export const dynamic = "force-dynamic";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: { filter?: string };
}) {
  const session = await getServerSession(authOptions);
  const user = session?.user;
  
  const filter = searchParams.filter || "All";

  // Build query based on filter
  let whereClause = {};
  if (filter !== "All") {
    whereClause = { category: filter.toUpperCase() };
  }

  const news = await prisma.news.findMany({
    where: {
      status: "PUBLISHED",
      ...whereClause,
    },
    include: {
      author: {
        select: { name: true, avatar_url: true, role: true },
      },
      _count: {
        select: { opinions: true, upvotes: true, pageViews: true },
      },
      upvotes: user ? {
        where: { user_id: user.id },
        select: { user_id: true }
      } : false,
    },
    orderBy: {
      created_at: "desc",
    },
  });

  return (
    <div className="flex flex-col h-full bg-[#050A14]">
      <DashboardTour />
      <DashboardTopBar user={user} />

      <div className="flex-1 overflow-y-auto">
        <div className="p-8 pb-32">
          {/* News Feed Header */}
          <div className="mb-10">
            <div className="flex flex-col gap-1 mb-6">
              <h1 className="text-4xl md:text-5xl font-heading font-black text-white tracking-tight">
                News Feed
              </h1>
              <p className="text-sm text-gray-500 font-medium">
                Showing latest political updates across India
              </p>
            </div>

            <FilterTabs />
          </div>

          {/* News Feed List */}
          <NewsFeed initialNews={news} currentUser={user} />
        </div>
      </div>
    </div>
  );
}
