"use client";

import { useState } from "react";
import { Clock, Users, ThumbsUp, Send } from "lucide-react";

export default function DebateRoomPage({ params }: { params: { id: string } }) {
  const [selectedSide, setSelectedSide] = useState<"FOR" | "AGAINST" | null>(null);
  const [argument, setArgument] = useState("");
  const [forArguments, setForArguments] = useState<any[]>([]);
  const [againstArguments, setAgainstArguments] = useState<any[]>([]);

  const mockDebate = {
    id: params.id,
    topic: "Should India implement universal basic income?",
    description: "Discuss the economic and social implications of UBI in the Indian context.",
    timeRemaining: "45:23",
    participantCount: 24,
  };

  const handleSubmitArgument = () => {
    if (!selectedSide || !argument.trim()) return;
    const newArgument = {
      id: Date.now(),
      username: "You",
      content: argument,
      like_count: 0,
      created_at: new Date().toISOString(),
    };
    if (selectedSide === "FOR") {
      setForArguments([newArgument, ...forArguments]);
    } else {
      setAgainstArguments([newArgument, ...againstArguments]);
    }
    setArgument("");
  };

  return (
    <div className="min-h-screen bg-[#050A14] py-8 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 p-6 bg-white/[0.03] border border-white/10 rounded-xl">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl md:text-3xl font-bold text-white">{mockDebate.topic}</h1>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-accent-red">
                <Clock size={16} />
                <span className="font-mono font-bold">{mockDebate.timeRemaining}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-400">
                <Users size={16} />
                <span>{mockDebate.participantCount}</span>
              </div>
            </div>
          </div>
          <p className="text-gray-400">{mockDebate.description}</p>
        </div>

        {/* Side Selection */}
        {!selectedSide && (
          <div className="mb-8 p-6 bg-white/[0.03] border border-white/10 rounded-xl">
            <h2 className="text-xl font-bold text-white mb-4 text-center">Choose Your Side</h2>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => setSelectedSide("FOR")}
                className="px-8 py-4 bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl transition-colors"
              >
                FOR
              </button>
              <button
                onClick={() => setSelectedSide("AGAINST")}
                className="px-8 py-4 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl transition-colors"
              >
                AGAINST
              </button>
            </div>
          </div>
        )}

        {/* Debate Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* FOR Side */}
          <div className="space-y-4">
            <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl">
              <h3 className="text-lg font-bold text-green-500">FOR Arguments</h3>
            </div>
            <div className="space-y-4">
              {forArguments.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No arguments yet</p>
              ) : (
                forArguments.map((arg) => (
                  <div key={arg.id} className="p-4 bg-white/[0.03] border border-white/10 rounded-xl">
                    <div className="flex items-start justify-between mb-2">
                      <span className="font-semibold text-white">@{arg.username}</span>
                      <div className="flex items-center gap-1 text-gray-400">
                        <ThumbsUp size={14} />
                        <span>{arg.like_count}</span>
                      </div>
                    </div>
                    <p className="text-gray-300">{arg.content}</p>
                  </div>
                ))
              )}
              {/* Mock arguments */}
              <div className="p-4 bg-white/[0.03] border border-white/10 rounded-xl">
                <div className="flex items-start justify-between mb-2">
                  <span className="font-semibold text-white">@economy_expert</span>
                  <div className="flex items-center gap-1 text-gray-400">
                    <ThumbsUp size={14} />
                    <span>45</span>
                  </div>
                </div>
                <p className="text-gray-300">UBI would reduce poverty and provide economic security to millions of Indians, especially in the informal sector.</p>
              </div>
            </div>
          </div>

          {/* AGAINST Side */}
          <div className="space-y-4">
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
              <h3 className="text-lg font-bold text-red-500">AGAINST Arguments</h3>
            </div>
            <div className="space-y-4">
              {againstArguments.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No arguments yet</p>
              ) : (
                againstArguments.map((arg) => (
                  <div key={arg.id} className="p-4 bg-white/[0.03] border border-white/10 rounded-xl">
                    <div className="flex items-start justify-between mb-2">
                      <span className="font-semibold text-white">@{arg.username}</span>
                      <div className="flex items-center gap-1 text-gray-400">
                        <ThumbsUp size={14} />
                        <span>{arg.like_count}</span>
                      </div>
                    </div>
                    <p className="text-gray-300">{arg.content}</p>
                  </div>
                ))
              )}
              {/* Mock arguments */}
              <div className="p-4 bg-white/[0.03] border border-white/10 rounded-xl">
                <div className="flex items-start justify-between mb-2">
                  <span className="font-semibold text-white">@fiscal_conservative</span>
                  <div className="flex items-center gap-1 text-gray-400">
                    <ThumbsUp size={14} />
                    <span>38</span>
                  </div>
                </div>
                <p className="text-gray-300">The fiscal burden would be unsustainable. India needs targeted welfare programs, not blanket UPI.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Argument Input */}
        {selectedSide && (
          <div className="mt-8 p-6 bg-white/[0.03] border border-white/10 rounded-xl">
            <h3 className="text-lg font-bold text-white mb-4">
              Post {selectedSide} Argument
            </h3>
            <textarea
              value={argument}
              onChange={(e) => setArgument(e.target.value)}
              placeholder="Write your argument (50-500 words)..."
              rows={5}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-accent-blue/50 resize-none"
            />
            <div className="flex items-center justify-between mt-4">
              <span className="text-sm text-gray-500">
                {argument.split(/\s+/).filter(w => w.length > 0).length} / 500 words
              </span>
              <button
                onClick={handleSubmitArgument}
                disabled={argument.split(/\s+/).filter(w => w.length > 0).length < 50 || argument.split(/\s+/).filter(w => w.length > 0).length > 500}
                className="flex items-center gap-2 px-6 py-3 bg-accent-blue hover:bg-accent-blue/90 text-white font-semibold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send size={16} />
                Submit Argument
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
