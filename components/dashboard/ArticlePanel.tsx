"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, ExternalLink, Share2, MessageSquare, Landmark, BookOpen, Clock, MapPin } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import DebateSection from "../news/DebateSection";

interface ArticlePanelProps {
  news: any;
  isOpen: boolean;
  onClose: () => void;
  currentUser: any;
}

export function ArticlePanel({ news, isOpen, onClose, currentUser }: ArticlePanelProps) {
  if (!news) return null;

  const readingTime = news.body
    ? Math.ceil(news.body.replace(/<[^>]*>/g, "").split(" ").length / 200)
    : 2;

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: news.headline,
        text: news.summary,
        url: `${window.location.origin}/news/${news.slug}`,
      });
    } else {
      navigator.clipboard.writeText(`${window.location.origin}/news/${news.slug}`);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100]"
          />

          {/* Panel */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed top-0 right-0 h-full w-full max-w-2xl bg-[#050A14] border-l border-white/10 z-[101] shadow-2xl overflow-y-auto custom-scrollbar"
          >
            {/* Sticky Header */}
            <div className="sticky top-0 z-10 bg-[#050A14]/90 backdrop-blur-xl border-b border-white/5 p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-accent-amber/10 rounded-xl flex items-center justify-center">
                  <Landmark size={18} className="text-accent-amber" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-white uppercase tracking-wider">RAJNEET Editorial</h4>
                  <p className="text-[10px] text-gray-500 font-mono uppercase tracking-widest">
                    {news.category} • {news.state || "National"}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2.5 hover:bg-white/5 rounded-full text-gray-400 hover:text-white transition-colors"
              >
                <X size={22} />
              </button>
            </div>

            {/* Content */}
            <div className="p-8 pb-20">
              {/* Cover Image */}
              {news.cover_image_url && (
                <div className="relative aspect-video rounded-2xl overflow-hidden mb-8 border border-white/5 shadow-2xl">
                  <img
                    src={news.cover_image_url}
                    alt={news.headline}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).style.display = "none";
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#050A14]/80 via-transparent to-transparent" />
                  <div className="absolute bottom-4 left-4">
                    <span className="text-[9px] text-white/50 uppercase tracking-widest">RAJNEET Exclusive</span>
                  </div>
                </div>
              )}

              <div className="space-y-6">
                {/* Category & Time */}
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="px-3 py-1 bg-accent-blue/10 text-accent-blue text-[10px] font-black rounded-full uppercase tracking-widest border border-accent-blue/20">
                    {news.category}
                  </span>
                  <div className="flex items-center gap-1.5 text-gray-500 text-xs">
                    <MapPin size={12} className="text-accent-blue" />
                    {news.state || "National"}
                  </div>
                  <div className="flex items-center gap-1.5 text-gray-500 text-xs">
                    <Clock size={12} />
                    {formatDistanceToNow(new Date(news.created_at), { addSuffix: true })}
                  </div>
                  <div className="flex items-center gap-1.5 text-gray-500 text-xs">
                    <BookOpen size={12} />
                    {readingTime} min read
                  </div>
                </div>

                {/* Headline */}
                <h1 className="text-2xl md:text-3xl font-heading font-black text-white leading-tight">
                  {news.seo_title || news.headline}
                </h1>

                {/* Summary Box */}
                {news.summary && (
                  <div className="p-5 bg-accent-blue/5 border border-accent-blue/15 rounded-2xl">
                    <p className="text-[10px] font-black text-accent-blue uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
                      <span className="w-4 h-[2px] bg-accent-blue" />
                      Quick Summary
                    </p>
                    <p className="text-gray-300 leading-relaxed font-medium text-sm">
                      {news.summary}
                    </p>
                  </div>
                )}

                {/* Author */}
                <div className="flex items-center gap-3 py-5 border-y border-white/5">
                  <div className="w-10 h-10 rounded-full bg-accent-amber/10 overflow-hidden border border-white/10 flex items-center justify-center">
                    {news.author?.avatar_url ? (
                      <img src={news.author.avatar_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <Landmark size={18} className="text-accent-amber" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">
                      {news.author?.name === "RAJNEET System" ? "RAJNEET Editorial Desk" : (news.author?.name || "RAJNEET Editorial")}
                    </p>
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest font-black">
                      AI-Crafted Original Article
                    </p>
                  </div>
                  {news.seo_score > 0 && (
                    <div className="ml-auto flex items-center gap-2 px-3 py-1.5 bg-green-500/10 border border-green-500/20 rounded-xl">
                      <div className="w-2 h-2 rounded-full bg-green-500" />
                      <span className="text-[10px] font-black text-green-500 uppercase tracking-widest">SEO {news.seo_score}%</span>
                    </div>
                  )}
                </div>

                {/* Full Article Body */}
                {news.body ? (
                  <div
                    className="article-body prose prose-invert max-w-none 
                      prose-headings:font-heading prose-headings:font-black prose-headings:text-white prose-headings:uppercase prose-headings:tracking-tight
                      prose-h2:text-xl prose-h2:mt-8 prose-h2:mb-4 prose-h2:border-l-4 prose-h2:border-accent-blue prose-h2:pl-4
                      prose-p:text-gray-300 prose-p:leading-relaxed prose-p:text-base prose-p:mb-4
                      prose-strong:text-white prose-strong:font-black
                      prose-ul:text-gray-300 prose-ul:space-y-2
                      prose-li:marker:text-accent-blue"
                    dangerouslySetInnerHTML={{ __html: news.body }}
                  />
                ) : (
                  <p className="text-gray-400 text-base leading-relaxed">{news.summary}</p>
                )}

                {/* SEO Keywords */}
                {news.focus_keywords?.length > 0 && (
                  <div className="pt-4">
                    <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest mb-2">Related Topics</p>
                    <div className="flex flex-wrap gap-2">
                      {(news.focus_keywords as string[]).map((kw, i) => (
                        <span key={i} className="px-2.5 py-1 bg-white/[0.03] border border-white/5 rounded-lg text-[10px] text-gray-500 font-medium">
                          #{kw}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex flex-wrap gap-3 pt-6">
                  {news.source_url && (
                    <a
                      href={news.source_url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-2 px-5 py-2.5 bg-white/[0.03] hover:bg-white/[0.08] text-white text-sm font-bold rounded-xl border border-white/5 transition-all"
                    >
                      <ExternalLink size={16} className="text-accent-blue" />
                      Original Source
                    </a>
                  )}
                  <button
                    onClick={handleShare}
                    className="flex items-center gap-2 px-5 py-2.5 bg-white/[0.03] hover:bg-white/[0.08] text-white text-sm font-bold rounded-xl border border-white/5 transition-all"
                  >
                    <Share2 size={16} className="text-accent-amber" />
                    Share
                  </button>
                </div>

                {/* Debate Section */}
                <div className="mt-12 pt-12 border-t border-white/5">
                  <div className="flex items-center gap-3 mb-8">
                    <MessageSquare size={22} className="text-accent-blue" />
                    <h3 className="text-2xl font-heading font-black text-white uppercase tracking-tight">Citizen Debate</h3>
                  </div>
                  <DebateSection newsId={news.id} currentUser={currentUser} />
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
