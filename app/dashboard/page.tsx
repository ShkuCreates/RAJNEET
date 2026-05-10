"use client";

import { motion } from "framer-motion";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { Sidebar } from "@/components/layout/Sidebar";
import { DistrictStats } from "@/components/dashboard/DistrictStats";
import { FeedPost } from "@/components/dashboard/FeedPost";
import { Button } from "@/components/ui/Button";
import { Plus } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { useState } from "react";
import { Input } from "@/components/ui/Input";

const mockPosts = [
  {
    author: {
      name: "Rahul Sharma",
      username: "rahul_politics",
      avatar: null,
      role: "MP",
    },
    content: "The new infrastructure bill will transform our district. Every citizen deserves better roads and access to healthcare.",
    type: "announcement" as const,
    likes: 234,
    comments: 45,
  },
  {
    author: {
      name: "Priya Patel",
      username: "priya_news",
      avatar: null,
      role: "Journalist",
    },
    content: "BREAKING: Sources confirm that the treasury allocation for education has increased by 15% this quarter. This is a major win for our students.",
    type: "debate" as const,
    likes: 567,
    comments: 89,
  },
  {
    author: {
      name: "Amit Verma",
      username: "amit_activist",
      avatar: null,
      role: "Activist",
    },
    content: "We need to hold our representatives accountable. Join me at the town hall this Saturday to demand transparency in governance!",
    type: "post" as const,
    likes: 123,
    comments: 34,
  },
];

export default function DashboardPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [postContent, setPostContent] = useState("");

  return (
    <div className="min-h-screen bg-bg-primary flex">
      {/* Left Sidebar */}
      <Sidebar />

      {/* Center Feed */}
      <main className="flex-1 p-6 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto"
        >
          {/* Create Post Bar */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-bg-secondary border border-[rgba(212,175,55,0.2)] rounded-lg p-4 mb-6"
          >
            <Button
              variant="secondary"
              className="w-full justify-start text-left text-text-secondary"
              onClick={() => setIsModalOpen(true)}
            >
              <Plus className="mr-2" size={20} />
              What's on your mind?
            </Button>
          </motion.div>

          {/* Feed Posts */}
          <div className="space-y-4">
            {mockPosts.map((post, index) => (
              <FeedPost key={index} {...post} />
            ))}
          </div>
        </motion.div>
      </main>

      {/* Right Panel - District Stats */}
      <DistrictStats />

      {/* Create Post Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create Post">
        <div className="space-y-4">
          <textarea
            value={postContent}
            onChange={(e) => setPostContent(e.target.value)}
            placeholder="Share your thoughts with the political arena..."
            className="w-full h-40 bg-bg-tertiary border border-[rgba(212,175,55,0.2)] rounded-lg p-4 text-white placeholder-text-secondary focus:border-gold-primary focus:outline-none resize-none font-inter"
          />
          <div className="flex gap-3">
            <Button variant="primary" className="flex-1" onClick={() => setIsModalOpen(false)}>
              Post
            </Button>
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
