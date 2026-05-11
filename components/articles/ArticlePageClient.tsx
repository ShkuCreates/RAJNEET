"use client";

import { Clock, Heart, MessageCircle, Share2, BadgeCheck } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface ArticlePageClientProps {
  article: {
    id: string;
    title: string;
    body: string;
    excerpt?: string;
    author_username: string;
    is_verified: boolean;
    is_featured: boolean;
    tags: string[];
    word_count: number;
    upvote_count: number;
    comment_count?: number;
    created_at: string;
  };
}

export default function ArticlePageClient({ article }: ArticlePageClientProps) {
  const readTime = Math.ceil(article.word_count / 200);

  return (
    <div className="min-h-screen bg-[#050A14]">
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-8">
          {article.is_featured && (
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 rounded-full bg-accent-amber animate-pulse" />
              <span className="text-[10px] font-black text-accent-amber uppercase tracking-widest">FEATURED</span>
            </div>
          )}

          {article.is_verified && (
            <div className="flex items-center gap-2 mb-4">
              <BadgeCheck size={14} className="text-accent-amber" />
              <span className="text-[10px] font-black text-accent-amber uppercase tracking-widest">VERIFIED</span>
            </div>
          )}

          <h1 className="text-3xl md:text-4xl font-serif font-bold text-white leading-tight mb-4">
            {article.title}
          </h1>

          <div className="flex items-center gap-4 text-gray-500">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-accent-blue/20 flex items-center justify-center text-accent-blue text-xs font-bold">
                {article.author_username?.charAt(0).toUpperCase()}
              </div>
              <span className="text-sm font-semibold">@{article.author_username}</span>
            </div>
            <span className="text-sm">•</span>
            <div className="flex items-center gap-1">
              <Clock size={14} />
              <span className="text-sm">{readTime} min read</span>
            </div>
            <span className="text-sm">•</span>
            <span className="text-sm">{formatDistanceToNow(new Date(article.created_at), { addSuffix: true })}</span>
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-8">
          {article.tags.map((tag, i) => (
            <span
              key={i}
              className="px-3 py-1 bg-accent-blue/10 text-accent-blue text-xs font-semibold rounded-full"
            >
              #{tag}
            </span>
          ))}
        </div>

        {/* Article Body */}
        <div className="prose prose-invert max-w-none mb-12">
          {article.body.split('\n\n').map((paragraph, index) => (
            <p key={index} className="text-gray-300 leading-relaxed mb-4">
              {paragraph}
            </p>
          ))}
        </div>

        {/* Engagement Bar */}
        <div className="flex items-center justify-between py-6 border-t border-white/10">
          <div className="flex items-center gap-6">
            <button className="flex items-center gap-2 text-gray-400 hover:text-red-500 transition-colors">
              <Heart size={20} />
              <span className="text-sm font-semibold">{article.upvote_count}</span>
            </button>
            <div className="flex items-center gap-2 text-gray-400">
              <MessageCircle size={20} />
              <span className="text-sm font-semibold">{article.comment_count || 0}</span>
            </div>
          </div>
          <button className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
            <Share2 size={20} />
            <span className="text-sm font-semibold">Share</span>
          </button>
        </div>
      </div>
    </div>
  );
}
