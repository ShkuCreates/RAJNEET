"use client";

import { Trophy, TrendingUp, Flame, Award } from "lucide-react";

export default function DebateLeaderboardPage() {
  return (
    <div className="min-h-screen bg-[#050A14] py-12 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Debate Leaderboard</h1>
          <p className="text-gray-400">Top debaters this month</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Top 10 by Wins */}
          <div className="lg:col-span-2 p-6 bg-white/[0.03] border border-white/10 rounded-2xl">
            <div className="flex items-center gap-2 mb-6">
              <Trophy className="text-yellow-500" size={24} />
              <h2 className="text-xl font-bold text-white">Top 10 by Wins</h2>
            </div>
            <div className="space-y-3">
              {[
                { rank: 1, username: "debate_master", wins: 15, reputation: 2450 },
                { rank: 2, username: "political_wiz", wins: 12, reputation: 2100 },
                { rank: 3, username: "logic_king", wins: 10, reputation: 1850 },
                { rank: 4, username: "policy_expert", wins: 9, reputation: 1700 },
                { rank: 5, username: "civic_mind", wins: 8, reputation: 1550 },
                { rank: 6, username: "fact_checker", wins: 7, reputation: 1400 },
                { rank: 7, username: "debate_pro", wins: 6, reputation: 1250 },
                { rank: 8, username: "argument_king", wins: 5, reputation: 1100 },
                { rank: 9, username: "logic_master", wins: 5, reputation: 950 },
                { rank: 10, username: "debate_ninja", wins: 4, reputation: 800 },
              ].map((debater) => (
                <div key={debater.rank} className="flex items-center gap-4 p-4 bg-white/[0.02] rounded-xl">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                    debater.rank === 1 ? "bg-yellow-500 text-black" :
                    debater.rank === 2 ? "bg-gray-400 text-black" :
                    debater.rank === 3 ? "bg-amber-700 text-black" :
                    "bg-white/5 text-gray-400"
                  }`}>
                    {debater.rank}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-white">@{debater.username}</p>
                    <p className="text-sm text-gray-500">{debater.reputation} reputation</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-accent-blue">{debater.wins}</p>
                    <p className="text-xs text-gray-500">wins</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Side Panel */}
          <div className="space-y-6">
            {/* Top by Reputation */}
            <div className="p-6 bg-white/[0.03] border border-white/10 rounded-2xl">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="text-accent-blue" size={20} />
                <h3 className="text-lg font-bold text-white">Top by Reputation</h3>
              </div>
              <div className="space-y-3">
                {[
                  { username: "debate_master", score: 3450 },
                  { username: "political_wiz", score: 3100 },
                  { username: "logic_king", score: 2850 },
                ].map((user, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-white">@{user.username}</span>
                    <span className="font-bold text-accent-amber">{user.score}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Most Active */}
            <div className="p-6 bg-white/[0.03] border border-white/10 rounded-2xl">
              <div className="flex items-center gap-2 mb-4">
                <Flame className="text-red-500" size={20} />
                <h3 className="text-lg font-bold text-white">Most Active This Month</h3>
              </div>
              <div className="p-4 bg-accent-blue/5 border border-accent-blue/10 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-accent-blue/20 flex items-center justify-center text-accent-blue font-bold">
                    DM
                  </div>
                  <div>
                    <p className="font-semibold text-white">@debate_master</p>
                    <p className="text-sm text-gray-400">23 debates participated</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Monthly Reset Info */}
            <div className="p-6 bg-accent-amber/5 border border-accent-amber/10 rounded-2xl">
              <div className="flex items-center gap-2 mb-2">
                <Award className="text-accent-amber" size={20} />
                <h3 className="text-lg font-bold text-accent-amber">Monthly Reset</h3>
              </div>
              <p className="text-sm text-gray-400">
                Leaderboard resets on the 1st of every month. Previous month results are archived.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
