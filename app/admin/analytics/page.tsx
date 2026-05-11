"use client";

import { useState, useEffect } from "react";
import { 
  Eye, Users, Heart, MessageSquare, BarChart2, TrendingUp, 
  Activity, Flame, Newspaper, ArrowUp, ArrowDown, Loader2, RefreshCw 
} from "lucide-react";
import { motion } from "framer-motion";

function StatCard({ icon: Icon, label, value, sub, color, delay = 0 }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="p-6 bg-[#111827] border border-white/5 rounded-[24px] shadow-xl flex flex-col gap-3"
    >
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}/10`}>
        <Icon size={20} className={`text-${color.replace("bg-", "")}`} />
      </div>
      <div>
        <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-1">{label}</p>
        <p className="text-3xl font-heading font-black text-white">{value?.toLocaleString() ?? "—"}</p>
        {sub && <p className="text-xs text-gray-500 mt-1">{sub}</p>}
      </div>
    </motion.div>
  );
}

export default function AdminAnalyticsPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/stats");
      const data = await res.json();
      if (!data.error) {
        setStats(data);
        setLastRefresh(new Date());
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    // Auto-refresh every 60 seconds
    const interval = setInterval(fetchStats, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[#050A14] p-8 md:p-12">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Activity className="text-accent-blue" size={24} />
              <h1 className="text-3xl font-heading font-black text-white uppercase tracking-tight">
                Real-Time Analytics
              </h1>
            </div>
            <p className="text-gray-500">
              Live stats · Last updated {lastRefresh.toLocaleTimeString()}
            </p>
          </div>

          <button
            onClick={fetchStats}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 text-white text-xs font-black uppercase tracking-widest rounded-xl border border-white/5 transition-all disabled:opacity-50"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>

        {loading && !stats ? (
          <div className="flex items-center justify-center py-32">
            <Loader2 className="text-accent-blue animate-spin" size={40} />
          </div>
        ) : stats ? (
          <>
            {/* Page Views Row */}
            <div className="mb-3">
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
                <Eye size={12} className="text-accent-blue" />
                Page Views
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard icon={Eye} label="Today" value={stats.views?.today} color="bg-accent-blue" delay={0} />
                <StatCard icon={TrendingUp} label="This Week" value={stats.views?.week} color="bg-purple-500" delay={0.05} />
                <StatCard icon={BarChart2} label="This Month" value={stats.views?.month} color="bg-accent-amber" delay={0.1} />
                <StatCard icon={Activity} label="All Time" value={stats.views?.total} color="bg-green-500" delay={0.15} />
              </div>
            </div>

            {/* Engagement Row */}
            <div className="mb-3 mt-10">
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
                <Heart size={12} className="text-red-500" />
                Engagement
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard icon={Newspaper} label="Articles" value={stats.articles} color="bg-accent-blue" delay={0.2} sub="Published" />
                <StatCard icon={Heart} label="Total Likes" value={stats.upvotes} color="bg-red-500" delay={0.25} />
                <StatCard icon={MessageSquare} label="Comments" value={stats.comments} color="bg-green-500" delay={0.3} />
                <StatCard icon={Users} label="Total Users" value={stats.users} color="bg-purple-500" delay={0.35} />
              </div>
            </div>

            {/* Top Articles This Week */}
            {stats.topArticles?.length > 0 && (
              <div className="mt-10">
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
                  <Flame size={12} className="text-accent-amber" />
                  Top Articles This Week
                </p>
                <div className="bg-[#111827] border border-white/5 rounded-[24px] overflow-hidden shadow-xl">
                  {stats.topArticles.map((article: any, i: number) => (
                    <div
                      key={article.id || i}
                      className="p-5 flex items-center justify-between gap-4 border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <span className="text-2xl font-heading font-black text-white/10">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <p className="text-sm font-bold text-gray-300 line-clamp-1">{article.headline}</p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Eye size={14} className="text-accent-blue" />
                        <span className="text-sm font-black text-white">{article.views?.toLocaleString()}</span>
                        <span className="text-[9px] text-gray-500 uppercase tracking-widest">views</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Polls & Votes */}
            <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-4">
              <StatCard icon={BarChart2} label="Opinion Polls" value={stats.polls} color="bg-accent-amber" sub="Total created" />
              <StatCard icon={Users} label="Poll Votes Cast" value={stats.votes} color="bg-green-500" sub="Total across all polls" />
            </div>
          </>
        ) : (
          <div className="text-center py-20 text-gray-500">
            Failed to load analytics. Make sure you are an Admin.
          </div>
        )}
      </div>
    </div>
  );
}
