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
  OTHER: "bg-gray-500"
};

export default function NewsCard({ news, currentUser }: { news: any, currentUser: any }) {
  const router = useRouter();
  const [liked, setLiked] = useState(
    news.upvotes?.some((v: any) => v.user_id === currentUser?.id) || false
  );
  const [upvoteCount, setUpvoteCount] = useState(news._count?.upvotes || 0);

  const categoryKey = news.category?.toUpperCase() || "OTHER";
  const categoryColor = categoryColors[categoryKey] || "bg-gray-500";
  const isNew = differenceInHours(new Date(), new Date(news.created_at)) < 2;

  const handleUpvote = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentUser) {
      toast.error("Login to like articles");
      return;
    }
    try {
      const res = await fetch("/api/news/upvote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newsId: news.id })
      });
      const data = await res.json();
      if (data.success) {
        setLiked(data.action === "added");
        setUpvoteCount((prev: number) => data.action === "added" ? prev + 1 : prev - 1);
        if (data.action === "added") toast.success("Liked!");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const slugFromHeadline = (headline: string) =>
    headline
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .split(" ")
      .filter((w) => !["a", "an", "the", "and", "or", "but", "in", "on", "at", "to", "for", "of", "with", "by", "from", "is", "was", "are", "were"].includes(w))
      .join("-")
      .slice(0, 60);

  const articleSlug = news.slug || slugFromHeadline(news.headline || "article");
  const articleUrl = `/news/${articleSlug}`;

  const openArticle = () => {
    router.push(articleUrl);
    fetch("/api/admin/track-view", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ newsId: news.id, path: articleUrl })
    }).catch(() => {});
  };

  const previewSource =
    news.seo_body ||
    news.summary ||
    news.body ||
    "Click to read full article.";
  const previewText =
    previewSource.length > 120 ? `${previewSource.slice(0, 120).trim()}...` : previewSource;
  const ogFallbackUrl = `/api/og?title=${encodeURIComponent(news.seo_title || news.headline)}&category=${encodeURIComponent(news.category || "POLITICAL")}`;
  const isGenericCover =
    typeof news.cover_image_url === "string" &&
    (news.cover_image_url.includes("unsplash.com") ||
      news.cover_image_url.includes("photo-1504711434969-e33886168f5c"));
  const displayCoverUrl = !news.cover_image_url || isGenericCover ? ogFallbackUrl : news.cover_image_url;

  return (
    <>
      <motion.article
        whileHover={{ y: -4 }}
        onClick={openArticle}
        className="group relative bg-[#111827] border border-white/5 rounded-[28px] overflow-hidden shadow-2xl transition-all duration-300 hover:border-accent-blue/30 hover:shadow-accent-blue/5 cursor-pointer"
      >
        {/* Cover Image */}
        {displayCoverUrl ? (
          <div className="relative aspect-video overflow-hidden">
            <img
              src={displayCoverUrl}
              alt={news.headline}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = ogFallbackUrl;
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#111827] via-[#111827]/20 to-transparent" />

            {/* Badges */}
            <div className="absolute top-4 left-4 flex gap-2">
              <span className={`px-2.5 py-1 text-[9px] font-black uppercase tracking-widest ${categoryColor} text-white rounded-lg shadow-lg`}>
                {news.category}
              </span>
            </div>

            {isNew && (
              <div className="absolute top-4 right-4">
                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-red-500 rounded-lg shadow-lg animate-pulse">
                  <div className="w-1 h-1 rounded-full bg-white" />
                  <span className="text-[9px] font-black text-white uppercase tracking-widest">LIVE</span>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="relative aspect-video overflow-hidden">
            <img
              src={ogFallbackUrl}
              alt={news.headline}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#111827] via-[#111827]/20 to-transparent" />
          </div>
        )}

        <div className="p-6">
          {/* Meta */}
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center gap-1 text-[10px] font-bold text-accent-blue uppercase tracking-widest">
              <MapPin size={10} />
              {news.state || "National"}
            </div>
            <div className="w-1 h-1 rounded-full bg-white/10" />
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
              {formatDistanceToNow(new Date(news.created_at), { addSuffix: true })}
            </span>
          </div>

          {/* Headline */}
          <h2 className="text-lg md:text-xl font-heading font-black text-white leading-tight mb-3 group-hover:text-accent-blue transition-colors line-clamp-2">
            {news.headline}
          </h2>

          <p className="text-sm text-gray-400 leading-relaxed line-clamp-3 mb-5">
            {previewText}
          </p>

          {/* Stance Bar */}
          <div className="mb-5">
            <div className="flex justify-between text-[9px] font-black uppercase tracking-widest mb-2">
              <span className="text-green-500">For 45%</span>
              <span className="text-gray-500">Neutral 20%</span>
              <span className="text-red-500">Against 35%</span>
            </div>
            <div className="h-1.5 w-full flex rounded-full overflow-hidden bg-white/5">
              <motion.div initial={{ width: 0 }} animate={{ width: "45%" }} transition={{ duration: 0.8 }} className="bg-green-500/60" />
              <motion.div initial={{ width: 0 }} animate={{ width: "20%" }} transition={{ duration: 0.8, delay: 0.1 }} className="bg-gray-500/40" />
              <motion.div initial={{ width: 0 }} animate={{ width: "35%" }} transition={{ duration: 0.8, delay: 0.2 }} className="bg-red-500/60" />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-5 border-t border-white/5">
            <div className="flex items-center gap-4">
              <button
                onClick={handleUpvote}
                className={`flex items-center gap-1.5 transition-all ${liked ? "text-red-500 scale-110" : "text-gray-500 hover:text-red-400"}`}
              >
                <Heart size={15} fill={liked ? "currentColor" : "none"} />
                <span className="text-[11px] font-black">{upvoteCount}</span>
              </button>
              <div className="flex items-center gap-1.5 text-gray-500">
                <MessageSquare size={15} />
                <span className="text-[11px] font-black">{news._count?.opinions || 0}</span>
              </div>
              <div className="flex items-center gap-1.5 text-gray-500">
                <Eye size={15} />
                <span className="text-[11px] font-black">{news._count?.pageViews || 0}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={(e) => { e.stopPropagation(); openArticle(); }}
                className="px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-300 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all border border-white/5"
              >
                Read
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); openArticle(); }}
                className="flex items-center gap-2 px-4 py-2 bg-accent-blue hover:bg-accent-blue/90 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-accent-blue/20"
              >
                Debate
                <ArrowRight size={13} />
              </button>
            </div>
          </div>
        </div>
      </motion.article>
    </>
  );
}
