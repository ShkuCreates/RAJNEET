"use client";

import { useState, useEffect } from "react";
import { Trophy, TrendingUp, Calendar } from "lucide-react";

export function OpinionOfTheDay() {
  const [opinion, setOpinion] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock API call to get opinion of the day
    setTimeout(() => {
      setOpinion({
        id: "1",
        content: "India's economic growth is impressive, but we must ensure inclusive development that benefits all sections of society. The focus should be on sustainable infrastructure, education, and healthcare alongside GDP growth.",
        username: "economic_visionary",
        user_reputation: 2850,
        user_tier: "Political Analyst",
        stance: "NEUTRAL",
        created_at: new Date(Date.now() - 2 * 60 * 60 * 1000),
        upvotes: 234,
        insightful_votes: 89,
        biased_votes: 12,
        misleading_votes: 3,
        hashtags: ["Economy2024", "InclusiveGrowth"],
        news_context: {
          headline: "India's GDP grows 7.8% in Q2, fastest in 2 years",
          category: "Economy",
          url: "/news/gdp-growth-q2",
        },
      });
      setLoading(false);
    }, 1000);
  }, []);

  if (loading) {
    return (
      <div className="p-6 bg-white/[0.03] border border-white/10 rounded-xl">
        <div className="flex items-center gap-3">
          <Trophy className="text-yellow-500 animate-pulse" size={20} />
          <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Opinion of the Day</h3>
        </div>
        <div className="text-center py-8">
          <div className="inline-flex items-center gap-2 text-sm text-gray-400">
            <Calendar size={14} />
            <span>Loading today's featured opinion...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!opinion) {
    return (
      <div className="p-6 bg-white/[0.03] border border-white/10 rounded-xl">
        <div className="flex items-center gap-3 mb-4">
          <Trophy className="text-yellow-500" size={20} />
          <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Opinion of the Day</h3>
        </div>
        <div className="text-center py-8">
          <p className="text-gray-400">No opinion selected for today</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white/[0.03] border border-white/10 rounded-xl">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Trophy className="text-yellow-500" size={20} />
          <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Opinion of the Day</h3>
        </div>
        <div className="text-[10px] text-gray-500">
          {new Date().toLocaleDateString("en-IN")}
        </div>
      </div>

      {/* Opinion Content */}
      <div className="p-4 bg-white/[0.02] rounded-xl border border-white/5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-accent-blue/20 flex items-center justify-center text-accent-blue text-[10px] font-bold">
              {opinion.username.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-semibold text-white">@{opinion.username}</p>
              <div className="flex items-center gap-2 text-sm">
                <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                  opinion.user_tier === "RAJNEET Legend" ? "bg-gradient-to-r from-purple-500 to-pink-500" :
                  opinion.user_tier === "Political Analyst" ? "bg-purple-500" :
                  opinion.user_tier === "Community Leader" ? "bg-yellow-500" :
                  opinion.user_tier === "Voice of the People" ? "bg-green-500" :
                  opinion.user_tier === "Active Citizen" ? "bg-blue-500" :
                  "bg-gray-500"
                } text-white`}>
                  {opinion.user_tier}
                </span>
                <span className="text-accent-amber font-bold">{opinion.user_reputation} pts</span>
              </div>
            </div>
          </div>
          <div className="text-xs text-gray-500">
            {new Date(opinion.created_at).toLocaleTimeString()}
          </div>
        </div>

        <p className="text-gray-300 leading-relaxed mb-4">{opinion.content}</p>

        {/* Hashtags */}
        <div className="flex flex-wrap gap-2 mb-4">
          {opinion.hashtags.map((tag: string) => (
            <span key={tag} className="px-3 py-1 bg-accent-blue/10 text-accent-blue text-xs font-semibold rounded-full">
              #{tag}
            </span>
          ))}
        </div>

        {/* News Context */}
        {opinion.news_context && (
          <div className="p-3 bg-accent-amber/5 border border-accent-amber/10 rounded-lg">
            <p className="text-xs font-semibold text-accent-amber mb-1">In response to:</p>
            <a
              href={opinion.news_context.url}
              className="text-sm text-white hover:text-accent-amber/80 transition-colors"
            >
              {opinion.news_context.headline}
            </a>
          </div>
        )}

        {/* Voting Stats */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="p-3 bg-white/[0.02] rounded-lg">
            <div className="flex items-center justify-center gap-2 text-green-500 mb-1">
              <TrendingUp size={16} />
              <span className="text-sm font-semibold">Insightful</span>
            </div>
            <p className="text-2xl font-bold text-white">{opinion.insightful_votes}</p>
          </div>
          <div className="p-3 bg-white/[0.02] rounded-lg">
            <div className="flex items-center justify-center gap-2 text-yellow-500 mb-1">
              <div className="w-2 h-2 rounded-full bg-yellow-500" />
              <span className="text-sm font-semibold">Biased</span>
            </div>
            <p className="text-2xl font-bold text-white">{opinion.biased_votes}</p>
          </div>
          <div className="p-3 bg-white/[0.02] rounded-lg">
            <div className="flex items-center justify-center gap-2 text-red-500 mb-1">
              <div className="w-2 h-2 rounded-full bg-red-500" />
              <span className="text-sm font-semibold">Misleading</span>
            </div>
            <p className="text-2xl font-bold text-white">{opinion.misleading_votes}</p>
          </div>
        </div>

        {/* Total Upvotes */}
        <div className="mt-4 pt-4 border-t border-white/5">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">Total Community Response</span>
            <div className="flex items-center gap-2">
              <TrendingUp size={14} className="text-accent-amber" />
              <span className="text-lg font-bold text-accent-amber">{opinion.upvotes}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
