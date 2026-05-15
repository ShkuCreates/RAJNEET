"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Play, Clock, Edit2 } from "lucide-react";
import { toast } from "sonner";

type Debate = {
  id: string;
  topic: string;
  description: string | null;
  status: string;
  scheduled_at: Date | null;
  created_at: Date;
};

export default function DebatesAdminPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [debates, setDebates] = useState<Debate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session?.user?.email || session.user.role !== "ADMIN") {
      router.push("/");
      return;
    }
    fetchDebates();
  }, [session, router]);

  const fetchDebates = async () => {
    try {
      const res = await fetch("/api/debates");
      if (res.ok) {
        const data = await res.json();
        setDebates(data.debates || []);
      }
    } catch (e) {
      console.error("Failed to fetch debates:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleSchedule = async () => {
    const topic = prompt("Enter debate topic:");
    if (!topic) return;
    
    const description = prompt("Enter description (optional):") || "";
    const scheduledStr = prompt("Enter scheduled date/time (YYYY-MM-DD HH:MM IST):");
    
    try {
      const scheduledAt = scheduledStr ? new Date(scheduledStr) : null;
      
      const res = await fetch("/api/debates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic,
          description,
          scheduled_at: scheduledAt?.toISOString(),
        }),
      });
      
      if (res.ok) {
        toast.success("Debate scheduled successfully!");
        fetchDebates();
      } else {
        toast.error("Failed to schedule debate");
      }
    } catch (e) {
      toast.error("Invalid date format. Please use YYYY-MM-DD HH:MM");
    }
  };

  const handleStart = async (id: string) => {
    if (!confirm("Start this debate?")) return;
    try {
      const res = await fetch(`/api/debates/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "live" }),
      });
      if (res.ok) {
        toast.success("Debate started!");
        fetchDebates();
      } else {
        toast.error("Failed to start debate");
      }
    } catch (e) {
      toast.error("Error starting debate");
    }
  };

  const handleEnd = async (id: string) => {
    if (!confirm("End this debate?")) return;
    try {
      const res = await fetch(`/api/debates/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "completed" }),
      });
      if (res.ok) {
        toast.success("Debate ended!");
        fetchDebates();
      } else {
        toast.error("Failed to end debate");
      }
    } catch (e) {
      toast.error("Error ending debate");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this debate?")) return;
    try {
      const res = await fetch(`/api/debates/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast.success("Debate deleted!");
        fetchDebates();
      } else {
        toast.error("Failed to delete debate");
      }
    } catch (e) {
      toast.error("Error deleting debate");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050A14] px-6 py-12 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050A14] px-6 py-12">
      <div className="mx-auto max-w-5xl">
        <div className="mb-10 flex items-center justify-between">
          <div>
            <h1 className="mb-3 text-4xl font-bold text-white">Debate Admin</h1>
            <p className="text-gray-400">Schedule and manage debates on RAJNEET.</p>
          </div>
          <button
            onClick={handleSchedule}
            className="flex items-center gap-2 px-4 py-2 bg-accent-blue text-white text-sm font-bold rounded-lg hover:bg-accent-blue/90 transition-colors"
          >
            <Plus size={18} />
            Schedule Debate
          </button>
        </div>

        {debates.length > 0 ? (
          <div className="space-y-4">
            {debates.map((debate) => (
              <div
                key={debate.id}
                className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        debate.status === "upcoming" 
                          ? "bg-amber-500/20 text-amber-400" 
                          : debate.status === "live" 
                            ? "bg-green-500/20 text-green-400" 
                            : "bg-gray-500/20 text-gray-400"
                      }`}>
                        {debate.status.toUpperCase()}
                      </span>
                      {debate.scheduled_at && (
                        <div className="flex items-center gap-1 text-sm text-gray-400">
                          <Clock size={14} />
                          {new Date(debate.scheduled_at).toLocaleString("en-IN", {
                            dateStyle: "medium",
                            timeStyle: "short",
                            timeZone: "Asia/Kolkata",
                          })}
                        </div>
                      )}
                    </div>
                    <h2 className="text-xl font-semibold text-white mb-2">{debate.topic}</h2>
                    {debate.description && (
                      <p className="text-sm text-gray-400">{debate.description}</p>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {debate.status === "upcoming" && (
                      <button
                        onClick={() => handleStart(debate.id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 text-white text-xs font-semibold rounded-lg hover:bg-green-700 transition-colors"
                      >
                        <Play size={14} />
                        Start
                      </button>
                    )}
                    {debate.status === "live" && (
                      <button
                        onClick={() => handleEnd(debate.id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 text-white text-xs font-semibold rounded-lg hover:bg-red-700 transition-colors"
                      >
                        End
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(debate.id)}
                      className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-[28px] border border-white/10 bg-white/[0.03] px-8 py-16 text-center">
            <h2 className="mb-3 text-2xl font-semibold text-white">No Debates Yet</h2>
            <p className="text-gray-400">Schedule your first debate to get started.</p>
          </div>
        )}
      </div>
    </div>
  );
}
