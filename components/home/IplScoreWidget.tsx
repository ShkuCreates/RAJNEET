"use client";

import { useState, useEffect } from "react";
import { Trophy, ExternalLink, Loader2 } from "lucide-react";
import Link from "next/link";

interface LiveMatch {
  id: string;
  team1: string;
  team2: string;
  score1: string;
  score2: string;
  status: string;
  venue: string;
}

export default function IplScoreWidget() {
  const [match, setMatch] = useState<LiveMatch | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchLatestMatch();
    const interval = setInterval(fetchLatestMatch, 45000); // Update every 45 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchLatestMatch = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Use backend API route to avoid CORS issues
      const response = await fetch('/api/cricket/scores', {
        cache: 'no-store'
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch IPL scores');
      }
      
      const data = await response.json();
      
      if (data.success && data.matches && data.matches.length > 0) {
        const latestMatch = data.matches[0];
        setMatch({
          id: latestMatch.id,
          team1: latestMatch.team1,
          team2: latestMatch.team2,
          score1: latestMatch.score1,
          score2: latestMatch.score2,
          status: latestMatch.status,
          venue: latestMatch.venue
        });
      } else {
        setMatch(null);
      }
    } catch (err) {
      console.error('IPL scores error:', err);
      setError('Unable to fetch scores');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-[#111827]/10 rounded-xl p-4 border border-white/10">
        <div className="flex items-center justify-center py-2">
          <Loader2 className="animate-spin text-red-500" size={16} />
          <span className="ml-2 text-gray-600 text-sm">Loading IPL...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-[#111827]/10 rounded-xl p-4 border border-white/10">
        <div className="text-center py-2">
          <Trophy className="mx-auto text-gray-500 mb-2" size={20} />
          <p className="text-gray-600 text-xs">{error}</p>
        </div>
      </div>
    );
  }

  if (!match) {
    return (
      <div className="bg-[#111827]/10 rounded-xl p-4 border border-white/10">
        <div className="text-center py-2">
          <Trophy className="mx-auto text-gray-500 mb-2" size={20} />
          <p className="text-gray-600 text-xs">No live IPL matches</p>
        </div>
      </div>
    );
  }

  return (
    <Link href="/live" className="block">
      <div className="bg-[#111827]/10 rounded-xl p-4 border border-white/10 hover:bg-[#111827]/20 transition-colors cursor-pointer">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Trophy className="text-red-500" size={16} />
            <span className="text-white font-semibold text-sm">IPL Live</span>
          </div>
          <ExternalLink size={12} className="text-gray-400 hover:text-gray-300" />
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-white font-bold">{match.team1}</div>
            <div className="text-2xl font-bold text-red-500">{match.score1}</div>
          </div>
          
          <div className="text-gray-400 text-xs">VS</div>
          
          <div className="flex items-center gap-3">
            <div className="text-white font-bold">{match.team2}</div>
            <div className="text-2xl font-bold text-red-500">{match.score2}</div>
          </div>
        </div>
        
        <div className="text-center">
          <p className="text-gray-400 text-xs">
            {match.venue} • {match.status}
          </p>
        </div>
      </div>
    </Link>
  );
}
