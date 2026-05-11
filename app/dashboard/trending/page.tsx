import { prisma } from "@/lib/prisma";
import NewsFeed from "@/components/news/NewsFeed";
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
    orderBy: { created_at: "desc" },
    include: {
      upvotes: user ? {
        where: { user_id: user.id },
        select: { user_id: true },
      } : false,
      _count: {
        select: { opinions: true, upvotes: true, pageViews: true },
      },
      opinions: {
        select: { stance: true },
      },
    },
  });

  return (
    <div className="mx-auto w-full max-w-[1200px] px-6 py-8">
      <header className="mb-10">
        <div className="mb-4 flex items-center gap-3">
          <div className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
          <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-red-500">Trending Now</h2>
        </div>
        <h1 className="mb-4 text-4xl font-heading font-black uppercase tracking-tight text-white">Hot Debates & Topics</h1>
        <p className="max-w-xl text-gray-500">The most discussed and important political topics across India, ranked by publishing priority and trending signals.</p>
      </header>

      <NewsFeed initialNews={news} currentUser={user} />
    </div>
  );
}
