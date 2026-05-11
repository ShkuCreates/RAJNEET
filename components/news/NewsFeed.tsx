"use client";

import { useEffect, useState } from "react";
import NewsCard from "./NewsCard";
import { SkeletonCard } from "../dashboard/SkeletonCard";
import { Newspaper } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function NewsFeed({ initialNews, currentUser }: { initialNews: any[], currentUser: any }) {
  const [newsList, setNewsList] = useState(initialNews);
  const [loading, setLoading] = useState(false);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => <SkeletonCard key={i} />)}
      </div>
    );
  }

  if (newsList.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center py-20 text-center"
      >
        <div className="w-20 h-20 bg-accent-blue/5 rounded-3xl flex items-center justify-center border border-accent-blue/10 mb-6">
          <Newspaper size={40} className="text-accent-blue/40" />
        </div>
        <h2 className="text-xl font-heading font-bold text-white mb-2">Feed is currently cooling down</h2>
        <p className="text-gray-500 max-w-xs text-sm leading-relaxed">
          The latest political insights are being processed by the AI engine. 
          New articles will appear here automatically.
        </p>
        
        {currentUser?.role === "ADMIN" && (
          <a 
            href="/admin/automation-logs"
            className="mt-8 px-6 py-2 bg-accent-blue/10 text-accent-blue border border-accent-blue/20 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-accent-blue hover:text-white transition-all"
          >
            Start Fetching Engine
          </a>
        )}
      </motion.div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <AnimatePresence mode="popLayout">
        {newsList.map((news, index) => (
          <motion.div
            key={news.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <NewsCard news={news} currentUser={currentUser} />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
