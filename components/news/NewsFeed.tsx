"use client";

import NewsCard from "./NewsCard";
import { motion, AnimatePresence } from "framer-motion";
import AdBanner from "@/components/ads/AdBanner";
import { Pin } from "lucide-react";

export default function NewsFeed({ initialNews, currentUser }: { initialNews: any[], currentUser: any }) {
  // Remove duplicates based on id
  const uniqueNews = Array.from(new Map(initialNews.map(news => [news.id, news])).values());
  
  const mainNews = uniqueNews[0];
  const sideNews = uniqueNews.slice(1, 6);
  const remainingNews = uniqueNews.slice(6);

  const AD_SLOT = "3892741056";

  return (
    <div className="space-y-8">
      {/* Main + Side Section */}
      {mainNews && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Large News */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <LargeNewsCard news={mainNews} currentUser={currentUser} />
            </motion.div>
          </div>
          
          {/* Side Small News */}
          <div className="space-y-4">
            <h3 className="text-lg font-heading font-bold text-white border-b border-white/10 pb-2">Latest News</h3>
            <AnimatePresence>
              {sideNews.map((news, index) => (
                <motion.div
                  key={news.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.08, duration: 0.5 }}
                >
                  <SmallNewsCard news={news} currentUser={currentUser} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Remaining News Grid */}
      {remainingNews.length > 0 && (
        <div>
          <h3 className="text-lg font-heading font-bold text-white border-b border-white/10 pb-2 mb-6">More News</h3>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            <AnimatePresence>
              {remainingNews.map((news, index) => (
                <motion.div
                  key={news.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05, duration: 0.5 }}
                >
                  <NewsCard news={news} currentUser={currentUser} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  );
}

function LargeNewsCard({ news, currentUser }: { news: any; currentUser: any }) {
  const router = useRouter();
  const { showPopup } = useLoginPopup();
  const stripHtml = (value: string) => value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  const normalizeImageUrl = (value?: string | null) => {
    if (!value) return "";
    if (value.startsWith("http://")) return value.replace("http://", "https://");
    if (value.startsWith("https://") || value.startsWith("/")) return value;
    return "";
  };

  const categoryKey = news.category?.toUpperCase() || "OTHER";
  const categoryColor = categoryColors[categoryKey] || "bg-gray-500";

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
    ? `${stripHtml(news.seo_body).split(" ").slice(0, 50).join(" ")}...`
    : news.summary
      ? `${stripHtml(news.summary).substring(0, 250)}...`
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
      whileHover={{ y: -4 }}
      onClick={openArticle}
      className="group relative cursor-pointer overflow-hidden rounded-[32px] border border-white/5 bg-[#111827] shadow-2xl transition-all duration-300 hover:border-accent-blue/30 hover:shadow-accent-blue/20"
    >
      {news.is_pinned && (
        <div className="absolute top-4 right-4 z-10 flex items-center gap-2 rounded-full bg-accent-amber/20 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-accent-amber border border-accent-amber/30 shadow-lg">
          <Pin size={12} />
          Pinned
        </div>
      )}
      <div className="grid grid-cols-1 lg:grid-cols-5">
        <div className="lg:col-span-3 relative aspect-[16/9] lg:aspect-auto">
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
          <div className="absolute inset-0 bg-gradient-to-t from-[#111827] via-[#111827]/40 to-transparent lg:bg-gradient-to-r" />
          
          <div className="absolute left-6 top-6">
            <span
              className={`rounded-lg px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-white shadow-lg ${categoryColor}`}
            >
              {news.category}
            </span>
          </div>
        </div>
        
        <div className="lg:col-span-2 p-6 lg:p-8 flex flex-col justify-center">
          <div className="mb-4 flex items-center gap-3 text-[11px] font-bold uppercase tracking-widest text-gray-400">
            <div className="flex items-center gap-1">
              <MapPin size={12} />
              {news.state || "National"}
            </div>
            <div className="h-1 w-1 rounded-full bg-white/20" />
            <span>{formatDistanceToNow(new Date(news.created_at), { addSuffix: true })}</span>
          </div>
          
          <h2 className="mb-4 text-2xl lg:text-3xl font-heading font-black leading-tight text-white transition-all duration-300 group-hover:text-accent-blue">
            {news.headline}
          </h2>
          
          {briefContent && (
            <p className="mb-6 text-[15px] leading-relaxed text-[#9CA3AF]">
              {briefContent}
            </p>
          )}
          
          <div className="flex items-center gap-4">
            <button
              onClick={(e) => { e.stopPropagation(); openArticle(); }}
              className="rounded-xl bg-accent-blue px-6 py-3 text-sm font-black uppercase tracking-widest text-white transition-all hover:bg-accent-blue/90 hover:shadow-lg hover:shadow-accent-blue/30"
            >
              Read Full Story
            </button>
          </div>
        </div>
      </div>
    </motion.article>
  );
}

function SmallNewsCard({ news, currentUser }: { news: any; currentUser: any }) {
  const router = useRouter();
  const { showPopup } = useLoginPopup();
  const stripHtml = (value: string) => value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  const normalizeImageUrl = (value?: string | null) => {
    if (!value) return "";
    if (value.startsWith("http://")) return value.replace("http://", "https://");
    if (value.startsWith("https://") || value.startsWith("/")) return value;
    return "";
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
      whileHover={{ x: -4 }}
      onClick={openArticle}
      className="group flex gap-4 cursor-pointer rounded-2xl border border-white/5 bg-[#111827] p-3 transition-all hover:border-white/10 hover:bg-[#131928]"
    >
      <div className="relative h-20 w-28 flex-shrink-0 overflow-hidden rounded-xl">
        <img
          src={displayCoverUrl}
          alt={news.headline}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          referrerPolicy="no-referrer"
        />
      </div>
      <div className="flex flex-col justify-center flex-1 min-w-0">
        <span className="text-[10px] font-black uppercase tracking-widest text-accent-blue mb-1">
          {news.category}
        </span>
        <h3 className="text-sm font-heading font-bold leading-snug text-white group-hover:text-accent-blue line-clamp-2">
          {news.headline}
        </h3>
      </div>
    </motion.article>
  );
}

// Import missing dependencies used in LargeNewsCard and SmallNewsCard
import { useRouter } from "next/navigation";
import { useLoginPopup } from "@/components/LoginPopup";
import { MapPin } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { categoryColors } from "./NewsCard";
