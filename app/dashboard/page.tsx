"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { PostCard } from "@/components/dashboard/PostCard";
import { CreatePostBar } from "@/components/dashboard/CreatePostBar";
import { DistrictPulse } from "@/components/dashboard/DistrictPulse";
import { Button } from "@/components/ui/Button";
import { Loader2, RefreshCw } from "lucide-react";
import React from "react";

interface Post {
  id: string;
  content: string;
  type: "General" | "Announcement" | "Debate" | "Propaganda";
  author: {
    id: string;
    username: string;
    name: string;
    image?: string;
    role: string;
    subRole: string;
  };
  likeCount: number;
  commentCount: number;
  createdAt: Date;
  isLiked: boolean;
}

interface UserProfile {
  id: string;
  username: string;
  name: string;
  state?: string;
  district?: string;
  role: string;
  subRole: string;
  party?: {
    id: string;
    name: string;
    color: string;
    logo?: string;
  };
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState("home");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [visitedDistrict, setVisitedDistrict] = useState<{ state: string; district: string } | null>(null);

  // Redirect if not authenticated
  if (status === "unauthenticated") {
    redirect("/");
  }

  // Fetch user profile
  useEffect(() => {
    if (session?.user?.id) {
      fetch("/api/users/me")
        .then((res) => res.json())
        .then((data) => {
          setUserProfile(data);
        })
        .catch(console.error);
    }
  }, [session?.user?.id]);

  // Fetch posts
  const fetchPosts = useCallback(async (reset = false) => {
    if (!userProfile?.district && !visitedDistrict) return;

    setLoading(reset);
    try {
      const district = visitedDistrict?.district || userProfile?.district;
      const type = activeTab === "trending" ? "trending" : activeTab === "my-district" ? "my-district" : "home";
      const currentPage = reset ? 1 : page;

      const response = await fetch(
        `/api/districts/${encodeURIComponent(district)}/feed?page=${currentPage}&limit=10&type=${type}`
      );

      if (response.ok) {
        const data = await response.json();
        if (reset) {
          setPosts(data.posts);
          setPage(1);
        } else {
          setPosts(prev => [...prev, ...data.posts]);
        }
        setHasMore(data.pagination.pages > currentPage);
      }
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [userProfile?.district, visitedDistrict, activeTab, page]);

  // Initial fetch and tab changes
  useEffect(() => {
    if (userProfile || visitedDistrict) {
      fetchPosts(true);
    }
  }, [activeTab, userProfile, visitedDistrict, fetchPosts]);

  // Infinite scroll
  useEffect(() => {
    const handleScroll = () => {
      if (window.innerHeight + document.documentElement.scrollTop >= 
          document.documentElement.offsetHeight - 1000 && hasMore && !loading) {
        setPage(prev => prev + 1);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [hasMore, loading]);

  // Load more posts when page changes
  useEffect(() => {
    if (page > 1) {
      fetchPosts(false);
    }
  }, [page, fetchPosts]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchPosts(true);
  };

  const handlePostCreated = () => {
    fetchPosts(true);
  };

  const handleLike = (postId: string) => {
    // Post is already updated with optimistic UI
  };

  const handleComment = (postId: string) => {
    // TODO: Open comment modal
  };

  const handleVisitDistrict = (state: string, district: string) => {
    setVisitedDistrict({ state, district });
    setActiveTab("home");
  };

  if (status === "loading" || !userProfile) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <Loader2 className="animate-spin text-gold-primary" size={48} />
      </div>
    );
  }

  const currentDistrict = visitedDistrict?.district || userProfile.district;

  return (
    <div className="min-h-screen bg-bg-primary flex">
      {/* Left Sidebar */}
      <Sidebar />

      {/* Center Feed */}
      <main className="flex-1 max-w-2xl mx-auto p-6 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-cinzel text-gold-gradient mb-2">
                {visitedDistrict ? `${visitedDistrict.district}, ${visitedDistrict.state}` : "Your District"}
              </h1>
              {visitedDistrict && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setVisitedDistrict(null)}
                  className="text-text-secondary hover:text-white"
                >
                  ← Back to your district
                </Button>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefresh}
              disabled={refreshing}
              className="text-text-secondary hover:text-white"
            >
              <motion.div
                animate={refreshing ? { rotate: 360 } : {}}
                transition={{ duration: 1, repeat: refreshing ? Infinity : 0, ease: "linear" }}
              >
                <RefreshCw size={18} />
              </motion.div>
            </Button>
          </div>

          {/* Create Post Bar */}
          <CreatePostBar
            district={currentDistrict}
            onPostCreated={handlePostCreated}
          />

          {/* Simple Tab Navigation */}
          <div className="flex gap-2 p-1 bg-bg-secondary rounded-lg">
            {["home", "trending", "my-district"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-2 px-4 rounded-md font-inter text-sm transition-all ${
                  activeTab === tab
                    ? "bg-gold-primary text-black font-semibold"
                    : "text-text-secondary hover:text-white"
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1).replace("-", " ")}
              </button>
            ))}
          </div>

          {/* Posts Feed */}
          <div className="space-y-4">
            {loading && posts.length === 0 ? (
              <div className="flex justify-center py-12">
                <Loader2 className="animate-spin text-gold-primary" size={32} />
              </div>
            ) : posts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-text-secondary mb-4">No posts yet</p>
                <p className="text-text-secondary text-sm">
                  Be the first to share something in {currentDistrict}!
                </p>
              </div>
            ) : (
              <>
                {posts.map((post) => (
                  <PostCard
                    key={post.id}
                    {...post}
                    onLike={handleLike}
                    onComment={handleComment}
                  />
                ))}
                
                {/* Load More Indicator */}
                {hasMore && (
                  <div className="flex justify-center py-4">
                    <Loader2 className="animate-spin text-gold-primary" size={24} />
                  </div>
                )}
                
                {!hasMore && posts.length > 0 && (
                  <div className="text-center py-4 text-text-secondary text-sm">
                    You've reached the end of the feed
                  </div>
                )}
              </>
            )}
          </div>
        </motion.div>
      </main>

      {/* Right Panel - District Pulse */}
      <aside className="w-80 bg-bg-secondary border-l border-[rgba(212,175,55,0.2)] min-h-screen sticky top-0 h-screen overflow-y-auto">
        {currentDistrict && (
          <DistrictPulse district={currentDistrict} isLive={true} />
        )}
      </aside>
    </div>
  );
}
