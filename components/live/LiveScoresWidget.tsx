"use client";

import { useState, useEffect } from "react";
import { Trophy, Loader2, RefreshCw } from "lucide-react";

interface LiveMatch {
  id: string;
  team1: string;
  team2: string;
  score1: string;
  score2: string;
  status: string;
  overs: string;
  venue: string;
  timestamp: string;
}

export default function LiveScoresWidget() {
  const [matches, setMatches] = useState<LiveMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>("");

  useEffect(() => {
    fetchLiveScores();
    const interval = setInterval(fetchLiveScores, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchLiveScores = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Use backend API route to avoid CORS issues
      const response = await fetch('/api/cricket/scores', {
        cache: 'no-store'
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch live scores');
      }
      
      const data = await response.json();
      
      if (data.success && data.matches) {
        setMatches(data.matches);
        setLastUpdated(new Date().toLocaleTimeString());
        
        if (data.source === 'sample') {
          setError('Live scores unavailable - showing sample data');
        }
      } else {
        throw new Error('Invalid response from API');
      }
    } catch (err) {
      console.error('Live scores error:', err);
      setError('Unable to fetch live scores');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-[#0D1B3E]/50 border border-white/10 rounded-xl p-6">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="animate-spin text-red-500" size={24} />
          <span className="ml-3 text-gray-400">Loading live scores...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-[#0D1B3E]/50 border border-white/10 rounded-xl p-6">
        <div className="text-center py-8">
          <Trophy className="mx-auto text-gray-500 mb-4" size={48} />
          <p className="text-gray-400 mb-4">{error}</p>
          <button
            onClick={fetchLiveScores}
            className="inline-flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            <RefreshCw size={16} />
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#0D1B3E]/50 border border-white/10 rounded-xl p-6">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Trophy className="text-red-500" size={24} />
          <h3 className="text-xl font-bold text-white">IPL Live Scores</h3>
        </div>
        <div className="text-sm text-gray-500">
          Last updated: {lastUpdated}
        </div>
      </div>

      {matches.length === 0 ? (
        <div className="text-center py-12">
          <Trophy className="mx-auto text-gray-500 mb-4" size={48} />
          <p className="text-gray-400 mb-4">No live matches currently</p>
          <p className="text-gray-500 text-sm">Check back later for upcoming matches</p>
        </div>
      ) : (
        <div className="space-y-4">
          {matches.map((match) => (
            <div
              key={match.id}
              className="border border-white/10 rounded-lg p-4 bg-white/[0.02] hover:bg-white/[0.05] transition-colors"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${
                    match.status === 'LIVE' 
                      ? 'bg-red-500 text-white animate-pulse' 
                      : 'bg-gray-600 text-gray-300'
                  }`}>
                    {match.status}
                  </span>
                  <span className="text-gray-500 text-sm">{match.venue}</span>
                </div>
                <span className="text-gray-400 text-xs">{match.timestamp}</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <div className="text-white font-semibold mb-1">{match.team1}</div>
                    <div className="text-2xl font-bold text-red-500">{match.score1}</div>
                    <div className="text-gray-400 text-sm">{match.overs.split('/')[0]} overs</div>
                  </div>

                  <div className="text-gray-500 text-sm">VS</div>

                  <div className="text-center">
                    <div className="text-white font-semibold mb-1">{match.team2}</div>
                    <div className="text-2xl font-bold text-red-500">{match.score2}</div>
                    <div className="text-gray-400 text-sm">{match.overs.split('/')[1]} overs</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-6 text-center">
        <button
          onClick={fetchLiveScores}
          className="inline-flex items-center gap-2 px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
        >
          <RefreshCw size={16} />
          Refresh Scores
        </button>
      </div>
    </div>
  );
}
