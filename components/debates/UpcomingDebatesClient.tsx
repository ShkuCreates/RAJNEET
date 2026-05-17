"use client";

import { useEffect, useState } from "react";
import { Calendar, Clock, Users } from "lucide-react";
import { toast } from "sonner";
import { useSession } from "next-auth/react";

type Debate = {
  id: string;
  topic: string;
  description?: string;
  status: "live" | "upcoming" | "completed";
  scheduled_at?: string;
  created_at: string;
};

export default function UpcomingDebatesClient() {
  const [debates, setDebates] = useState<Debate[]>([]);
  const [loading, setLoading] = useState(true);
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
                </div>
              </div>

              <div className="flex flex-col gap-3 min-w-[160px]">
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
