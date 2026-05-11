"use client";

import { useState } from "react";
import { AlertTriangle, Send, Check } from "lucide-react";
import { toast } from "sonner";

interface FactCheckRequestProps {
  newsId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function FactCheckRequest({ newsId, isOpen, onClose }: FactCheckRequestProps) {
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      toast.error("Please provide a reason for fact check");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/fact-check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newsId, reason }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Fact check request submitted successfully");
        onClose();
        setReason("");
      } else {
        toast.error(data.error || "Failed to submit fact check request");
      }
    } catch (error) {
      toast.error("Failed to submit fact check request");
    } finally {
      setIsSubmitting(false);
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
            <AlertTriangle className="text-accent-amber" size={20} />
            <h2 className="text-xl font-bold text-white">Request Fact Check</h2>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-white">
            <span className="sr-only">Close</span>
            ×
          </button>
        </div>

        <div className="p-6">
          <p className="text-gray-400 text-sm mb-6">
            Help us maintain accuracy and credibility. Fact check requests are reviewed by our team and appropriate action will be taken if misinformation is detected.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-white mb-2">
                Reason for Fact Check
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Please describe why you believe this news needs fact checking..."
                rows={5}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-accent-amber/50 resize-none"
                required
              />
            </div>

            <div className="flex items-center gap-3 text-xs text-gray-500">
              <AlertTriangle size={12} />
              <span>
                False or malicious fact check requests may result in account suspension. Please use this feature responsibly.
              </span>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !reason.trim()}
              className="w-full py-3 bg-accent-amber hover:bg-accent-amber/90 text-white font-semibold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-t-2 border-accent-amber/30 rounded-full animate-spin" />
                  <span>Submitting...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <Send size={16} />
                  <span>Submit Fact Check Request</span>
                </div>
              )}
            </button>
          </form>

          <div className="mt-6 p-4 bg-accent-amber/5 border border-accent-amber/10 rounded-xl">
            <div className="flex items-start gap-3">
              <Check className="text-accent-amber mt-1" size={16} />
              <div>
                <h4 className="text-sm font-semibold text-accent-amber mb-1">What happens next?</h4>
                <p className="text-xs text-gray-400">
                  1. Our team reviews the request within 24 hours
                </p>
                <p className="text-xs text-gray-400">
                  2. If verified, a correction notice will be added
                </p>
                <p className="text-xs text-gray-400">
                  3. If false, no action will be taken
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
