"use client";

import { useState } from "react";
import { MessageSquare, Share2, MapPin, Eye, ArrowRight } from "lucide-react";
import { formatDistanceToNow, differenceInHours } from "date-fns";
import { motion } from "framer-motion";
import { ArticlePanel } from "../dashboard/ArticlePanel";

const categoryColors: Record<string, string> = {
  POLITICAL: "bg-accent-blue",
  CRIMINAL: "bg-red-500",
  FINANCE: "bg-green-500",
  INFRASTRUCTURE: "bg-accent-amber",
  ENVIRONMENT: "bg-emerald-500",
  TECHNOLOGY: "bg-purple-500",
  HEALTH: "bg-rose-500",
  OTHER: "bg-gray-500"
};

export default function NewsCard({ news, currentUser }: { news: any, currentUser: any }) {
  const [showPanel, setShowPanel] = useState(false);
  
  const categoryColor = categoryColors[news.category.toUpperCase()] || "bg-gray-500";
  const isNew = differenceInHours(new Date(), new Date(news.created_at)) < 2;

  // Dummy percentages for stance bar
  const stanceData = { for: 45, against: 35, neutral: 20 };

  return (
    <>
      <motion.article 
        whileHover={{ y: -6 }}
        className="group relative bg-[#111827] border border-white/5 rounded-3xl overflow-hidden shadow-2xl transition-all duration-300 hover:border-accent-blue/30 hover:shadow-accent-blue/5"
      >
        {/* Category Color Bar */}
        <div className={`absolute left-0 top-0 bottom-0 w-1 ${categoryColor} opacity-70`} />
        
        {/* Cover Image */}
        {news.cover_image_url && (
          <div className="relative aspect-video overflow-hidden">
            <img 
              src={news.cover_image_url} 
              alt={news.headline}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              onError={(e) => {
                e.currentTarget.src = "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&q=80&w=1000";
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
                  <span className="text-[9px] font-black text-white uppercase tracking-widest">NEW</span>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center gap-1 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
              <MapPin size={12} className="text-accent-blue" />
              {news.state || "National"}
            </div>
            <div className="w-1 h-1 rounded-full bg-white/10" />
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
              {formatDistanceToNow(new Date(news.created_at), { addSuffix: true })}
            </span>
          </div>

          <h2 className="text-xl md:text-2xl font-heading font-black text-white leading-tight mb-4 group-hover:text-accent-blue transition-colors line-clamp-2">
            {news.headline}
          </h2>

          <p className="text-sm text-gray-400 leading-relaxed line-clamp-2 mb-6">
            {news.summary}
          </p>

          {/* Stance Bar */}
          <div className="space-y-3 mb-6">
            <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-gray-500">
              <span className="text-green-500">For {stanceData.for}%</span>
              <span>Neutral {stanceData.neutral}%</span>
              <span className="text-red-500">Against {stanceData.against}%</span>
            </div>
            <div className="h-2 w-full flex rounded-full overflow-hidden bg-white/5 border border-white/5">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${stanceData.for}%` }}
                className="bg-green-500/60"
              />
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${stanceData.neutral}%` }}
                className="bg-gray-500/60"
              />
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${stanceData.against}%` }}
                className="bg-red-500/60"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-6 border-t border-white/5">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5 text-gray-500">
                <MessageSquare size={14} />
                <span className="text-[11px] font-black">{news._count?.opinions || 0}</span>
              </div>
              <div className="flex items-center gap-1.5 text-gray-500">
                <Eye size={14} />
                <span className="text-[11px] font-black">1.2K</span>
              </div>
            </div>

            <button 
              onClick={() => setShowPanel(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-accent-blue/10 hover:bg-accent-blue text-accent-blue hover:text-white text-[11px] font-black uppercase tracking-widest rounded-xl transition-all group/btn shadow-lg hover:shadow-accent-blue/20"
            >
              Debate 
              <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </motion.article>

      <ArticlePanel 
        news={news} 
        isOpen={showPanel} 
        onClose={() => setShowPanel(false)} 
        currentUser={currentUser}
      />
    </>
  );
}
