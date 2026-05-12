"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Calendar, Clock, Users, Flame, Bell, Play, Eye } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

type LiveDebatesClientProps = {
  currentUser: any;
};

type Debate = {
  id: string;
  topic: string;
  description?: string;
  status: "live" | "upcoming" | "completed";
  scheduled_at?: string;
  ends_at?: string;
  participant_count: number;
  winner_side?: string;
  created_by: any;
  arguments: any[];
  participants: any[];
};

export default function LiveDebatesClient({ currentUser }: LiveDebatesClientProps) {
  const [debates, setDebates] = useState<Debate[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchLiveDebates();
  }, []);

  const fetchLiveDebates = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/debates/live");
      
      if (!res.ok) {
        throw new Error("Failed to fetch live debates");
      }
      
      const data = await res.json();
      setDebates(data.debates || []);
    } catch (error) {
      console.error("Error fetching live debates:", error);
      setDebates([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async () => {
    if (!currentUser?.email) {
      toast.error("Please sign in with a valid email first.");
      return;
    }

    try {
      setIsSubscribed(true);
      const res = await fetch("/api/debates/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: currentUser.id,
          email: currentUser.email,
          topicPreferences: ["live-debates"],
        }),
      });
      const data = await res.json();
      if (!res.ok || !data?.success) {
        throw new Error(data?.error || "Subscription failed");
      }
      toast.success("We will notify you when live debates start.");
    } catch (error: any) {
      toast.error(error?.message || "Unable to save your preference right now.");
    } finally {
      setIsSubscribed(false);
    }
  };

  const liveDebates = debates.filter((d) => d.status === "live");
  const upcomingDebates = debates.filter((d) => d.status === "upcoming");

  return (
    <div className="min-h-screen bg-[#050A14] py-12 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Live Debates</h1>
          <p className="text-gray-400">Join ongoing political debates and share your perspective</p>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white/20"></div>
          </div>
        )}

        {!loading && liveDebates.length > 0 && (
          <div className="space-y-6">
            {liveDebates.map((debate) => (
              <div key={debate.id} className="rounded-2xl border border-red-500/30 bg-red-500/5 p-6 shadow-2xl">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 px-3 py-1 bg-red-500/20 rounded-full">
                      <Flame size={16} className="text-red-400" />
                      <span className="text-sm font-semibold text-red-400">LIVE NOW</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-300">
                      <div className="flex items-center gap-1">
                        <Users size={14} />
                        <span>{debate.participant_count} participants</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Eye size={14} />
                        <span>Watching</span>
                      </div>
                    </div>
                  </div>
                  <Link
                    href={`/debates/${debate.id}`}
                    className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-semibold rounded-lg transition-colors flex items-center gap-2"
                  >
                    <Play size={16} />
                    Join Debate
                  </Link>
                </div>
                
                <h2 className="text-2xl font-bold text-white mb-3">{debate.topic}</h2>
                {debate.description && (
                  <p className="text-gray-300 mb-4">{debate.description}</p>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white/[0.05] rounded-lg p-4">
                    <h3 className="text-sm font-semibold text-gray-400 mb-2">FOR Side</h3>
                    <div className="text-white">
                      {debate.arguments?.filter((arg) => arg.side === "FOR").length || 0} arguments
                    </div>
                  </div>
                  <div className="bg-white/[0.05] rounded-lg p-4">
                    <h3 className="text-sm font-semibold text-gray-400 mb-2">AGAINST Side</h3>
                    <div className="text-white">
                      {debate.arguments?.filter((arg) => arg.side === "AGAINST").length || 0} arguments
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && liveDebates.length === 0 && (
          <div className="text-center py-20">
            <div className="mb-8 p-12 bg-white/[0.03] border border-white/10 rounded-2xl">
              <div className="w-32 h-32 mx-auto mb-6 bg-white/[0.05] rounded-full flex items-center justify-center">
                <Flame size={48} className="text-gray-500" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">No live debates right now</h2>
              <p className="text-gray-400 mb-6">Check back later or subscribe to get notified when debates go live</p>
              {isSubscribed ? (
                <div className="inline-flex items-center gap-2 px-6 py-3 bg-green-500/20 text-green-500 rounded-xl">
                  <Bell size={20} />
                  <span className="font-semibold">You are subscribed to notifications</span>
                </div>
              ) : (
                <button
                  onClick={handleSubscribe}
                  className="w-full max-w-md px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-xl transition-colors"
                >
                  <Bell size={20} className="mr-2" />
                  Notify Me When Live
                </button>
              )}
            </div>
          </div>
        )}

        {/* Upcoming Debates */}
        {upcomingDebates.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-white mb-6">Upcoming Debates</h2>
            <div className="space-y-4">
              {upcomingDebates.map((debate) => (
                <div key={debate.id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 hover:border-red-500/30 transition-all">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-white mb-2 group-hover:text-red-400 transition-colors">
                        {debate.topic}
                      </h3>
                      <div className="flex items-center gap-4 text-sm text-gray-400">
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
                          <Users size={14} />
                          <span>{debate.participant_count} participants</span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => router.push(`/debates/${debate.id}`)}
                      className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-semibold rounded-lg transition-colors"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
