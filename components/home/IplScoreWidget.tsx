"use client";

import { useEffect, useState } from "react";
import { ExternalLink, Trophy, Loader2 } from "lucide-react";

const CRICBUZZ_LIVE_URL = "https://www.cricbuzz.com/cricket-match/live-scores";

type Match = {
  id: string;
  team1: string;
  team2: string;
  score1: string;
  score2: string;
  status: string;
  overs: string;
  venue: string;
  timestamp: string;
};

export default function IplScoreWidget() {
  const [loading, setLoading] = useState(true);
  const [matches, setMatches] = useState<Match[]>([]);

  useEffect(() => {
    async function fetchScores() {
      try {
        const res = await fetch("/api/cricket/scores");
        const data = await res.json();
        if (data.success || data.matches) {
          setMatches(data.matches);
        }
      } catch (err) {
        console.error("Failed to fetch IPL scores:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchScores();
    const interval = setInterval(fetchScores, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="rounded-xl border border-white/10 bg-[#111827]/10 p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Trophy className="text-red-500" size={16} />
          <span className="text-sm font-semibold text-white">IPL Live Scores</span>
        </div>
        <a
          href={CRICBUZZ_LIVE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-lg bg-red-500/90 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-600"
        >
          <ExternalLink size={14} />
          Cricbuzz
        </a>
      </div>
      <div className="space-y-3">
        {loading ? (
          <div className="flex items-center justify-center py-6 text-gray-400">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Loading scores...
          </div>
        ) : matches.length === 0 ? (
          <div className="rounded-lg border border-white/10 bg-black/30 p-4 text-center text-gray-400">
            No live matches at the moment
          </div>
        ) : (
          matches.map((match) => (
            <div
              key={match.id}
              className="rounded-lg border border-white/10 bg-black/30 p-4"
            >
              <div className="mb-2 flex items-center justify-between">
                <span className={`text-xs font-bold uppercase tracking-widest ${
                  match.status === "LIVE" ? "text-red-400" : "text-gray-400"
                }`}>
                  {match.status}
                </span>
                <span className="text-xs text-gray-500">{match.venue}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-white">{match.team1}</span>
                    <span className="text-sm font-bold text-accent-blue">{match.score1}</span>
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-sm font-semibold text-white">{match.team2}</span>
                    <span className="text-sm font-bold text-accent-blue">{match.score2}</span>
                  </div>
                </div>
              </div>
              <div className="mt-2 text-xs text-gray-400">Overs: {match.overs}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
