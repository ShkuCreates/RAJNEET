"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Bell, Loader2, Newspaper, X } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import NewsFeed from "@/components/news/NewsFeed";
import { NewsSkeleton } from "@/components/Skeletons";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";

type NewsResponse = {
  news: any[];
  latestFetchAt: string | null;
};

export default function HomeClient() {
  const searchParams = useSearchParams();
  const selectedCategory = searchParams.get("category") || null;
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [news, setNews] = useState<any[]>([]);
  const [latestFetchAt, setLatestFetchAt] = useState<string | null>(null);

  const lastFetchedLabel = useMemo(() => {
    if (!latestFetchAt) return null;
    return formatDistanceToNow(new Date(latestFetchAt), { addSuffix: true });
  }, [latestFetchAt]);

  useEffect(() => {
    const fetchNews = async (category?: string) => {
      const query = category
        ? `/api/news?category=${encodeURIComponent(category)}&limit=100`
        : "/api/news?limit=100";

      console.log('Fetching news from:', query);
      const res = await fetch(query, { cache: "no-store" });
      
      if (!res.ok) {
        console.error('News fetch failed:', res.status, res.statusText);
        return { news: [], latestFetchAt: null };
      }
      
      const data = await res.json();
      console.log('News response:', data);
      console.log('News IDs:', data.news?.map((n:any) => n.id) || []);

      if (Array.isArray(data)) {
        return { news: data, latestFetchAt: null };
      }

      return data;
    };

    let cancelled = false;

    const run = async () => {
      try {
        setLoading(true);
        const newsData = await fetchNews(selectedCategory || undefined);
        if (cancelled) return;
        
        let sortedNews = Array.isArray(newsData.news) ? newsData.news : [];
        sortedNews = sortedNews.sort((a, b) => {
          if (a.is_pinned && !b.is_pinned) return -1;
          if (!a.is_pinned && b.is_pinned) return 1;
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        });
        
        setNews(sortedNews);
        setLatestFetchAt(newsData.latestFetchAt ?? null);
      } catch (error) {
        if (cancelled) return;
        console.error("Dashboard load failed:", error);
        setNews([]);
        setLatestFetchAt(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    run();

    return () => {
      cancelled = true;
    };
  }, [selectedCategory]);

  return (
    <div className="mx-auto w-full max-w-[1400px] px-6 py-8">
      <div className="flex flex-col gap-8">
        <div className="flex-1">
          {selectedCategory ? (
            <div className="mb-6 rounded-[32px] border border-white/10 bg-[#111827] px-8 py-4 text-center shadow-2xl">
              <p className="text-lg font-semibold text-white mb-2">
                Showing: <span className="font-semibold">{selectedCategory}</span>
              </p>
              <Link
                href="/"
                className="inline-flex items-center gap-2 text-sm text-gray-300 transition-colors hover:text-white"
              >
                <X size={16} />
                Clear filter
              </Link>
            </div>
          ) : null}

          {loading ? (
            <NewsSkeleton />
          ) : news.length > 0 ? (
            <NewsFeed initialNews={news} currentUser={session?.user} />
          ) : (
            <div className="rounded-[32px] border border-white/10 bg-[#111827] px-8 py-16 text-center shadow-2xl">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-accent-blue/10">
                <Newspaper className="text-accent-blue" size={30} />
              </div>
              <h2 className="mb-3 text-2xl font-semibold text-white">
                No articles available for this filter yet.
              </h2>
              <p className="mb-2 text-gray-400">
                Our AI engine fetches new articles every 30 minutes.
              </p>
              <p className="text-sm text-gray-500">
                Last fetched: {lastFetchedLabel || "Not available yet"}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
