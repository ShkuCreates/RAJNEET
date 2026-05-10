import { prisma } from "@/lib/prisma";
import NewsFeed from "@/components/news/NewsFeed";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

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
  if (filter === "My District" && user?.district) {
    whereClause = { district: user.district };
  } else if (filter === "My State" && user?.state) {
    whereClause = { state: user.state };
  } else if (filter === "National") {
    whereClause = { geo_level: "NATIONAL" };
  } else if (filter === "International") {
    whereClause = { geo_level: "INTERNATIONAL" };
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
        select: { opinions: true },
      },
    },
    orderBy: {
      created_at: "desc",
    },
  });

  return (
    <div className="flex flex-col h-full">
      {/* Top Filter Bar */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border p-4">
        <h1 className="text-xl font-bold mb-4">News Feed</h1>
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {["All", "My District", "My State", "National", "International"].map((f) => (
            <a
              key={f}
              href={`/dashboard?filter=${encodeURIComponent(f)}`}
              className={`whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                filter === f
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary/10 text-secondary-foreground hover:bg-secondary/20"
              }`}
            >
              {f}
            </a>
          ))}
        </div>
      </div>

      {/* News Feed List */}
      <div className="p-4">
        <NewsFeed initialNews={news} currentUser={user} />
      </div>
    </div>
  );
}
