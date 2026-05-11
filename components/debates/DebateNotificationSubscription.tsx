"use client";

import { useState } from "react";
import { Bell, Check, X } from "lucide-react";
import { toast } from "sonner";

interface DebateNotificationSubscriptionProps {
  isOpen: boolean;
  onClose: () => void;
}

const TOPICS = [
  "Politics",
  "Criminal Law",
  "Economy",
  "Foreign Policy",
  "Social Issues",
  "Environment",
];

export function DebateNotificationSubscription({ isOpen, onClose }: DebateNotificationSubscriptionProps) {
  const [email, setEmail] = useState("");
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [isSubscribing, setIsSubscribing] = useState(false);

  const handleTopicToggle = (topic: string) => {
    setSelectedTopics((prev) =>
      prev.includes(topic) ? prev.filter((t) => t !== topic) : [...prev, topic]
    );
  };

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || selectedTopics.length === 0) {
      toast.error("Please enter email and select at least one topic");
      return;
    }

    setIsSubscribing(true);
    try {
      const res = await fetch("/api/debates/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, topicPreferences: selectedTopics }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Subscribed to debate notifications!");
        onClose();
      } else {
        toast.error(data.error || "Failed to subscribe");
      }
    } catch (error) {
      toast.error("Failed to subscribe");
    } finally {
      setIsSubscribing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[150] bg-black/80 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="relative w-full max-w-md bg-[#111827] rounded-2xl border border-white/10 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-[#111827] border-b border-white/10 p-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="text-accent-blue" size={24} />
            <h2 className="text-xl font-bold text-white">Get Notified</h2>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          <p className="text-gray-400 text-sm mb-6">
            Select the topics you're interested in and we'll notify you when new debates are scheduled.
          </p>

          <form onSubmit={handleSubscribe} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-white mb-2">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-accent-blue/50"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-white mb-3">Topic Preferences</label>
              <div className="flex flex-wrap gap-2">
                {TOPICS.map((topic) => (
                  <button
                    key={topic}
                    type="button"
                    onClick={() => handleTopicToggle(topic)}
                    className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                      selectedTopics.includes(topic)
                        ? "bg-accent-blue text-white"
                        : "bg-white/5 text-gray-400 hover:bg-white/10"
                    }`}
                  >
                    {selectedTopics.includes(topic) && <Check size={14} className="inline mr-1" />}
                    {topic}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubscribing || !email.trim() || selectedTopics.length === 0}
              className="w-full py-3 bg-accent-blue hover:bg-accent-blue/90 text-white font-semibold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubscribing ? "Subscribing..." : "Subscribe to Notifications"}
            </button>
          </form>

          <p className="text-[10px] text-gray-500 text-center mt-4">
            You can unsubscribe at any time from your settings
          </p>
        </div>
      </div>
    </div>
  );
}
