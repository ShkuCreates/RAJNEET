"use client";

import { useEffect, useState } from "react";
import { Calendar, Clock, Users, Flame, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";
import { useSession } from "next-auth/react";

type Debate = {
  id: string;
  topic: string;
  description?: string;
  image_url?: string;
  status: "live" | "upcoming" | "completed";
  scheduled_at?: string;
  ends_at?: string;
  duration_minutes: number;
  winner_side?: string;
  max_for_participants: number;
  max_against_participants: number;
  audience_count: number;
  votes_for: number;
  votes_against: number;
  participant_count: number;
  total_likes: number;
  created_by: any;
  arguments: any[];
  participants: any[];
};

export default function UpcomingDebatesClient({ currentUser }: { currentUser: any }) {
  const [debates, setDebates] = useState<Debate[]>([]);
  const [loading, setLoading] = useState(true);
  const { data: session } = useSession();

  useEffect(() => {
    fetchDebates();
  }, []);

  const fetchDebates = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/debates/live");
      if (!res.ok) throw new Error("Failed to fetch debates");
      const data = await res.json();
      setDebates(data.debates || []);
    } catch (error) {
      console.error("Error fetching debates:", error);
      setDebates([]);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinAsDebater = async (debateId: string, side: "FOR" | "AGAINST") => {
    if (!session?.user) {
      toast.error("Please login first");
      return;
    }

    try {
      const res = await fetch(`/api/debates/${debateId}/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ side }),
      });

      if (res.ok) {
        toast.success(`Joined the debate as ${side}!`);
        fetchDebates();
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to join debate");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to join debate");
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
    <div className="space-y-6">
      {upcomingDebates.map((debate) => {
        const forParticipants = debate.participants?.filter((p: any) => p.side === "FOR").length || 0;
        const againstParticipants = debate.participants?.filter((p: any) => p.side === "AGAINST").length || 0;
        const forFull = forParticipants >= debate.max_for_participants;
        const againstFull = againstParticipants >= debate.max_against_participants;
        const forPct = Math.round((forParticipants / debate.max_for_participants) * 100);
        const againstPct = Math.round((againstParticipants / debate.max_against_participants) * 100);

        return (
          <div key={debate.id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 hover:border-accent-blue/30 transition-all shadow-xl">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-white mb-3">{debate.topic}</h2>
                {debate.description && <p className="text-gray-300 mb-4">{debate.description}</p>}
                
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400 mb-6">
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
                  <div className="flex items-center gap-1">
                    <Clock size={14} />
                    <span>{debate.duration_minutes} minutes</span>
                  </div>
                </div>

                {/* Progress Bars */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                  <div>
                    <div className="flex justify-between text-sm font-semibold mb-2">
                      <span className="text-green-500">
                        FOR Side {forParticipants}/{debate.max_for_participants}
                      </span>
                      {forFull ? <CheckCircle2 size={16} className="text-green-500" /> : null}
                    </div>
                    <div className="w-full h-3 rounded-full bg-white/10 overflow-hidden">
                      <div 
                        className="bg-green-500 h-full transition-all duration-700" 
                        style={{ width: `${forPct}%` }} 
                      />
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm font-semibold mb-2">
                      <span className="text-red-500">
                        AGAINST Side {againstParticipants}/{debate.max_against_participants}
                      </span>
                      {againstFull ? <CheckCircle2 size={16} className="text-red-500" /> : null}
                    </div>
                    <div className="w-full h-3 rounded-full bg-white/10 overflow-hidden">
                      <div 
                        className="bg-red-500 h-full transition-all duration-700" 
                        style={{ width: `${againstPct}%` }} 
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-3 min-w-[160px]">
                <button
                  onClick={() => handleJoinAsDebater(debate.id, "FOR")}
                  disabled={forFull || !session?.user}
                  className={`px-4 py-3 text-sm font-semibold rounded-lg transition-all ${
                    forFull
                      ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                      : "bg-green-500/20 text-green-500 border border-green-500/30 hover:bg-green-500 hover:text-white"
                  }`}
                >
                  {forFull ? "FOR Full" : "Join as FOR"}
                </button>
                
                <button
                  onClick={() => handleJoinAsDebater(debate.id, "AGAINST")}
                  disabled={againstFull || !session?.user}
                  className={`px-4 py-3 text-sm font-semibold rounded-lg transition-all ${
                    againstFull
                      ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                      : "bg-red-500/20 text-red-500 border border-red-500/30 hover:bg-red-500 hover:text-white"
                  }`}
                >
                  {againstFull ? "AGAINST Full" : "Join as AGAINST"}
                </button>
                
                <button className="px-4 py-3 text-sm font-semibold rounded-lg bg-white/5 text-white hover:bg-white/10 transition-all">
                  Join as Audience
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
