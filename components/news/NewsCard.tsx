"use client";

import { useState } from "react";
import { MessageSquare, MapPin, Eye, ArrowRight, Heart } from "lucide-react";
import { formatDistanceToNow, differenceInHours } from "date-fns";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const categoryColors: Record<string, string> = {
  POLITICAL: "bg-accent-blue",
  POLITICS: "bg-accent-blue",
  CRIMINAL: "bg-red-500",
  FINANCE: "bg-green-500",
  INFRASTRUCTURE: "bg-accent-amber",
  ENVIRONMENT: "bg-emerald-500",
  TECHNOLOGY: "bg-purple-500",
  TECH: "bg-purple-500",
  HEALTH: "bg-rose-500",
  WORLD: "bg-orange-500",
  SPORTS: "bg-yellow-500",
  ENTERTAINMENT: "bg-pink-500",
  LIFESTYLE: "bg-teal-500",
  TOP: "bg-accent-blue",
  OTHER: "bg-gray-500",
};

export default function NewsCard({ news, currentUser }: { news: any; currentUser: any }) {
  const router = useRouter();
  const stripHtml = (value: string) => value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  const normalizeImageUrl = (value?: string | null) => {
    if (!value) return "";
    if (value.startsWith("http://")) return value.replace("http://", "https://");
    if (value.startsWith("https://") || value.startsWith("/")) return value;
    return "";
  };
  const [liked, setLiked] = useState(
    news.upvotes?.some((vote: any) => vote.user_id === currentUser?.id) || false
  );
  const [upvoteCount, setUpvoteCount] = useState(news._count?.upvotes || 0);

  const categoryKey = news.category?.toUpperCase() || "OTHER";
  const categoryColor = categoryColors[categoryKey] || "bg-gray-500";
  const isNew = differenceInHours(new Date(), new Date(news.created_at)) < 2;
  const stances = Array.isArray(news.opinions) ? news.opinions : [];
  const totalStances = stances.length;
  const forCount = stances.filter((opinion: any) => opinion.stance === "FOR").length;
  const neutralCount = stances.filter((opinion: any) => opinion.stance === "NEUTRAL").length;
  const againstCount = stances.filter((opinion: any) => opinion.stance === "AGAINST").length;
  const toPercent = (count: number) => (totalStances > 0 ? Math.round((count / totalStances) * 100) : 0);
  const forPercent = toPercent(forCount);
  const neutralPercent = toPercent(neutralCount);
  const againstPercent = toPercent(againstCount);

  const handleUpvote = async (event: React.MouseEvent) => {
    event.stopPropagation();
    if (!currentUser) {
      toast.error("Login to like articles");
      return;
    }

    try {
      const res = await fetch("/api/news/upvote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newsId: news.id }),
      });
      const data = await res.json();
      if (data.success) {
        setLiked(data.action === "added");
        setUpvoteCount((prev: number) => (data.action === "added" ? prev + 1 : prev - 1));
        if (data.action === "added") toast.success("Liked!");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const slugFromHeadline = (headline: string) =>
    headline
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .split(" ")
      .filter(
        (word) =>
          ![
            "a",
            "an",
            "the",
            "and",
            "or",
            "but",
            "in",
            "on",
            "at",
            "to",
            "for",
            "of",
            "with",
            "by",
            "from",
            "is",
            "was",
            "are",
            "were",
          ].includes(word)
      )
      .join("-")
      .slice(0, 60);

  const articleSlug = news.slug || slugFromHeadline(news.headline || "article");
  const articleUrl = `/news/${articleSlug}`;

  const openArticle = () => {
    router.push(articleUrl);
    fetch("/api/admin/track-view", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ newsId: news.id, path: articleUrl }),
    }).catch(() => {});
  };

  const briefContent = news.seo_body
    ? `${stripHtml(news.seo_body).split(" ").slice(0, 40).join(" ")}...`
    : news.summary
      ? `${stripHtml(news.summary).substring(0, 200)}...`
      : null;
  const ogFallbackUrl = `/api/og?title=${encodeURIComponent(
    news.seo_title || news.headline
  )}&category=${encodeURIComponent(news.category || "POLITICAL")}`;
  const isGenericCover =
    typeof news.cover_image_url === "string" &&
    (news.cover_image_url.includes("unsplash.com") ||
      news.cover_image_url.includes("photo-1504711434969-e33886168f5c"));
  const normalizedCover = normalizeImageUrl(news.cover_image_url);
  const displayCoverUrl = !normalizedCover || isGenericCover ? ogFallbackUrl : normalizedCover;

  return (
    <motion.article
      whileHover={{ y: -4, scale: 1.02 }}
      onClick={openArticle}
      className="group relative cursor-pointer overflow-hidden rounded-[28px] border border-white/5 bg-[#111827] shadow-2xl transition-all duration-300 hover:border-accent-blue/30 hover:shadow-accent-blue/20 hover:shadow-[0_8px_16px_rgba(59,130,246,0.15)]"
    >
      <div className="relative aspect-video overflow-hidden">
        <img
          src={displayCoverUrl}
          alt={news.headline}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105 group-hover:brightness-110"
          referrerPolicy="no-referrer"
          onError={(event) => {
            const img = event.currentTarget as HTMLImageElement;
            if (img.dataset.fallbackApplied === "1") return;
            img.dataset.fallbackApplied = "1";
            img.src = ogFallbackUrl;
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#111827] via-[#111827]/20 to-transparent" />

        <div className="absolute left-4 top-4 flex gap-2">
          <span
            className={`rounded-lg px-2.5 py-1 text-[9px] font-black uppercase tracking-widest text-white shadow-lg ${categoryColor}`}
          >
            {news.category}
          </span>
        </div>

        {isNew ? (
          <div className="absolute right-4 top-4">
            <div className="flex items-center gap-1.5 rounded-lg bg-red-500 px-2.5 py-1 shadow-lg animate-pulse">
              <div className="h-1 w-1 rounded-full bg-white" />
              <span className="text-[9px] font-black uppercase tracking-widest text-white">NEW</span>
            </div>
          </div>
        ) : null}
      </div>

      <div className="p-6">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-accent-blue">
            <MapPin size={10} />
            {news.state || "National"}
          </div>
          <div className="h-1 w-1 rounded-full bg-white/10" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
            {formatDistanceToNow(new Date(news.created_at), { addSuffix: true })}
          </span>
        </div>

        <h2 className="mb-3 line-clamp-2 text-lg font-heading font-black leading-tight text-white transition-all duration-300 group-hover:text-accent-blue group-hover:brightness-125 md:text-xl">
          {news.headline}
        </h2>

        {briefContent ? (
          <p className="mb-5 line-clamp-3 text-[14px] font-normal leading-[1.7] text-[#9CA3AF]">
            {briefContent}
          </p>
        ) : null}

        <div className="mb-5">
          <div className="mb-2 flex justify-between text-[9px] font-black uppercase tracking-widest">
            <span className="text-green-500">For {forPercent}%</span>
            <span className="text-gray-500">Neutral {neutralPercent}%</span>
            <span className="text-red-500">Against {againstPercent}%</span>
          </div>
          <div className="flex h-1.5 w-full overflow-hidden rounded-full bg-white/5">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${forPercent}%` }}
              transition={{ duration: 0.8 }}
              className="bg-green-500/60"
            />
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${neutralPercent}%` }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="bg-gray-500/40"
            />
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${againstPercent}%` }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="bg-red-500/60"
            />
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-white/5 pt-5">
          <div className="flex items-center gap-4">
            <button
              onClick={handleUpvote}
              className={`flex items-center gap-1.5 transition-all duration-250 transform hover:scale-105 hover:-translate-y-0.5 ${
                liked ? "scale-110 text-red-500 shadow-red-500/20" : "text-gray-500 hover:text-red-400 hover:shadow-gray-500/10"
              }`}
            >
              <Heart size={15} fill={liked ? "currentColor" : "none"} />
              <span className="text-[11px] font-black">{upvoteCount}</span>
            </button>
            <div className="flex items-center gap-1.5 text-gray-500 transition-all duration-200 hover:text-accent-blue group-hover:scale-110">
              <MessageSquare size={15} className="transition-transform duration-300 group-hover:rotate-12" />
              <span className="text-[11px] font-black">{news._count?.opinions || 0}</span>
            </div>
            <div className="flex items-center gap-1.5 text-gray-500 transition-all duration-200 hover:text-accent-blue group-hover:scale-110">
              <Eye size={15} className="transition-transform duration-300 group-hover:scale-120" />
              <span className="text-[11px] font-black">{news._count?.pageViews || 0}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={(event) => {
                event.stopPropagation();
                openArticle();
              }}
              className="rounded-xl border border-white/5 bg-white/5 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-gray-300 transition-all duration-250 transform hover:scale-105 hover:-translate-y-0.5 hover:bg-white/10 hover:shadow-lg hover:shadow-accent-blue/20"
            >
              Read
            </button>
            <button
              onClick={(event) => {
                event.stopPropagation();
                openArticle();
              }}
              className="rounded-xl border border-white/5 bg-white/5 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-gray-300 transition-all duration-250 transform hover:scale-105 hover:-translate-y-0.5 hover:bg-white/10 hover:shadow-lg hover:shadow-accent-blue/20"
            >
              Debate
              <ArrowRight size={13} />
            </button>
          </div>
        </div>
      </div>
    </motion.article>
  );
}
