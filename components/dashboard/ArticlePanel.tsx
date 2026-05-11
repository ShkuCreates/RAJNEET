"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, ExternalLink, Share2, MessageSquare, Landmark } from "lucide-react";
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
            {/* Header Sticky */}
            <div className="sticky top-0 z-10 bg-[#050A14]/80 backdrop-blur-xl border-b border-white/5 p-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-accent-blue/10 rounded-full flex items-center justify-center text-accent-blue">
                  <Landmark size={20} />
                </div>
                <div>
                  <h4 className="text-sm font-heading font-bold text-white uppercase tracking-wider">Article Insights</h4>
                  <p className="text-[10px] text-gray-500 font-mono uppercase tracking-widest">{news.category} • {news.state || "National"}</p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-3 hover:bg-white/5 rounded-full text-gray-400 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Content */}
            <div className="p-8">
              {news.cover_image_url && (
                <div className="relative aspect-video rounded-3xl overflow-hidden mb-8 border border-white/5 shadow-2xl">
                  <img 
                    src={news.cover_image_url} 
                    alt="" 
                    className="w-full h-full object-cover" 
                    onError={(e) => {
                      e.currentTarget.src = "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&q=80&w=1000";
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#050A14] via-transparent to-transparent opacity-60" />
                </div>
              )}

              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 bg-accent-blue/10 text-accent-blue text-[10px] font-black rounded-full uppercase tracking-widest border border-accent-blue/20">
                    {news.category}
                  </span>
                  <span className="text-xs text-gray-500 font-medium">
                    {formatDistanceToNow(new Date(news.created_at), { addSuffix: true })}
                  </span>
                </div>

                <h1 className="text-3xl md:text-4xl font-heading font-black text-white leading-tight">
                  {news.headline}
                </h1>

                <div className="flex items-center gap-4 py-6 border-y border-white/5">
                  <div className="w-10 h-10 rounded-full bg-accent-blue/10 overflow-hidden border border-white/10">
                    {news.author?.avatar_url ? (
                      <img src={news.author.avatar_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-accent-blue font-bold">
                        {news.author?.name?.charAt(0) || "A"}
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">{news.author?.name}</p>
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest font-black">{news.author?.role}</p>
                  </div>
                </div>

                <div className="prose prose-invert max-w-none prose-p:text-gray-300 prose-p:leading-relaxed prose-p:text-lg">
                  <div dangerouslySetInnerHTML={{ __html: news.body }} />
                </div>

                <div className="flex flex-wrap gap-4 pt-10">
                  {news.source_url && (
                    <a 
                      href={news.source_url} 
                      target="_blank" 
                      rel="noreferrer"
                      className="flex items-center gap-2 px-6 py-3 bg-white/[0.03] hover:bg-white/[0.08] text-white text-sm font-bold rounded-2xl border border-white/5 transition-all group"
                    >
                      <ExternalLink size={18} className="text-accent-blue group-hover:scale-110 transition-transform" />
                      Read Original Source
                    </a>
                  )}
                  <button className="flex items-center gap-2 px-6 py-3 bg-white/[0.03] hover:bg-white/[0.08] text-white text-sm font-bold rounded-2xl border border-white/5 transition-all group">
                    <Share2 size={18} className="text-accent-amber group-hover:scale-110 transition-transform" />
                    Share Article
                  </button>
                </div>

                {/* Debate Section */}
                <div className="mt-16 pt-16 border-t border-white/5">
                  <div className="flex items-center gap-3 mb-8">
                    <MessageSquare size={24} className="text-accent-blue" />
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
