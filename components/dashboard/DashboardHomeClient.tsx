"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Bell, Loader2, Newspaper, X } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import NewsFeed from "@/components/news/NewsFeed";
import LiveNewsTracker from "@/components/dashboard/LiveNewsTracker";
import { toast } from "sonner";

type DashboardHomeClientProps = {
  currentUser: any;
  selectedCategory: string | null;
  showLiveOnly?: boolean;
};

type NewsResponse = {
  news: any[];
  latestFetchAt: string | null;
};

export default function DashboardHomeClient({
  currentUser,
  selectedCategory,
  showLiveOnly = false,
}: DashboardHomeClientProps) {
  const [subscribing, setSubscribing] = useState(false);
  const [loading, setLoading] = useState(!showLiveOnly);
  const [news, setNews] = useState<any[]>([]);
  const [latestFetchAt, setLatestFetchAt] = useState<string | null>(null);

  const lastFetchedLabel = useMemo(() => {
    if (!latestFetchAt) return null;
    return formatDistanceToNow(new Date(latestFetchAt), { addSuffix: true });
  }, [latestFetchAt]);

  useEffect(() => {
    if (showLiveOnly) return;

    const fetchNews = async (category?: string) => {
      const query = category
        ? `/api/news?category=${encodeURIComponent(category)}&limit=12`
        : "/api/news?limit=12";

      console.log('Fetching news from:', query);
      const res = await fetch(query, { cache: "no-store" });
      
      if (!res.ok) {
        console.error('News fetch failed:', res.status, res.statusText);
        return { news: [], latestFetchAt: null };
      }
      
      const data = await res.json();
      console.log('News response:', data);

      // Handle both formats: { news: [], latestFetchAt: null } or direct array
      if (Array.isArray(data)) {
        return { news: data, latestFetchAt: null };
      }

      return data;
    };

    let cancelled = false;

    const run = async () => {
      try {
        setLoading(true);
        const data = await fetchNews(selectedCategory || undefined);
        if (cancelled) return;
        setNews(Array.isArray(data.news) ? data.news : []);
        setLatestFetchAt(data.latestFetchAt ?? null);
      } catch (error) {
        if (cancelled) return;
        console.error("Dashboard news load failed:", error);
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
  }, [selectedCategory, showLiveOnly]);

  const handleNotifyMe = async () => {
    if (!currentUser?.email) {
      toast.error("Please sign in with a valid email first.");
      return;
    }

    try {
      setSubscribing(true);
      const res = await fetch("/api/debates/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: currentUser.id,
          email: currentUser.email,
          topicPreferences: ["live-news"],
        }),
      });
      const data = await res.json();
      if (!res.ok || !data?.success) {
        throw new Error(data?.error || "Subscription failed");
      }
      toast.success("We will notify you when live streams go up.");
    } catch (error: any) {
      toast.error(error?.message || "Unable to save your preference right now.");
    } finally {
      setSubscribing(false);
    }
  };

  if (showLiveOnly) {
    return (
      <div className="mx-auto w-full max-w-[1200px] px-6 py-8">
        <div className="rounded-[32px] border border-white/10 bg-[#111827] px-8 py-16 text-center shadow-2xl">
          <div className="mb-4 text-sm font-semibold uppercase tracking-[0.3em] text-gray-500">
            Coming Soon
          </div>
          <h2 className="mb-3 text-3xl font-semibold text-white">
            Live news streams are being set up for RAJNEET.
          </h2>
          <p className="mb-8 text-gray-400">
            You will be notified when we go live.
          </p>
          <button
            onClick={handleNotifyMe}
            disabled={subscribing}
            className="inline-flex items-center gap-2 rounded-full bg-accent-blue px-6 py-3 text-sm font-semibold text-white transition hover:bg-accent-blue/90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Bell size={16} />
            {subscribing ? "Saving..." : "Notify Me"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Left Side - Filter & News */}
      <div className="flex-1">
        {/* Filter Info */}
        {selectedCategory && (
          <div className="mb-6 rounded-[32px] border border-white/10 bg-[#111827] px-8 py-4 text-center shadow-2xl">
            <p className="text-lg font-semibold text-white mb-2">
              Showing: <span className="font-semibold">{selectedCategory}</span>
            </p>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 text-sm text-gray-300 transition-colors hover:text-white"
            >
              <X size={16} />
              Clear filter
            </Link>
          </div>
        ) : null}

        {/* Loading State */}
        {loading ? (
          <div className="flex min-h-[320px] items-center justify-center rounded-[32px] border border-white/10 bg-[#111827]">
            <div className="flex items-center gap-3 text-sm text-gray-400">
              <Loader2 size={18} className="animate-spin" />
              Loading latest news...
            </div>
          </div>
        ) : news.length > 0 ? (
          <NewsFeed initialNews={news} currentUser={currentUser} />
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

      {/* Right Side - Live News Tracker */}
      <div className="w-80">
        <LiveNewsTracker />
      </div>
    </div>
  );
}
}
