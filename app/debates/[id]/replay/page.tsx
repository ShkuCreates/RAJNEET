"use client";

import { useState, useEffect } from "react";
import { Play, Clock, Users, Trophy } from "lucide-react";

export default function DebateReplayPage({ params }: { params: { id: string } }) {
  const [debate, setDebate] = useState<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);

  useEffect(() => {
    // Mock debate data
    setDebate({
      id: params.id,
      topic: "Should India implement universal basic income?",
      description: "Discussing economic and social implications of UBI in Indian context",
      scheduled_at: new Date(Date.now() - 24 * 60 * 60 * 1000),
      duration: 3600, // 1 hour
      winner_side: "FOR",
      participant_count: 24,
      arguments: [
        {
          id: "1",
          side: "FOR",
          username: "economy_expert",
          content: "UBI would reduce poverty and provide economic security to millions of Indians, especially in the informal sector.",
          timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000 + 5 * 60 * 1000),
          like_count: 45,
        },
        {
          id: "2",
          side: "AGAINST",
          username: "fiscal_conservative",
          content: "The fiscal burden would be unsustainable. India needs targeted welfare programs, not blanket UPI.",
          timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000 + 10 * 60 * 1000),
          like_count: 38,
        },
      ],
    });
  }, [params.id]);

  if (!debate) {
    return (
      <div className="min-h-screen bg-[#050A14] flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (time: number) => {
    setCurrentTime(time);
  };

  const sortedArguments = debate.arguments.sort((a, b) => 
    new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  const forArguments = sortedArguments.filter((arg) => arg.side === "FOR");
  const againstArguments = sortedArguments.filter((arg) => arg.side === "AGAINST");

  return (
    <div className="min-h-screen bg-[#050A14] py-8 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8 p-6 bg-white/[0.03] border border-white/10 rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-white">Debate Replay</h1>
            <div className="flex items-center gap-4">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-500/20 text-green-500">
                Winner: {debate.winner_side}
              </span>
              <span className="text-sm text-gray-400">
                {debate.participant_count} participants
              </span>
            </div>
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">{debate.topic}</h2>
          <p className="text-gray-400">{debate.description}</p>
          <p className="text-sm text-gray-500 mt-2">
            {debate.scheduled_at.toLocaleDateString()} • {Math.floor(debate.duration / 60)} minutes
          </p>
        </div>

        {/* Video Player */}
        <div className="mb-8 p-6 bg-black rounded-2xl">
          <div className="aspect-video bg-gray-900 rounded-lg flex items-center justify-center">
            <button
              onClick={handlePlayPause}
              className="w-20 h-20 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors"
            >
              <Play size={32} className="text-white" fill={isPlaying ? "currentColor" : "none"} />
            </button>
          </div>
          
          {/* Video Controls */}
          <div className="mt-4 flex items-center gap-4">
            <button
              onClick={handlePlayPause}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
            >
              <Play size={16} className="text-white" fill={isPlaying ? "currentColor" : "none"} />
            </button>
            
            <div className="flex-1">
              <input
                type="range"
                min="0"
                max={debate.duration}
                value={currentTime}
                onChange={(e) => handleSeek(Number(e.target.value))}
                className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(debate.duration)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Arguments Timeline */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* FOR Arguments */}
          <div>
            <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl mb-4">
              <h3 className="text-lg font-bold text-green-500 mb-4">FOR Arguments</h3>
            </div>
            
            <div className="space-y-4">
              {forArguments.map((arg) => (
                <div key={arg.id} className="p-4 bg-white/[0.03] border border-white/10 rounded-xl">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center text-green-500 text-[10px] font-bold">
                        {arg.username.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-semibold text-white">@{arg.username}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <Clock size={12} />
                      <span>{new Date(arg.timestamp).toLocaleTimeString()}</span>
                    </div>
                  </div>
                  <p className="text-gray-300 mb-3">{arg.content}</p>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-gray-500">{arg.like_count} likes</span>
                    <button
                      onClick={() => handleSeek(Math.floor((new Date(arg.timestamp).getTime() - new Date(debate.scheduled_at).getTime()) / 1000))}
                      className="text-accent-blue hover:text-accent-blue/80 transition-colors"
                    >
                      Jump to timestamp
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AGAINST Arguments */}
          <div>
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl mb-4">
              <h3 className="text-lg font-bold text-red-500 mb-4">AGAINST Arguments</h3>
            </div>
            
            <div className="space-y-4">
              {againstArguments.map((arg) => (
                <div key={arg.id} className="p-4 bg-white/[0.03] border border-white/10 rounded-xl">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center text-red-500 text-[10px] font-bold">
                        {arg.username.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-semibold text-white">@{arg.username}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <Clock size={12} />
                      <span>{new Date(arg.timestamp).toLocaleTimeString()}</span>
                    </div>
                  </div>
                  <p className="text-gray-300 mb-3">{arg.content}</p>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-gray-500">{arg.like_count} likes</span>
                    <button
                      onClick={() => handleSeek(Math.floor((new Date(arg.timestamp).getTime() - new Date(debate.scheduled_at).getTime()) / 1000))}
                      className="text-accent-blue hover:text-accent-blue/80 transition-colors"
                    >
                      Jump to timestamp
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Final Results */}
        <div className="mt-8 p-6 bg-white/[0.03] border border-white/10 rounded-2xl">
          <div className="flex items-center gap-2 mb-4">
            <Trophy className="text-yellow-500" size={24} />
            <h3 className="text-xl font-bold text-white">Final Results</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl">
              <h4 className="text-lg font-bold text-green-500 mb-2">FOR</h4>
              <p className="text-3xl font-bold text-white">65%</p>
              <p className="text-sm text-gray-400">Final Score</p>
            </div>
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
              <h4 className="text-lg font-bold text-red-500 mb-2">AGAINST</h4>
              <p className="text-3xl font-bold text-white">35%</p>
              <p className="text-sm text-gray-400">Final Score</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
