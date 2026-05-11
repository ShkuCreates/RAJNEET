"use client";

import NewsCard from "./NewsCard";
import { motion, AnimatePresence } from "framer-motion";
import AdBanner from "@/components/ads/AdBanner";

export default function NewsFeed({ initialNews, currentUser }: { initialNews: any[], currentUser: any }) {
  const newsList = initialNews;

  // Insert ad every 4 cards (after index 3, 7, 11...)
  const AD_SLOT = "3892741056"; // Replace with your actual AdSense ad slot ID
  const feedItems: React.ReactNode[] = [];

  newsList.forEach((news, index) => {
    feedItems.push(
      <motion.div
        key={news.id}
        initial={{ opacity: 0, y: 15, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ 
          delay: index * 0.05, 
          duration: 0.6,
          ease: "easeOut"
        }}
      >
        <NewsCard news={news} currentUser={currentUser} />
      </motion.div>
    );

    // Insert a full-width ad after every 4th card
    if ((index + 1) % 4 === 0 && index < newsList.length - 1) {
      feedItems.push(
        <div key={`ad-${index}`} className="col-span-1 my-2 md:col-span-2 xl:col-span-3">
          <div className="relative rounded-2xl overflow-hidden border border-white/5 bg-white/[0.02]">
            <span className="absolute top-2 left-3 text-[9px] font-black text-gray-600 uppercase tracking-[0.3em] z-10">
              Advertisement
            </span>
            <AdBanner
              slot={AD_SLOT}
              format="horizontal"
              className="min-h-[90px] pt-6"
            />
          </div>
        </div>
      );
    }
    
    // Add empty divs to maintain grid alignment after ads
    if ((index + 1) % 4 === 0 && index < newsList.length - 1) {
      feedItems.push(
        <div key={`spacer-after-ad-${index}`} className="col-span-1 my-2 md:col-span-2 xl:col-span-3 h-0" />
      );
    }
  });

  return (
    <div className="grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-3">
      <AnimatePresence mode="popLayout">
        {feedItems}
      </AnimatePresence>
    </div>
  );
}
