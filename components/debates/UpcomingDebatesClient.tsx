"use client";

import { useEffect, useState } from "react";
import { Calendar, Clock, Users, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { useSession } from "next-auth/react";

type Debate = {
  id: string;
  topic: string;
  description?: string;
  image_url?: string;
  status: "live" | "upcoming" | "completed";
  scheduled_at?: string;
  created_at: string;
  max_for_participants: number;
  max_against_participants: number;
  participants: { side: string }[];
};

export default function UpcomingDebatesClient() {
  const [debates, setDebates] = useState<Debate[]>([]);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState<string | null>(null);
  const { data: session } = useSession();

  useEffect(() => {
    fetchDebates();
  }, []);

  const fetchDebates = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/debates");
      if (res.ok) {
        const data = await res.json();
        setDebates(data.debates || []);
      }
    } catch (error) {
      console.error("Error fetching debates:", error);
      setDebates([]);
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async (debateId: string, role: "FOR" | "AGAINST" | "AUDIENCE", side?: "FOR" | "AGAINST") => {
    if (!session) {
      toast.error("Please sign in first");
      return;
    }
    setJoining(debateId);
    try {
      const res = await fetch(`/api/debates/${debateId}/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role, side }),
      });
      if (res.ok) {
        toast.success(`Joined as ${role.toLowerCase()}!`);
        fetchDebates();
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to join");
      }
    } catch (e) {
      toast.error("Failed to join");
    } finally {
      setJoining(null);
    }
  };

  const upcomingDebates = debates.filter((d) => d.status === "upcoming");

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white/20"></div>
      </div>
    );
  }

  if (upcomingDebates.length === 0) {
    return (
      <div className="min-h-[400px] rounded-[32px] border border-white/10 bg-[#111827] px-8 py-16 text-center shadow-2xl">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-accent-blue/10">
          <Calendar className="text-accent-blue" size={30} />
        </div>
        <h1 className="mb-3 text-3xl font-semibold text-white">No Upcoming Debates</h1>
        <p className="text-base text-gray-400">Check back later for scheduled debates</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {upcomingDebates.map((debate) => {
        const forCount = debate.participants.filter(p => p.side === "FOR").length;
        const againstCount = debate.participants.filter(p => p.side === "AGAINST").length;
        const forPercentage = (forCount / debate.max_for_participants) * 100;
        const againstPercentage = (againstCount / debate.max_against_participants) * 100;
        const forFull = forCount >= debate.max_for_participants;
        const againstFull = againstCount >= debate.max_against_participants;

        return (
          <div key={debate.id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 hover:border-accent-blue/30 transition-all shadow-xl">
            {debate.image_url && (
              <div className="mb-6 rounded-xl overflow-hidden h-48 bg-white/5">
                <img 
                  src={debate.image_url} 
                  alt={debate.topic} 
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-white mb-3">{debate.topic}</h2>
                {debate.description && <p className="text-gray-300 mb-4">{debate.description}</p>}
                
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
                  <div className="flex items-center gap-1">
                    <Calendar size={14} />
                    <span>
                      {debate.scheduled_at 
                        ? new Date(debate.scheduled_at).toLocaleString("en-IN", {
                            dateStyle: "medium",
                            timeStyle: "short",
                            timeZone: "Asia/Kolkata",
                          })
                        : "Schedule to be announced"
                      }
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Progress bars */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* FOR side */}
              <div className="bg-white/[0.02] rounded-xl p-4 border border-white/5">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-bold text-green-400">FOR the Motion</h4>
                  <span className="text-sm text-gray-400">{forCount} / {debate.max_for_participants}</span>
                </div>
                <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-green-500 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(forPercentage, 100)}%` }}
                  />
                </div>
                {forFull && (
                  <p className="mt-2 text-xs text-green-400 flex items-center gap-1">
                    <CheckCircle2 size={12} /> Slots full
                  </p>
                )}
              </div>

              {/* AGAINST side */}
              <div className="bg-white/[0.02] rounded-xl p-4 border border-white/5">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-bold text-red-400">AGAINST the Motion</h4>
                  <span className="text-sm text-gray-400">{againstCount} / {debate.max_against_participants}</span>
                </div>
                <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-red-500 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(againstPercentage, 100)}%` }}
                  />
                </div>
                {againstFull && (
                  <p className="mt-2 text-xs text-red-400 flex items-center gap-1">
                    <CheckCircle2 size={12} /> Slots full
                  </p>
                )}
              </div>
            </div>

            {/* Buttons */}
            <div className="flex flex-wrap gap-3">
              <button 
                onClick={() => handleJoin(debate.id, "FOR", "FOR")}
                disabled={joining === debate.id || forFull}
                className="flex-1 min-w-[140px] px-4 py-3 bg-green-500 hover:bg-green-600 disabled:bg-green-500/30 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg transition-all"
              >
                {joining === debate.id ? "Joining..." : "Join as FOR"}
              </button>
              
              <button 
                onClick={() => handleJoin(debate.id, "AGAINST", "AGAINST")}
                disabled={joining === debate.id || againstFull}
                className="flex-1 min-w-[140px] px-4 py-3 bg-red-500 hover:bg-red-600 disabled:bg-red-500/30 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg transition-all"
              >
                {joining === debate.id ? "Joining..." : "Join as AGAINST"}
              </button>
              
              <button 
                onClick={() => handleJoin(debate.id, "AUDIENCE")}
                disabled={joining === debate.id}
                className="px-4 py-3 bg-white/5 hover:bg-white/10 disabled:opacity-50 text-white text-sm font-semibold rounded-lg transition-all"
              >
                {joining === debate.id ? "Joining..." : "Join as Audience"}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
