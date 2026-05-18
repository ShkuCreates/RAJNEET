"use client";

import { useState } from "react";
import { Share2, User, Users, ThumbsUp, Timer } from "lucide-react";

export default function DebateRoomPage({ params }: { params: { id: string } }) {
  const [votedFor, setVotedFor] = useState<boolean | null>(null);
  const [votesFor, setVotesFor] = useState(124);
  const [votesAgainst, setVotesAgainst] = useState(89);
  const [audienceCount, setAudienceCount] = useState(456);
  const [timeRemaining, setTimeRemaining] = useState("42:15");

  const mockDebate = {
    id: params.id,
    topic: "Should India implement universal basic income?",
    description: "Discuss the economic and social implications of UBI in the Indian context.",
  };

  const handleVoteFor = () => {
    if (votedFor === true) return;
    if (votedFor === false) {
      setVotesAgainst(v => v - 1);
    }
    setVotesFor(v => v + 1);
    setVotedFor(true);
  };

  const handleVoteAgainst = () => {
    if (votedFor === false) return;
    if (votedFor === true) {
      setVotesFor(v => v - 1);
    }
    setVotesAgainst(v => v + 1);
    setVotedFor(false);
  };

  return (
    <div className="min-h-screen bg-[#050A14] text-white">
      {/* Top Bar */}
      <div className="border-b border-white/10 bg-[#050A14]/95 backdrop-blur-sm p-4 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all">
            <Share2 size={18} className="text-gray-400" />
            <span className="text-sm font-semibold text-gray-300">Share</span>
          </button>

          <div className="flex-1 px-4">
            <h1 className="text-center text-lg md:text-xl font-bold text-white truncate">
              {mockDebate.topic}
            </h1>
          </div>

          <button className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all">
            <User size={18} className="text-gray-400" />
            <span className="text-sm font-semibold text-gray-300">Profile</span>
          </button>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="border-b border-white/10 bg-[#111827] p-4">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-center gap-6 md:gap-12">
          <div className="flex items-center gap-2">
            <Users size={18} className="text-accent-blue" />
            <span className="text-sm md:text-base font-semibold text-white">
              {audienceCount} <span className="text-gray-400">Audience</span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Timer size={18} className="text-accent-red" />
            <span className="text-sm md:text-base font-mono font-bold text-white">
              {timeRemaining}
            </span>
          </div>
        </div>
      </div>

      {/* Main Debate Stage */}
      <div className="p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] gap-4 md:gap-8 items-stretch">
            {/* AGAINST Side */}
            <div className="flex flex-col gap-4">
              <div className="text-center mb-2">
                <h2 className="text-2xl md:text-3xl font-bold text-red-500">Against</h2>
              </div>
              
              <div className="flex-1 bg-[#111827] border-2 border-red-500/30 rounded-2xl p-4 md:p-8 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-24 h-24 md:w-32 md:h-32 mx-auto mb-4 rounded-full bg-white/10 border border-white/20 flex items-center justify-center">
                    <Users size={48} className="text-gray-500" />
                  </div>
                  <p className="text-gray-400 text-sm md:text-base">Participants Section</p>
                </div>
              </div>

              <button
                onClick={handleVoteAgainst}
                disabled={votedFor === false}
                className={`w-full py-4 md:py-6 rounded-2xl font-bold text-lg md:text-xl transition-all ${
                  votedFor === false
                    ? "bg-red-500 text-white"
                    : "bg-white/5 border border-white/10 hover:bg-white/10 text-gray-300 hover:text-white"
                }`}
              >
                <span className="flex items-center justify-center gap-2">
                  <ThumbsUp size={20} />
                  Vote Against ({votesAgainst})
                </span>
              </button>
            </div>

            {/* HOST Center */}
            <div className="flex flex-col justify-center">
              <div className="text-center mb-2">
                <h2 className="text-xl md:text-2xl font-bold text-accent-blue">Host</h2>
              </div>
              
              <div className="bg-[#111827] border-2 border-accent-blue/30 rounded-2xl p-4 md:p-6 flex items-center justify-center min-h-[200px] md:min-h-[300px]">
                <div className="text-center">
                  <div className="w-16 h-16 md:w-24 md:h-24 mx-auto mb-4 rounded-full bg-accent-blue/10 border border-accent-blue/30 flex items-center justify-center">
                    <User size={32} className="text-accent-blue" />
                  </div>
                  <p className="text-gray-400 text-sm">Host Section</p>
                </div>
              </div>
            </div>

            {/* FOR Side */}
            <div className="flex flex-col gap-4">
              <div className="text-center mb-2">
                <h2 className="text-2xl md:text-3xl font-bold text-green-500">For</h2>
              </div>
              
              <div className="flex-1 bg-[#111827] border-2 border-green-500/30 rounded-2xl p-4 md:p-8 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-24 h-24 md:w-32 md:h-32 mx-auto mb-4 rounded-full bg-white/10 border border-white/20 flex items-center justify-center">
                    <Users size={48} className="text-gray-500" />
                  </div>
                  <p className="text-gray-400 text-sm md:text-base">Participants Section</p>
                </div>
              </div>

              <button
                onClick={handleVoteFor}
                disabled={votedFor === true}
                className={`w-full py-4 md:py-6 rounded-2xl font-bold text-lg md:text-xl transition-all ${
                  votedFor === true
                    ? "bg-green-500 text-white"
                    : "bg-white/5 border border-white/10 hover:bg-white/10 text-gray-300 hover:text-white"
                }`}
              >
                <span className="flex items-center justify-center gap-2">
                  <ThumbsUp size={20} />
                  Vote For ({votesFor})
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
