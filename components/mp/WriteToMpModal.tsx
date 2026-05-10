"use client";

import { useState } from "react";
import { X, Send, Landmark } from "lucide-react";
import { toast } from "sonner";

export default function WriteToMpModal({ 
  newsHeadline, 
  userDistrict, 
  onClose 
}: { 
  newsHeadline: string; 
  userDistrict: string;
  onClose: () => void;
}) {
  const [body, setBody] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!body.trim()) return;

    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      toast.success("Letter sent to your MP's public inbox.");
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-card w-full max-w-lg border border-border rounded-xl shadow-lg overflow-hidden animate-in zoom-in-95">
        <div className="flex items-center justify-between p-4 border-b border-border bg-secondary/5">
          <div className="flex items-center gap-2 text-foreground font-semibold">
            <Landmark className="text-primary" size={20} />
            Write to Your MP
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">To</label>
            <div className="p-2 bg-muted/50 rounded text-sm text-foreground font-medium">
              Member of Parliament, {userDistrict} District
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Subject</label>
            <div className="p-2 bg-muted/50 rounded text-sm text-foreground font-medium line-clamp-1">
              Regarding: {newsHeadline}
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Your Message</label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Express your civic opinion directly to your representative..."
              className="w-full h-40 p-3 bg-background border border-input rounded text-sm text-foreground focus:ring-1 focus:ring-primary resize-none"
              required
            />
            <p className="text-[10px] text-muted-foreground">This letter will be logged publicly on your MP&apos;s profile page.</p>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-2 rounded font-medium hover:bg-primary/90 disabled:opacity-50"
            >
              {isSubmitting ? "Sending..." : "Send Letter"}
              <Send size={16} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
