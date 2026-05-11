"use client";

import { useState } from "react";
import { Calendar, Clock, Users, Flame, Bell } from "lucide-react";

export default function DebatesPage() {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isSubscribed, setIsSubscribed] = useState(false);

  // Generate next 7 days for calendar
  const getNext7Days = () => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      days.push(date);
    }
    return days;
  };

  const next7Days = getNext7Days();

  return (
    <div className="min-h-screen bg-[#050A14] py-12 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Debates</h1>
          <p className="text-gray-400">Join live political debates and share your perspective</p>
        </div>

        {/* Calendar Strip */}
        <div className="mb-8">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {next7Days.map((date, index) => {
              const isSelected = selectedDate?.toDateString() === date.toDateString();
              const hasDebate = index === 1 || index === 3 || index === 5; // Mock data
              return (
                <button
                  key={index}
                  onClick={() => setSelectedDate(date)}
                  className={`flex flex-col items-center gap-2 px-4 py-3 rounded-xl border transition-all min-w-[80px] ${
                    isSelected
                      ? "bg-accent-blue border-accent-blue text-white"
                      : "bg-white/[0.03] border-white/10 text-gray-400 hover:bg-white/[0.05]"
                  }`}
                >
                  <span className="text-xs">
                    {date.toLocaleDateString("en-US", { weekday: "short" })}
                  </span>
                  <span className="text-lg font-bold">{date.getDate()}</span>
                  {hasDebate && (
                    <div className="w-1.5 h-1.5 rounded-full bg-accent-blue" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* No Live Debate State */}
        <div className="mb-12 p-12 bg-white/[0.03] border border-white/10 rounded-2xl text-center">
          <div className="w-32 h-32 mx-auto mb-6 bg-white/[0.05] rounded-full flex items-center justify-center">
            <Flame size={48} className="text-gray-500" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">No debates live right now</h2>
          <p className="text-gray-400 mb-6">Register below to get notified by email when the next debate goes live</p>
          {isSubscribed ? (
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-green-500/20 text-green-500 rounded-xl">
              <Bell size={20} />
              <span className="font-semibold">You're subscribed to notifications</span>
            </div>
          ) : (
            <button
              onClick={() => setIsSubscribed(true)}
              className="w-full max-w-md px-6 py-3 bg-accent-blue hover:bg-accent-blue/90 text-white font-semibold rounded-xl transition-colors"
            >
              Notify Me for Next Debate
            </button>
          )}
        </div>

        {/* Upcoming Debates */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-6">Upcoming Debates</h2>
          <div className="space-y-4">
            {[
              { topic: "Should India implement universal basic income?", date: "Tomorrow, 7:00 PM", participants: 24 },
              { topic: "Digital privacy laws: Too strict or too loose?", date: "Wed, 8:00 PM", participants: 18 },
              { topic: "Agricultural reforms: Progress or regression?", date: "Fri, 6:00 PM", participants: 32 },
            ].map((debate, index) => (
              <div key={index} className="p-6 bg-white/[0.03] border border-white/10 rounded-xl hover:border-accent-blue/30 transition-all cursor-pointer group">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-white mb-2 group-hover:text-accent-blue transition-colors">
                      {debate.topic}
                    </h3>
                    <div className="flex items-center gap-4 text-sm text-gray-400">
                      <div className="flex items-center gap-1">
                        <Clock size={14} />
                        <span>{debate.date}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users size={14} />
                        <span>{debate.participants} participants</span>
                      </div>
                    </div>
                  </div>
                  <button className="px-4 py-2 bg-accent-blue hover:bg-accent-blue/90 text-white text-sm font-semibold rounded-lg transition-colors">
                    Subscribe
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Completed Debates */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-white mb-6">Completed Debates</h2>
          <div className="space-y-4">
            {[
              { topic: "Impact of recent tax reforms", winner: "FOR", votes: 156 },
              { topic: "Environmental policy effectiveness", winner: "AGAINST", votes: 203 },
            ].map((debate, index) => (
              <div key={index} className="p-6 bg-white/[0.03] border border-white/10 rounded-xl">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-white mb-2">
                      {debate.topic}
                    </h3>
                    <div className="flex items-center gap-4 text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                        debate.winner === "FOR" ? "bg-green-500/20 text-green-500" : "bg-red-500/20 text-red-500"
                      }`}>
                        Winner: {debate.winner}
                      </span>
                      <span className="text-gray-400">{debate.votes} total votes</span>
                    </div>
                  </div>
                  <button className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white text-sm font-semibold rounded-lg transition-colors">
                    View Replay
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
