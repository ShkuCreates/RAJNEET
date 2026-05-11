"use client";

import { TrendingUp, Hash } from "lucide-react";

interface TrendingHashtagsProps {
  onHashtagClick?: (hashtag: string) => void;
}

export function TrendingHashtags({ onHashtagClick }: TrendingHashtagsProps) {
  const hashtags = [
    { tag: "Economy2024", count: 1234 },
    { tag: "DigitalPrivacy", count: 987 },
    { tag: "AgriculturalReforms", count: 756 },
    { tag: "EducationPolicy", count: 643 },
    { tag: "ClimateAction", count: 512 },
  ];

  return (
    <div className="p-6 bg-white/[0.03] border border-white/10 rounded-xl">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp size={16} className="text-accent-amber" />
        <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Trending Hashtags</h3>
      </div>
      
      <div className="flex flex-wrap gap-2">
        {hashtags.map((hashtag) => (
          <button
            key={hashtag.tag}
            onClick={() => onHashtagClick?.(hashtag.tag)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-accent-blue/10 hover:bg-accent-blue/20 text-accent-blue text-xs font-semibold rounded-full transition-colors"
          >
            <Hash size={12} />
            <span>#{hashtag.tag}</span>
            <span className="text-[10px] text-accent-blue/70">{hashtag.count}</span>
          </button>
        ))}
      </div>
      
      <p className="text-[9px] text-gray-500 mt-3">Updates hourly</p>
    </div>
  );
}
