"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Heart, MessageCircle, Repeat2, Share } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

interface Author {
  id: string;
  username: string;
  name: string;
  image?: string;
  role: string;
  subRole: string;
}

interface PostCardProps {
  id: string;
  content: string;
  type: "General" | "Announcement" | "Debate" | "Propaganda";
  author: Author;
  likeCount: number;
  commentCount: number;
  createdAt: Date;
  isLiked: boolean;
  onLike?: (postId: string) => void;
  onComment?: (postId: string) => void;
}

export function PostCard({
  id,
  content,
  type,
  author,
  likeCount,
  commentCount,
  createdAt,
  isLiked,
  onLike,
  onComment,
}: PostCardProps) {
  const [liked, setLiked] = useState(isLiked);
  const [likes, setLikes] = useState(likeCount);
  const [liking, setLiking] = useState(false);

  const handleLike = async () => {
    if (liking) return;
    
    setLiking(true);
    const newLiked = !liked;
    const newLikes = liked ? likes - 1 : likes + 1;
    
    // Optimistic UI update
    setLiked(newLiked);
    setLikes(newLikes);
    
    try {
      const response = await fetch(`/api/posts/${id}/like`, {
        method: "POST",
      });
      
      if (!response.ok) {
        // Revert on error
        setLiked(!newLiked);
        setLikes(likes);
      } else {
        const data = await response.json();
        // Update with actual count from server
        setLiked(data.liked);
        setLikes(data.likeCount);
      }
    } catch (error) {
      // Revert on error
      setLiked(!newLiked);
      setLikes(likes);
    } finally {
      setLiking(false);
      onLike?.(id);
    }
  };

  const getPostTypeColor = (type: string) => {
    switch (type) {
      case "Announcement":
        return "#D4AF37";
      case "Debate":
        return "#4A9EFF";
      case "Propaganda":
        return "#C0392B";
      default:
        return "#6B7280";
    }
  };

  const getPostTypeBgColor = (type: string) => {
    switch (type) {
      case "Announcement":
        return "rgba(212,175,55,0.1)";
      case "Debate":
        return "rgba(74,158,255,0.1)";
      case "Propaganda":
        return "rgba(192,57,43,0.1)";
      default:
        return "rgba(107,114,128,0.1)";
    }
  };

  const isTrending = likeCount >= 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-bg-secondary rounded-xl p-4 border border-[rgba(212,175,55,0.1)]"
      style={{
        borderLeft: `4px solid ${getPostTypeColor(type)}`,
      }}
    >
      {/* Header */}
      <div className="flex items-start gap-3 mb-3">
        <Avatar
          src={author.image}
          alt={author.username}
          size="md"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-white font-inter font-semibold">
              {author.name || author.username}
            </span>
            <span className="text-text-secondary text-sm font-inter">
              @{author.username}
            </span>
            <span className="text-text-secondary text-xs">·</span>
            <span className="text-text-secondary text-xs">
              {formatDistanceToNow(createdAt, { addSuffix: true })}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Badge
              variant={author.role === "CITIZEN" ? "silver" : "gold"}
              size="sm"
            >
              {author.subRole}
            </Badge>
            {type !== "General" && (
              <Badge
                variant="secondary"
                size="sm"
                style={{
                  backgroundColor: getPostTypeBgColor(type),
                  color: getPostTypeColor(type),
                  border: `1px solid ${getPostTypeColor(type)}20`,
                }}
              >
                {type}
              </Badge>
            )}
            {isTrending && (
              <Badge variant="gold" size="sm">
                🔥 Trending
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mb-4">
        <p className="text-white font-inter whitespace-pre-wrap break-words">
          {content}
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-6">
        <button
          onClick={handleLike}
          disabled={liking}
          className="flex items-center gap-2 text-text-secondary hover:text-red-500 transition-colors group"
        >
          <motion.div
            animate={liked ? { scale: [1, 1.2, 1] } : {}}
            transition={{ duration: 0.3 }}
          >
            <Heart
              size={18}
              className={liked ? "fill-red-500 text-red-500" : ""}
            />
          </motion.div>
          <span className="text-sm font-inter">{likes}</span>
        </button>

        <button
          onClick={() => onComment?.(id)}
          className="flex items-center gap-2 text-text-secondary hover:text-blue-400 transition-colors"
        >
          <MessageCircle size={18} />
          <span className="text-sm font-inter">{commentCount}</span>
        </button>

        <button className="flex items-center gap-2 text-text-secondary hover:text-green-400 transition-colors">
          <Repeat2 size={18} />
          <span className="text-sm font-inter">Share</span>
        </button>
      </div>
    </motion.div>
  );
}
