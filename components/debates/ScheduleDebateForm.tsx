"use client";

import { useState, useEffect } from "react";
import { Calendar, Clock, Image, Users, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

type Debate = {
  id: string;
  topic: string;
  description?: string;
  image_url?: string;
  scheduled_at?: string;
  duration_minutes?: number;
  max_for_participants?: number;
  max_against_participants?: number;
  status: string;
};

type ScheduleDebateFormProps = {
  onClose?: () => void;
  onSuccess?: () => void;
  debate?: Debate;
};

export default function ScheduleDebateForm({ onClose, onSuccess, debate }: ScheduleDebateFormProps) {
  const [formData, setFormData] = useState({
    topic: "",
    description: "",
    image_url: "",
    scheduled_at: "",
    duration_minutes: "60",
    max_for_participants: "5",
    max_against_participants: "5",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (debate) {
      setFormData({
        topic: debate.topic || "",
        description: debate.description || "",
        image_url: debate.image_url || "",
        scheduled_at: debate.scheduled_at ? new Date(debate.scheduled_at).toISOString().slice(0, 16) : "",
        duration_minutes: String(debate.duration_minutes || 60),
        max_for_participants: String(debate.max_for_participants || 5),
        max_against_participants: String(debate.max_against_participants || 5),
      });
    }
  }, [debate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.topic || !formData.scheduled_at) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);
    try {
      const url = debate ? `/api/debates/${debate.id}` : "/api/debates";
      const method = debate ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          duration_minutes: parseInt(formData.duration_minutes),
          max_for_participants: parseInt(formData.max_for_participants),
          max_against_participants: parseInt(formData.max_against_participants),
        }),
      });

      if (res.ok) {
        toast.success(debate ? "Debate updated successfully!" : "Debate scheduled successfully!");
        setFormData({
          topic: "",
          description: "",
          image_url: "",
          scheduled_at: "",
          duration_minutes: "60",
          max_for_participants: "5",
          max_against_participants: "5",
        });
        onSuccess?.();
        onClose?.();
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to save debate");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to save debate");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[600px] rounded-[32px] border border-white/10 bg-[#111827] px-8 py-12 shadow-2xl">
      <div className="max-w-2xl mx-auto">
        <h2 className="text-3xl font-bold text-white mb-8">{debate ? "Edit Debate" : "Schedule New Debate"}</h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Topic */}
          <div>
            <label className="block text-sm font-semibold text-gray-400 mb-2">
              Topic <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.topic}
              onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
              placeholder="Enter debate topic..."
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-accent-blue transition-all"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-400 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Enter debate description..."
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-accent-blue transition-all resize-none"
              rows={4}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Image URL */}
            <div>
              <label className="block text-sm font-semibold text-gray-400 mb-2">
                <Image size={16} className="inline mr-2" />
                Cover Image URL
              </label>
              <input
                type="url"
                value={formData.image_url}
                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                placeholder="https://..."
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-accent-blue transition-all"
              />
            </div>

            {/* Duration */}
            <div>
              <label className="block text-sm font-semibold text-gray-400 mb-2">
                <Clock size={16} className="inline mr-2" />
                Duration (minutes)
              </label>
              <input
                type="number"
                min="15"
                max="180"
                value={formData.duration_minutes}
                onChange={(e) => setFormData({ ...formData, duration_minutes: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-accent-blue transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Max FOR Participants */}
            <div>
              <label className="block text-sm font-semibold text-gray-400 mb-2">
                <Users size={16} className="inline mr-2" />
                Max FOR the Motion
              </label>
              <input
                type="number"
                min="1"
                max="20"
                value={formData.max_for_participants}
                onChange={(e) => setFormData({ ...formData, max_for_participants: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-accent-blue transition-all"
              />
            </div>

            {/* Max AGAINST Participants */}
            <div>
              <label className="block text-sm font-semibold text-gray-400 mb-2">
                <Users size={16} className="inline mr-2" />
                Max AGAINST the Motion
              </label>
              <input
                type="number"
                min="1"
                max="20"
                value={formData.max_against_participants}
                onChange={(e) => setFormData({ ...formData, max_against_participants: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-accent-blue transition-all"
              />
            </div>
          </div>

          {/* Scheduled At */}
          <div>
            <label className="block text-sm font-semibold text-gray-400 mb-2">
              <Calendar size={16} className="inline mr-2" />
              Date & Time <span className="text-red-500">*</span>
            </label>
            <input
              type="datetime-local"
              value={formData.scheduled_at}
              onChange={(e) => setFormData({ ...formData, scheduled_at: e.target.value })}
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-accent-blue transition-all"
              required
            />
          </div>

          {/* Submit Button */}
          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-6 py-4 bg-accent-blue hover:bg-accent-blue/90 text-white font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {debate ? (
                isSubmitting ? "Saving..." : "Save Changes"
              ) : (
                <>
                  <Plus size={18} />
                  {isSubmitting ? "Scheduling..." : "Schedule Debate"}
                </>
              )}
            </button>
            
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-4 bg-white/5 hover:bg-white/10 text-white font-bold rounded-xl transition-all"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
