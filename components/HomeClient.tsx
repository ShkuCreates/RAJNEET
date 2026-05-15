"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Bell, Loader2, Newspaper, X } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import NewsFeed from "@/components/news/NewsFeed";
import ArticleFeed from "@/components/articles/ArticleFeed";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";

type NewsResponse = {
  news: any[];
  latestFetchAt: string | null;
};

type ArticlesResponse = {
  articles: any[];
};

export default function HomeClient() {
  const searchParams = useSearchParams();
  const selectedCategory = searchParams.get("category") || null;
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [news, setNews] = useState<any[]>([]);
  const [articles, setArticles] = useState<any[]>([]);
  const [latestFetchAt, setLatestFetchAt] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<"news" | "article">("news");

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

    const fetchArticles = async () => {
      try {
        const res = await fetch("/api/articles");
        if (res.ok) {
          const data = await res.json();
          return data.articles || [];
        }
      } catch (e) {
        console.error("Failed to fetch articles:", e);
      }
      return [];
    };

    let cancelled = false;

    const run = async () => {
      try {
        setLoading(true);
        const [newsData, articlesData] = await Promise.all([
          fetchNews(selectedCategory || undefined),
          fetchArticles()
        ]);
        if (cancelled) return;
        setNews(Array.isArray(newsData.news) ? newsData.news : []);
        setLatestFetchAt(newsData.latestFetchAt ?? null);
        setArticles(articlesData);
      } catch (error) {
        if (cancelled) return;
        console.error("Dashboard load failed:", error);
        setNews([]);
        setLatestFetchAt(null);
        setArticles([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    run();

    return () => {
      cancelled = true;
    };
  }, [selectedCategory]);

  // Watch for section changes from AppShell (via localStorage or other means)
  useEffect(() => {
    const handleSectionChange = () => {
      const savedSection = localStorage.getItem("rajneet-section");
      if (savedSection === "news" || savedSection === "article") {
        setActiveSection(savedSection);
      }
    };
    
    handleSectionChange();
    window.addEventListener("storage", handleSectionChange);
    
    // Also listen for a custom event
    const handleCustomEvent = (e: any) => {
      if (e.detail.section) {
        setActiveSection(e.detail.section);
      }
    };
    window.addEventListener("rajneet-section-change", handleCustomEvent);
    
    return () => {
      window.removeEventListener("storage", handleSectionChange);
      window.removeEventListener("rajneet-section-change", handleCustomEvent);
    };
  }, []);

  return (
    <div className="mx-auto w-full max-w-[1400px] px-6 py-8">
      <div className="flex flex-col gap-8">
        <div className="flex-1">
          {activeSection === "news" ? (
            <>
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
                <div className="flex min-h-[320px] items-center justify-center rounded-[32px] border border-white/10 bg-[#111827]">
                  <div className="flex items-center gap-3 text-sm text-gray-400">
                    <Loader2 size={18} className="animate-spin" />
                    Loading latest news...
                  </div>
                </div>
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
            </>
          ) : (
            <>
              {loading ? (
                <div className="flex min-h-[320px] items-center justify-center rounded-[32px] border border-white/10 bg-[#111827]">
                  <div className="flex items-center gap-3 text-sm text-gray-400">
                    <Loader2 size={18} className="animate-spin" />
                    Loading articles...
                  </div>
                </div>
              ) : articles.length > 0 ? (
                <ArticleFeed initialArticles={articles} currentUser={session?.user} />
              ) : (
                <div className="rounded-[32px] border border-white/10 bg-[#111827] px-8 py-16 text-center shadow-2xl">
                  <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-accent-amber/10">
                    <Newspaper className="text-accent-amber" size={30} />
                  </div>
                  <h2 className="mb-3 text-2xl font-semibold text-white">
                    No articles available yet.
                  </h2>
                  <p className="mb-2 text-gray-400">
                    Be the first to submit an article!
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
