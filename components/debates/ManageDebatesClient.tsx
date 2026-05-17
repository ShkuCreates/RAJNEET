"use client";

import { useState, useEffect } from "react";
import { Edit, Trash2, PlaySquare, Pause, CheckCircle2, ExternalLink } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

type Debate = {
  id: string;
  topic: string;
  description?: string;
  image_url?: string;
  status: string;
  scheduled_at?: string;
  ends_at?: string;
  duration_minutes: number;
  max_for_participants: number;
  max_against_participants: number;
  audience_count: number;
  votes_for: number;
  votes_against: number;
  participant_count: number;
  created_at: string;
};

export default function ManageDebatesClient() {
  const [debates, setDebates] = useState<Debate[]>([]);
  const [loading, setLoading] = useState(true);

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
    } catch (e) {
      console.error("Error fetching debates:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this debate?")) return;
    
    try {
      const res = await fetch(`/api/debates/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Debate deleted!");
        fetchDebates();
      } else {
        toast.error("Failed to delete debate");
      }
    } catch (e) {
      toast.error("Failed to delete debate");
    }
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/debates/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      
      if (res.ok) {
        toast.success(`Debate status updated to ${status}!`);
        fetchDebates();
      } else {
        toast.error("Failed to update status");
      }
    } catch (e) {
      toast.error("Failed to update status");
    }
  };

  if (loading) {
    return (
      <div className="min-h-[400px] rounded-[32px] border border-white/10 bg-[#111827] px-8 py-16 text-center shadow-2xl">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-blue mx-auto"></div>
        <p className="text-gray-400 mt-4">Loading debates...</p>
      </div>
    );
  }

  if (debates.length === 0) {
    return (
      <div className="min-h-[400px] rounded-[32px] border border-white/10 bg-[#111827] px-8 py-16 text-center shadow-2xl">
        <p className="text-gray-400">No debates scheduled yet</p>
      </div>
    );
  }

  return (
    <div className="bg-[#111827] border border-white/5 rounded-[32px] overflow-hidden">
      <table className="w-full text-left">
        <thead className="bg-white/[0.02] border-b border-white/5">
          <tr>
            <th className="p-6 text-[10px] font-black text-gray-500 uppercase tracking-widest">Topic</th>
            <th className="p-6 text-[10px] font-black text-gray-500 uppercase tracking-widest text-center">Status</th>
            <th className="p-6 text-[10px] font-black text-gray-500 uppercase tracking-widest text-center">Schedule</th>
            <th className="p-6 text-[10px] font-black text-gray-500 uppercase tracking-widest text-center">Participants</th>
            <th className="p-6 text-[10px] font-black text-gray-500 uppercase tracking-widest text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {debates.map((debate) => (
            <tr key={debate.id} className="hover:bg-white/[0.01] transition-colors">
              <td className="p-6">
                <h4 className="text-sm font-bold text-white mb-1 line-clamp-2">{debate.topic}</h4>
                {debate.description && (
                  <p className="text-xs text-gray-500 line-clamp-1">{debate.description}</p>
                )}
                <p className="text-[10px] text-gray-600 mt-1">
                  {format(new Date(debate.created_at), "MMM dd, yyyy HH:mm")}
                </p>
              </td>
              <td className="p-6 text-center">
                <span className={`px-2 py-1 rounded text-[9px] font-black uppercase tracking-widest ${
                  debate.status === "live" ? "bg-red-500/10 text-red-500" : 
                  debate.status === "completed" ? "bg-green-500/10 text-green-500" :
                  "bg-gray-500/10 text-gray-500"
                }`}>
                  {debate.status}
                </span>
              </td>
              <td className="p-6 text-center">
                {debate.scheduled_at ? (
                  <span className="text-sm text-gray-300">
                    {format(new Date(debate.scheduled_at), "MMM dd, HH:mm")}
                  </span>
                ) : (
                  <span className="text-xs text-gray-600">Not scheduled</span>
                )}
              </td>
              <td className="p-6 text-center">
                <span className="text-sm text-gray-300">{debate.participant_count} / {debate.max_for_participants + debate.max_against_participants}</span>
              </td>
              <td className="p-6 text-right">
                <div className="flex items-center justify-end gap-2">
                  {debate.status === "upcoming" && (
                    <button 
                      onClick={() => handleUpdateStatus(debate.id, "live")}
                      className="p-2 hover:bg-green-500/10 text-gray-500 hover:text-green-500 rounded-lg transition-all"
                      title="Start Debate"
                    >
                      <PlaySquare size={16} />
                    </button>
                  )}
                  {debate.status === "live" && (
                    <button 
                      onClick={() => handleUpdateStatus(debate.id, "completed")}
                      className="p-2 hover:bg-accent-amber/10 text-gray-500 hover:text-accent-amber rounded-lg transition-all"
                      title="End Debate"
                    >
                      <Pause size={16} />
                    </button>
                  )}
                  <button 
                    className="p-2 hover:bg-accent-blue/10 text-gray-500 hover:text-accent-blue rounded-lg transition-all"
                    title="Edit"
                  >
                    <Edit size={16} />
                  </button>
                  <button 
                    onClick={() => handleDelete(debate.id)}
                    className="p-2 hover:bg-red-500/10 text-gray-500 hover:text-red-500 rounded-lg transition-all"
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
