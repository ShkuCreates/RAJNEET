"use client";

import { useState } from "react";
import { Heart, MessageCircle, Flag, Send, Lightbulb, AlertTriangle, AlertCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";

interface Opinion {
  id: string;
  username: string;
  reputation_score: number;
  stance: string;
  content: string;
  like_count: number;
  insightful_count: number;
  biased_count: number;
  misleading_count: number;
  hashtags: string[];
  created_at: string;
}

interface PublicOpinionSectionProps {
  newsId: string;
  currentUser?: any;
}

export function PublicOpinionSection({ newsId, currentUser }: PublicOpinionSectionProps) {
  const [opinions, setOpinions] = useState<Opinion[]>([]);
  const [stance, setStance] = useState<"FOR" | "AGAINST" | "NEUTRAL" | null>(null);
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stance || !content.trim() || !currentUser) {
      toast.error("Please select a stance and enter your opinion");
      return;
    }

    if (content.length > 280) {
      toast.error("Opinion must be 280 characters or less");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/opinions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newsId, stance, content }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Opinion shared!");
        setContent("");
        setStance(null);
        // Refresh opinions
      }
    } catch (error) {
      toast.error("Failed to share opinion");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCredibilityVote = async (opinionId: string, type: "insightful" | "biased" | "misleading") => {
    if (!currentUser) {
      toast.error("Login to vote");
      return;
    }
    try {
      const res = await fetch("/api/opinions/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ opinionId, type }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Vote recorded!");
      }
    } catch (error) {
      toast.error("Failed to vote");
    }
  };

  const getReputationTier = (score: number) => {
    if (score >= 5000) return "RAJNEET Legend";
    if (score >= 2500) return "Political Analyst";
    if (score >= 1000) return "Community Leader";
    if (score >= 500) return "Voice of the People";
    if (score >= 200) return "Active Citizen";
    return "Citizen";
  };

  const getReputationBadgeColor = (score: number) => {
    if (score >= 5000) return "bg-gradient-to-r from-purple-500 to-pink-500";
    if (score >= 2500) return "bg-purple-500";
    if (score >= 1000) return "bg-yellow-500";
    if (score >= 500) return "bg-green-500";
    if (score >= 200) return "bg-blue-500";
    return "bg-gray-500";
  };

  const getStanceColor = (stance: string) => {
    switch (stance) {
      case "FOR": return "bg-green-500/20 text-green-500 border-green-500/30";
      case "AGAINST": return "bg-red-500/20 text-red-500 border-red-500/30";
      case "NEUTRAL": return "bg-gray-500/20 text-gray-400 border-gray-500/30";
      default: return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  return (
    <div className="mt-12 border-t border-white/10 pt-8">
      <h2 className="text-2xl font-bold text-white mb-6">Public Opinion</h2>

      {/* Opinion Input */}
      {currentUser ? (
        <form onSubmit={handleSubmit} className="mb-8">
          <div className="flex gap-2 mb-4">
            <button
              type="button"
              onClick={() => setStance("FOR")}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                stance === "FOR"
                  ? "bg-green-500 text-white"
                  : "bg-white/5 text-gray-400 hover:bg-white/10"
              }`}
            >
              FOR
            </button>
            <button
              type="button"
              onClick={() => setStance("AGAINST")}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                stance === "AGAINST"
                  ? "bg-red-500 text-white"
                  : "bg-white/5 text-gray-400 hover:bg-white/10"
              }`}
            >
              AGAINST
            </button>
            <button
              type="button"
              onClick={() => setStance("NEUTRAL")}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                stance === "NEUTRAL"
                  ? "bg-gray-500 text-white"
                  : "bg-white/5 text-gray-400 hover:bg-white/10"
              }`}
            >
              NEUTRAL
            </button>
          </div>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Share your opinion on this..."
            maxLength={280}
            rows={3}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-accent-blue/50 resize-none"
          />
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-gray-500">{content.length}/280</span>
            <button
              type="submit"
              disabled={!stance || !content.trim() || isSubmitting}
              className="flex items-center gap-2 px-4 py-2 bg-accent-blue hover:bg-accent-blue/90 text-white text-sm font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send size={16} />
              {isSubmitting ? "Sharing..." : "Share Opinion"}
            </button>
          </div>
        </form>
      ) : (
        <div className="mb-8 p-4 bg-white/5 rounded-xl text-center">
          <p className="text-gray-400 text-sm">Login to share your opinion</p>
        </div>
      )}

      {/* Opinions Feed */}
      <div className="space-y-4">
        {opinions.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No opinions yet. Be the first to share!</p>
        ) : (
          opinions.map((opinion) => (
            <div key={opinion.id} className="p-4 bg-white/[0.03] border border-white/5 rounded-xl">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-accent-blue/20 flex items-center justify-center text-accent-blue text-sm font-bold shrink-0">
                  {opinion.username?.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-semibold text-white">@{opinion.username}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${getReputationBadgeColor(opinion.reputation_score)} text-white`}>
                      {getReputationTier(opinion.reputation_score)}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getStanceColor(opinion.stance)}`}>
                      {opinion.stance}
                    </span>
                    <span className="text-xs text-gray-500">
                      {formatDistanceToNow(new Date(opinion.created_at), { addSuffix: true })}
                    </span>
                  </div>
                  <p className="text-sm text-gray-300 mb-3">{opinion.content}</p>
                  {opinion.hashtags.length > 0 && (
                    <div className="flex gap-2 mb-3">
                      {opinion.hashtags.map((tag, i) => (
                        <span key={i} className="text-xs text-accent-blue">#{tag}</span>
                      ))}
                    </div>
                  )}
                  <div className="flex items-center gap-4">
                    <button className="flex items-center gap-1 text-gray-400 hover:text-red-500 transition-colors">
                      <Heart size={14} />
                      <span className="text-xs">{opinion.like_count}</span>
                    </button>
                    <button className="flex items-center gap-1 text-gray-400 hover:text-white transition-colors">
                      <MessageCircle size={14} />
                      <span className="text-xs">Reply</span>
                    </button>
                    <button className="flex items-center gap-1 text-gray-400 hover:text-white transition-colors">
                      <Flag size={14} />
                      <span className="text-xs">Report</span>
                    </button>
                    <div className="flex items-center gap-2 ml-auto">
                      <button
                        onClick={() => handleCredibilityVote(opinion.id, "insightful")}
                        className="flex items-center gap-1 px-2 py-1 text-xs text-gray-400 hover:text-green-500 transition-colors"
                      >
                        <Lightbulb size={12} />
                        Insightful ({opinion.insightful_count})
                      </button>
                      <button
                        onClick={() => handleCredibilityVote(opinion.id, "biased")}
                        className="flex items-center gap-1 px-2 py-1 text-xs text-gray-400 hover:text-yellow-500 transition-colors"
                      >
                        <AlertTriangle size={12} />
                        Biased ({opinion.biased_count})
                      </button>
                      <button
                        onClick={() => handleCredibilityVote(opinion.id, "misleading")}
                        className="flex items-center gap-1 px-2 py-1 text-xs text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <AlertCircle size={12} />
                        Misleading ({opinion.misleading_count})
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
