"use client";

import { Trophy } from "lucide-react";

export default function LiveScoresWidget() {
  return (
    <div className="bg-[#0D1B3E]/50 border border-white/10 rounded-xl p-6">
      <div className="mb-4 flex items-center gap-3">
        <Trophy className="text-red-500" size={24} />
        <h3 className="text-xl font-bold text-white">IPL Live Scores</h3>
      </div>
      <iframe
        src="https://www.cricbuzz.com/cricket-match/live-scores"
        width="100%"
        height="500px"
        frameBorder="0"
        className="rounded-lg"
        title="Cricbuzz Live Scores"
      />
    </div>
  );
}
