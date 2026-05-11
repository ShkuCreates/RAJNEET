"use client";

import { useState } from "react";
import { Bell, Newspaper, X } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import NewsFeed from "@/components/news/NewsFeed";
import { toast } from "sonner";

type DashboardHomeClientProps = {
  news: any[];
  currentUser: any;
  selectedCategory: string | null;
  latestFetchAt: string | null;
  showLiveOnly?: boolean;
};

export default function DashboardHomeClient({
  news,
  currentUser,
  selectedCategory,
  latestFetchAt,
  showLiveOnly = false,
}: DashboardHomeClientProps) {
  const [subscribing, setSubscribing] = useState(false);
  const lastFetchedLabel = latestFetchAt
    ? formatDistanceToNow(new Date(latestFetchAt), { addSuffix: true })
    : null;

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

  return (
    <div className="mx-auto w-full max-w-[1200px] px-6 py-8">
      {showLiveOnly ? (
        <div className="rounded-[28px] border border-white/10 bg-[#111827] px-8 py-16 text-center shadow-2xl">
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
      ) : (
        <>
          {selectedCategory ? (
            <div className="mb-6 flex items-center justify-between rounded-2xl border border-white/10 bg-[#111827] px-4 py-3">
              <p className="text-sm text-white">
                Showing: <span className="font-semibold">{selectedCategory}</span>
              </p>
              <a
                href="/dashboard"
                className="inline-flex items-center gap-2 text-sm text-gray-300 transition-colors hover:text-white"
              >
                <X size={16} />
                Clear filter
              </a>
            </div>
          ) : null}

          {news.length > 0 ? (
            <NewsFeed initialNews={news} currentUser={currentUser} />
          ) : (
            <div className="rounded-[28px] border border-white/10 bg-[#111827] px-8 py-16 text-center shadow-2xl">
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
      )}
    </div>
  );
}
