import { prisma } from "@/lib/prisma";
import NewsFeed from "@/components/news/NewsFeed";
import { DashboardTopBar } from "@/components/dashboard/DashboardTopBar";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function TrendingPage({ searchParams }: { searchParams: { category?: string } }) {
  const session = await getServerSession(authOptions);
  const user = session?.user;

  // Fetch only trending news (priority high or is_trending true)
  const news = await prisma.news.findMany({
    where: {
      status: "PUBLISHED",
      OR: [
        { priority: "high" },
        { is_trending: true }
      ]
    },
    orderBy: { created_at: "desc" }
  });

  return (
    <div className="flex flex-col h-full bg-[#050A14]">
      <DashboardTopBar user={user} />
      
      <div className="flex-1 overflow-y-auto">
        <div className="p-8 md:p-12">
          <header className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <h2 className="text-[10px] font-black text-red-500 uppercase tracking-[0.3em]">Trending Now</h2>
            </div>
            <h1 className="text-4xl font-heading font-black text-white uppercase tracking-tight mb-4">Hot Debates & Topics</h1>
            <p className="text-gray-500 max-w-xl">The most discussed and important political topics across India right now, curated by AI and engagement.</p>
          </header>

          <NewsFeed initialNews={news} currentUser={user} />
        </div>
      </div>
    </div>
  );
}
