"use client";

import { motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import { Clock, ArrowRight, Heart, MessageCircle, Share2, BadgeCheck } from "lucide-react";

interface ArticleCardProps {
  article: {
    id: string;
    title: string;
    excerpt?: string;
    author_username: string;
    author_avatar?: string;
    is_verified: boolean;
    is_featured: boolean;
    status: string;
    tags: string[];
    word_count: number;
    upvote_count: number;
    comment_count?: number;
    created_at: string;
  };
  currentUser?: any;
}

export function ArticleCard({ article, currentUser }: ArticleCardProps) {
  const readTime = Math.ceil(article.word_count / 200); // Average reading speed

  return (
    <motion.article
      whileHover={{ y: -2 }}
      className={`group relative bg-[#111827] border rounded-xl overflow-hidden transition-all duration-300 hover:border-accent-blue/30 cursor-pointer ${
        article.is_featured ? "border-accent-amber/30 shadow-lg shadow-accent-amber/5" : "border-white/5"
      }`}
    >
      {/* Featured Badge */}
      {article.is_featured && (
        <div className="absolute top-3 right-3 z-10">
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-accent-amber/20 border border-accent-amber/30 rounded-full">
            <div className="w-1.5 h-1.5 rounded-full bg-accent-amber animate-pulse" />
            <span className="text-[9px] font-black text-accent-amber uppercase tracking-widest">FEATURED</span>
          </div>
        </div>
      )}

      {/* Status Badge */}
      <div className="absolute top-3 left-3 z-10">
        {article.is_verified ? (
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-accent-amber/20 border border-accent-amber/30 rounded-full">
            <BadgeCheck size={10} className="text-accent-amber" />
            <span className="text-[9px] font-black text-accent-amber uppercase tracking-widest">VERIFIED</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-accent-blue/20 border border-accent-blue/30 rounded-full">
            <span className="text-[9px] font-black text-accent-blue uppercase tracking-widest">COMMUNITY</span>
          </div>
        )}
      </div>

      <div className="p-5">
        {/* Title */}
        <h3 className="text-lg md:text-xl font-serif font-bold text-white leading-tight mb-3 line-clamp-2 group-hover:text-accent-blue transition-colors">
          {article.title}
        </h3>

        {/* Author Row */}
        <div className="flex items-center gap-2 mb-3">
          <div className="w-6 h-6 rounded-full bg-accent-blue/20 flex items-center justify-center text-accent-blue text-[10px] font-bold">
            {article.author_username?.charAt(0).toUpperCase()}
          </div>
          <span className="text-[11px] font-bold text-gray-400">@{article.author_username}</span>
          <span className="text-[9px] text-gray-600">•</span>
          <span className="text-[9px] text-gray-500">{formatDistanceToNow(new Date(article.created_at), { addSuffix: true })}</span>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-3">
          {article.tags.slice(0, 3).map((tag, i) => (
            <span
              key={i}
              className="px-2 py-0.5 bg-accent-blue/10 text-accent-blue text-[10px] font-semibold rounded-full"
            >
              #{tag}
            </span>
          ))}
        </div>

        {/* Excerpt */}
        <p className="text-sm text-gray-400 leading-relaxed line-clamp-3 mb-4">
          {article.excerpt || "Read the full article for more details..."}
        </p>

        {/* Bottom Row */}
        <div className="flex items-center justify-between pt-3 border-t border-white/5">
          <div className="flex items-center gap-4 text-gray-500">
            <div className="flex items-center gap-1.5">
              <Clock size={12} />
              <span className="text-[10px] font-semibold">{readTime} min read</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Heart size={12} />
              <span className="text-[10px] font-semibold">{article.upvote_count}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <MessageCircle size={12} />
              <span className="text-[10px] font-semibold">{article.comment_count || 0}</span>
            </div>
          </div>

          <button className="flex items-center gap-1.5 text-accent-blue hover:text-accent-blue/80 transition-colors group-hover:translate-x-1 duration-200">
            <span className="text-[10px] font-bold uppercase tracking-widest">Read</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </motion.article>
  );
}
