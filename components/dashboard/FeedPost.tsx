"use client";

import { motion } from "framer-motion";
import { MessageCircle, Heart, Share2, Swords, Newspaper } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

interface FeedPostProps {
  author: {
    name: string;
    username: string;
    avatar?: string;
    role: string;
  };
  content: string;
  type?: "post" | "debate" | "announcement" | "propaganda";
  likes: number;
  comments: number;
}

export function FeedPost({ author, content, type = "post", likes, comments }: FeedPostProps) {
  const typeStyles = {
    post: { icon: null, color: "", label: "" },
    debate: { icon: Swords, color: "text-blue-400", label: "Debate" },
    announcement: { icon: Newspaper, color: "text-gold-primary", label: "Announcement" },
    propaganda: { icon: null, color: "text-danger", label: "Propaganda" },
  };

  const typeInfo = typeStyles[type];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-bg-secondary border border-[rgba(212,175,55,0.2)] rounded-lg p-6 mb-4"
    >
      {/* Author Info */}
      <div className="flex items-center gap-3 mb-4">
        <Avatar src={author.avatar} size="md" showBorder />
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-white font-inter font-bold">{author.name}</span>
            <Badge variant="gold" className="text-xs">
              {author.role}
            </Badge>
          </div>
          <span className="text-text-secondary text-sm font-inter">@{author.username}</span>
        </div>
        {typeInfo.icon && (
          <Badge variant="secondary" icon={typeInfo.icon} className={typeInfo.color}>
            {typeInfo.label}
          </Badge>
        )}
      </div>

      {/* Content */}
      <p className="text-white font-inter mb-4">{content}</p>

      {/* Actions */}
      <div className="flex items-center gap-4 pt-4 border-t border-[rgba(212,175,55,0.1)]">
        <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }} className="flex items-center gap-2 text-text-secondary hover:text-gold-primary transition-colors">
          <Heart size={18} />
          <span className="text-sm font-inter">{likes}</span>
        </motion.button>
        <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }} className="flex items-center gap-2 text-text-secondary hover:text-gold-primary transition-colors">
          <MessageCircle size={18} />
          <span className="text-sm font-inter">{comments}</span>
        </motion.button>
        <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }} className="flex items-center gap-2 text-text-secondary hover:text-gold-primary transition-colors">
          <Share2 size={18} />
        </motion.button>
      </div>
    </motion.div>
  );
}
