"use client";

import { ArticleCard } from "./ArticleCard";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Search, TrendingUp, Clock, DollarSign, Zap } from "lucide-react";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { SubmitArticleModal } from "./SubmitArticleModal";

export default function ArticleFeed({ initialArticles, currentUser }: { initialArticles: any[], currentUser: any }) {
  const [articles, setArticles] = useState(initialArticles);
  const [activeTab, setActiveTab] = useState(() => {
    const saved = localStorage.getItem("rajneet-article-tab");
    return saved === "trending" || saved === "latest" ? saved : "trending";
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);

  useEffect(() => {
    const handleTabChange = (e: any) => {
      if (e.detail?.tab) {
        setActiveTab(e.detail.tab);
      }
    };

    const handleSubmitArticle = () => {
      setIsSubmitModalOpen(true);
    };

    window.addEventListener("rajneet-article-tab", handleTabChange);
    window.addEventListener("rajneet-article-submit", handleSubmitArticle);

    return () => {
      window.removeEventListener("rajneet-article-tab", handleTabChange);
      window.removeEventListener("rajneet-article-submit", handleSubmitArticle);
    };
  }, []);

  const filteredArticles = articles.filter(article => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        article.title.toLowerCase().includes(query) ||
        article.author_username.toLowerCase().includes(query) ||
        article.tags.some((tag: string) => tag.toLowerCase().includes(query))
      );
    }
    return true;
  }).sort((a, b) => {
    if (activeTab === "trending") {
      return b.upvote_count - a.upvote_count;
    } else if (activeTab === "latest") {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }
    return 0;
  });

  const mainArticle = filteredArticles[0];
  const sideArticles = filteredArticles.slice(1, 6);
  const remainingArticles = filteredArticles.slice(6);

  return (
    <div className="space-y-8">
      {/* Top Navigation Bar for Articles */}
      <div className="hidden lg:block rounded-[32px] border border-white/10 bg-[#111827] px-6 py-4 shadow-2xl">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          {/* Left Section: Tabs */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsSubmitModalOpen(true)}
              className="flex items-center gap-2 rounded-xl bg-accent-amber px-4 py-2 text-xs font-black uppercase tracking-widest text-black hover:bg-accent-amber/90 transition-all"
            >
              <Plus size={14} />
              Submit Article
            </button>
            <div className="h-6 w-px bg-white/10" />
            <button
              onClick={() => {
                setActiveTab("trending");
                localStorage.setItem("rajneet-article-tab", "trending");
              }}
              className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-bold uppercase tracking-widest transition-all ${
                activeTab === "trending"
                  ? "bg-accent-blue text-white"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <TrendingUp size={14} />
              Trending
            </button>
            <button
              onClick={() => {
                setActiveTab("latest");
                localStorage.setItem("rajneet-article-tab", "latest");
              }}
              className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-bold uppercase tracking-widest transition-all ${
                activeTab === "latest"
                  ? "bg-accent-blue text-white"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <Clock size={14} />
              Latest
            </button>
            <button
              className="flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-white hover:bg-white/5 transition-all"
            >
              <DollarSign size={14} />
              Monetization
            </button>
            <button
              className="flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-white hover:bg-white/5 transition-all"
            >
              <Zap size={14} />
              Pop
            </button>
          </div>

          {/* Right Section: Search */}
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Search size={16} className="text-gray-500" />
            </div>
            <input
              type="text"
              placeholder="Search Article"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-10 pr-4 text-sm text-white placeholder-gray-500 focus:border-accent-blue focus:outline-none focus:ring-1 focus:ring-accent-blue"
            />
          </div>
        </div>
      </div>

      {/* Main + Side Section */}
      {mainArticle && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Large Article */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <LargeArticleCard article={mainArticle} currentUser={currentUser} />
            </motion.div>
          </div>
          
          {/* Side Small Articles */}
          <div className="space-y-4">
            <h3 className="text-lg font-heading font-bold text-white border-b border-white/10 pb-2">Latest Articles</h3>
            <AnimatePresence>
              {sideArticles.map((article, index) => (
                <motion.div
                  key={article.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.08, duration: 0.5 }}
                >
                  <SmallArticleCard article={article} currentUser={currentUser} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Remaining Articles Grid */}
      {remainingArticles.length > 0 && (
        <div>
          <h3 className="text-lg font-heading font-bold text-white border-b border-white/10 pb-2 mb-6">More Articles</h3>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            <AnimatePresence>
              {remainingArticles.map((article, index) => (
                <motion.div
                  key={article.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05, duration: 0.5 }}
                >
                  <ArticleCard article={article} currentUser={currentUser} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      <SubmitArticleModal
        isOpen={isSubmitModalOpen}
        onClose={() => setIsSubmitModalOpen(false)}
        onSubmit={async (articleData) => {
          try {
            const res = await fetch("/api/articles", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(articleData)
            });
            if (res.ok) {
              // Refresh articles after submission
              const refreshRes = await fetch("/api/articles");
              if (refreshRes.ok) {
                const data = await refreshRes.json();
                setArticles(data.articles || []);
              }
            }
          } catch (e) {
            console.error("Failed to submit article:", e);
          }
        }}
      />
    </div>
  );
}

function LargeArticleCard({ article, currentUser }: { article: any; currentUser: any }) {
  const router = useRouter();
  const readTime = Math.ceil(article.word_count / 200);
  const ogFallbackUrl = `/api/og?title=${encodeURIComponent(article.title)}&category=ARTICLE`;
  const normalizeImageUrl = (value?: string | null) => {
    if (!value) return "";
    if (value.startsWith("http://")) return value.replace("http://", "https://");
    if (value.startsWith("https://") || value.startsWith("/")) return value;
    return "";
  };
  const normalizedCover = normalizeImageUrl(article.cover_image_url);
  const displayCoverUrl = !normalizedCover ? ogFallbackUrl : normalizedCover;

  const openArticle = () => {
    router.push(`/articles/${article.slug || article.id}`);
  };

  return (
    <motion.article
      whileHover={{ y: -4 }}
      onClick={openArticle}
      className="group relative cursor-pointer overflow-hidden rounded-[32px] border border-white/5 bg-[#111827] shadow-2xl transition-all duration-300 hover:border-accent-amber/30 hover:shadow-accent-amber/20"
    >
      <div className="grid grid-cols-1 lg:grid-cols-5">
        <div className="lg:col-span-3 relative aspect-[16/9] lg:aspect-auto">
          <img
            src={displayCoverUrl}
            alt={article.title}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105 group-hover:brightness-110"
            referrerPolicy="no-referrer"
            loading="lazy"
            decoding="async"
            onError={(event) => {
              const img = event.currentTarget as HTMLImageElement;
              if (img.dataset.fallbackApplied === "1") return;
              img.dataset.fallbackApplied = "1";
              img.src = ogFallbackUrl;
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#111827] via-[#111827]/40 to-transparent lg:bg-gradient-to-r" />
          
          <div className="absolute left-6 top-6">
            <span className="rounded-lg bg-accent-amber px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-black shadow-lg">
              Article
            </span>
          </div>
        </div>
        
        <div className="lg:col-span-2 p-6 lg:p-8 flex flex-col justify-center">
          <div className="mb-4 flex items-center gap-3 text-[11px] font-bold uppercase tracking-widest text-gray-400">
            <div className="flex items-center gap-1">
              <div className="w-5 h-5 rounded-full bg-accent-blue/20 flex items-center justify-center text-accent-blue text-[9px] font-bold">
                {article.author_username?.charAt(0).toUpperCase()}
              </div>
              @{article.author_username}
            </div>
            <div className="h-1 w-1 rounded-full bg-white/20" />
            <span>{formatDistanceToNow(new Date(article.created_at), { addSuffix: true })}</span>
          </div>
          
          <h2 className="mb-4 text-2xl lg:text-3xl font-serif font-black leading-tight text-white transition-all duration-300 group-hover:text-accent-amber">
            {article.title}
          </h2>
          
          {article.excerpt && (
            <p className="mb-6 text-[15px] leading-relaxed text-[#9CA3AF]">
              {article.excerpt}
            </p>
          )}
          
          <div className="flex items-center gap-4">
            <button
              onClick={(e) => { e.stopPropagation(); openArticle(); }}
              className="rounded-xl bg-accent-amber px-6 py-3 text-sm font-black uppercase tracking-widest text-black transition-all hover:bg-accent-amber/90 hover:shadow-lg hover:shadow-accent-amber/30"
            >
              Read Article
            </button>
          </div>
        </div>
      </div>
    </motion.article>
  );
}

function SmallArticleCard({ article, currentUser }: { article: any; currentUser: any }) {
  const router = useRouter();
  const ogFallbackUrl = `/api/og?title=${encodeURIComponent(article.title)}&category=ARTICLE`;
  const normalizeImageUrl = (value?: string | null) => {
    if (!value) return "";
    if (value.startsWith("http://")) return value.replace("http://", "https://");
    if (value.startsWith("https://") || value.startsWith("/")) return value;
    return "";
  };
  const normalizedCover = normalizeImageUrl(article.cover_image_url);
  const displayCoverUrl = !normalizedCover ? ogFallbackUrl : normalizedCover;

  const openArticle = () => {
    router.push(`/articles/${article.slug || article.id}`);
  };

  return (
    <motion.article
      whileHover={{ x: -4 }}
      onClick={openArticle}
      className="group flex gap-4 cursor-pointer rounded-2xl border border-white/5 bg-[#111827] p-3 transition-all hover:border-white/10 hover:bg-[#131928]"
    >
      <div className="relative h-20 w-28 flex-shrink-0 overflow-hidden rounded-xl">
        <img
          src={displayCoverUrl}
          alt={article.title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          referrerPolicy="no-referrer"
          loading="lazy"
        />
      </div>
      <div className="flex flex-col justify-center flex-1 min-w-0">
        <span className="text-[10px] font-black uppercase tracking-widest text-accent-amber mb-1">
          Article
        </span>
        <h3 className="text-sm font-serif font-bold leading-snug text-white group-hover:text-accent-amber line-clamp-2">
          {article.title}
        </h3>
      </div>
    </motion.article>
  );
}

// Import missing dependencies
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
