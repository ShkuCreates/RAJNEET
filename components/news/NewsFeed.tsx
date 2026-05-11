"use client";

import { useEffect, useState } from "react";
import NewsCard from "./NewsCard";
import { SkeletonCard } from "../dashboard/SkeletonCard";
import { Newspaper, Bell } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export default function NewsFeed({ initialNews, currentUser }: { initialNews: any[], currentUser: any }) {
  const [newsList, setNewsList] = useState(initialNews);
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState("28:45");

  useEffect(() => {
    // Real-time subscription
    const channel = supabase
      .channel("public:news")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "news", filter: "status=eq.PUBLISHED" },
        (payload) => {
          console.log("New article received:", payload);
          setNewsList(prev => [payload.new, ...prev]);
          toast("New article added to your feed!", {
            icon: <Bell className="text-accent-blue" size={16} />,
            description: payload.new.headline,
            action: {
              label: "View",
              onClick: () => window.scrollTo({ top: 0, behavior: "smooth" })
            }
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    // Dummy countdown logic for the UI
    const timer = setInterval(() => {
      setCountdown(prev => {
        const [m, s] = prev.split(":").map(Number);
        if (s > 0) return `${m}:${(s-1).toString().padStart(2, "0")}`;
        if (m > 0) return `${m-1}:59`;
        return "30:00";
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

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
        className="flex flex-col items-center justify-center p-16 text-center bg-[#111827]/40 border border-white/5 rounded-[32px] mt-8"
      >
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-accent-blue/20 blur-[50px] rounded-full" />
          <div className="relative w-24 h-24 bg-accent-blue/10 rounded-3xl flex items-center justify-center border border-accent-blue/20 animate-float">
            <Newspaper size={48} className="text-accent-blue" />
          </div>
        </div>
        
        <h2 className="text-2xl font-heading font-bold text-white mb-3">No news yet for this filter</h2>
        <p className="text-gray-400 max-w-sm mb-10 leading-relaxed">
          Our system fetches new articles every 30 minutes. Check back soon for the latest updates.
        </p>

        <div className="flex flex-col items-center gap-3">
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Next fetch in</p>
          <div className="px-6 py-3 bg-white/[0.03] border border-white/10 rounded-2xl">
            <span className="text-2xl font-mono font-black text-accent-blue tabular-nums">
              {countdown}
            </span>
          </div>
          {/* Animated loader bar */}
          <div className="w-48 h-1 bg-white/5 rounded-full overflow-hidden mt-4">
            <motion.div 
              className="h-full bg-accent-blue shadow-[0_0_8px_rgba(59,130,246,0.5)]"
              animate={{ width: ["0%", "100%"] }}
              transition={{ duration: 1800, repeat: Infinity, ease: "linear" }}
            />
          </div>
        </div>
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
