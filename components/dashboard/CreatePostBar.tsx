"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, ChevronDown } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { useSession } from "next-auth/react";

interface CreatePostBarProps {
  district?: string;
  onPostCreated?: () => void;
}

export function CreatePostBar({ district, onPostCreated }: CreatePostBarProps) {
  const { data: session } = useSession();
  const [isExpanded, setIsExpanded] = useState(false);
  const [content, setContent] = useState("");
  const [postType, setPostType] = useState<"General" | "Announcement" | "Debate" | "Propaganda">("General");
  const [posting, setPosting] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const userRole = session?.user?.role;

  const canCreateAnnouncement = userRole && userRole !== "CITIZEN";

  const handleSubmit = async () => {
    if (!content.trim() || posting || !session?.user?.id) return;

    setPosting(true);
    try {
      const response = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: content.trim(),
          type: postType,
        }),
      });

      if (response.ok) {
        setContent("");
        setIsExpanded(false);
        onPostCreated?.();
      }
    } catch (error) {
      console.error("Error creating post:", error);
    } finally {
      setPosting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && e.ctrlKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  if (!session?.user) {
    return null;
  }

  return (
    <div className="bg-bg-secondary rounded-xl border border-[rgba(212,175,55,0.1)] overflow-hidden">
      {/* Collapsed State */}
      <AnimatePresence mode="wait">
        {!isExpanded ? (
          <motion.div
            key="collapsed"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            onClick={() => setIsExpanded(true)}
            className="p-4 cursor-pointer hover:bg-[rgba(212,175,55,0.05)] transition-colors"
          >
            <div className="flex items-center gap-3">
              <Avatar
                src={session.user.image}
                alt={session.user.username || ""}
                size="md"
              />
              <div className="flex-1">
                <input
                  type="text"
                  placeholder={`What's happening in ${district || "your district"}?`}
                  className="w-full bg-transparent text-text-secondary font-inter placeholder:text-text-secondary/50 focus:outline-none cursor-pointer"
                  readOnly
                />
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="expanded"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="p-4"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <Avatar
                  src={session.user.image}
                  alt={session.user.username || ""}
                  size="md"
                />
                <div>
                  <div className="text-white font-inter font-semibold">
                    {session.user.name || session.user.username}
                  </div>
                  <div className="text-text-secondary text-sm">
                    @{session.user.username}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsExpanded(false)}
                className="text-text-secondary hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Post Type Selector */}
            <div className="mb-3">
              <div className="flex items-center gap-2">
                <span className="text-text-secondary text-sm font-inter">Post Type:</span>
                <div className="relative">
                  <select
                    value={postType}
                    onChange={(e) => setPostType(e.target.value as any)}
                    className="appearance-none bg-bg-tertiary text-white text-sm font-inter px-3 py-1 rounded-lg border border-[rgba(212,175,55,0.2)] focus:outline-none focus:border-gold-primary pr-8"
                  >
                    <option value="General">General</option>
                    {canCreateAnnouncement && (
                      <option value="Announcement">Announcement</option>
                    )}
                    <option value="Debate">Debate</option>
                    <option value="Propaganda">Propaganda</option>
                  </select>
                  <ChevronDown
                    size={16}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none"
                  />
                </div>
              </div>
            </div>

            {/* Text Area */}
            <textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Share your thoughts..."
              className="w-full bg-bg-tertiary text-white font-inter placeholder:text-text-secondary/50 rounded-lg border border-[rgba(212,175,55,0.2)] focus:outline-none focus:border-gold-primary px-3 py-2 resize-none"
              rows={4}
              autoFocus
            />

            {/* Footer */}
            <div className="flex items-center justify-between mt-3">
              <div className="text-text-secondary text-xs font-inter">
                Press Ctrl+Enter to post
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setIsExpanded(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleSubmit}
                  disabled={!content.trim() || posting}
                  className="flex items-center gap-2"
                >
                  <Send size={14} />
                  {posting ? "Posting..." : "Post"}
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
