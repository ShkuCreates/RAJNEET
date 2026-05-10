"use client";

import { motion } from "framer-motion";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { PoliticalLadder } from "@/components/profile/PoliticalLadder";
import { FollowButton } from "@/components/profile/FollowButton";
import { Users, UserCheck, MessageCircle, TrendingUp } from "lucide-react";
import { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface ProfilePageProps {
  params: {
    username: string;
  };
}

const mockProfile = {
  username: "rahul_politics",
  name: "Rahul Sharma",
  role: "Journalist",
  subRole: "Journalist",
  avatar: null,
  bio: "Political journalist covering Maharashtra politics. Truth above all.",
  state: "Maharashtra",
  party: "Progressive Party",
  partyColor: "#D4AF37",
  followers: 1247,
  following: 342,
  posts: 156,
  influenceScore: 85,
};

export default function ProfilePage({ params }: ProfilePageProps) {
  const [isFollowing, setIsFollowing] = useState(false);
  const { data: session } = useSession();
  const router = useRouter();
  const isOwnProfile = session?.user?.username === params.username;

  const handleClaimRole = (role: string) => {
    console.log("Claiming role:", role);
    // In real implementation, call API to claim role
  };

  return (
    <div className="min-h-screen bg-bg-primary flex">
      <Sidebar />

      <main className="flex-1 p-6 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto"
        >
          {/* Profile Banner */}
          <div className="relative mb-20">
            <div className="h-48 bg-gradient-to-r from-bg-tertiary to-bg-secondary border border-[rgba(212,175,55,0.2)] rounded-t-lg" />
            
            {/* Profile Info */}
            <div className="absolute -bottom-16 left-8 flex items-end gap-6">
              <Avatar src={mockProfile.avatar} size="xl" showBorder />
              <div className="mb-2">
                <h1 className="text-3xl font-cinzel text-white flex items-center gap-3">
                  {mockProfile.name}
                  <Badge variant="gold">{mockProfile.role}</Badge>
                </h1>
                <p className="text-text-secondary font-inter">@{mockProfile.username}</p>
              </div>
            </div>

            {/* Action Button */}
            <div className="absolute bottom-4 right-8">
              {isOwnProfile ? (
                <Button variant="secondary">Edit Profile</Button>
              ) : (
                <FollowButton isFollowing={isFollowing} onToggle={() => setIsFollowing(!isFollowing)} />
              )}
            </div>
          </div>

          {/* Bio and Party */}
          <div className="mb-8">
            <p className="text-white font-inter mb-4">{mockProfile.bio}</p>
            {mockProfile.party && (
              <div className="flex items-center gap-2">
                <span className="text-text-secondary font-inter">Party:</span>
                <div
                  className="px-3 py-1 rounded text-sm font-bold text-white"
                  style={{ backgroundColor: mockProfile.partyColor }}
                >
                  {mockProfile.party}
                </div>
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-4 mb-8">
            <Card className="p-4 text-center">
              <Users className="text-gold-primary mx-auto mb-2" size={24} />
              <p className="text-2xl font-cinzel text-white">{mockProfile.followers}</p>
              <p className="text-text-secondary text-sm font-inter">Followers</p>
            </Card>
            <Card className="p-4 text-center">
              <UserCheck className="text-gold-primary mx-auto mb-2" size={24} />
              <p className="text-2xl font-cinzel text-white">{mockProfile.following}</p>
              <p className="text-text-secondary text-sm font-inter">Following</p>
            </Card>
            <Card className="p-4 text-center">
              <MessageCircle className="text-gold-primary mx-auto mb-2" size={24} />
              <p className="text-2xl font-cinzel text-white">{mockProfile.posts}</p>
              <p className="text-text-secondary text-sm font-inter">Posts</p>
            </Card>
            <Card className="p-4 text-center">
              <TrendingUp className="text-gold-primary mx-auto mb-2" size={24} />
              <p className="text-2xl font-cinzel text-white">{mockProfile.influenceScore}</p>
              <p className="text-text-secondary text-sm font-inter">Influence</p>
            </Card>
          </div>

          {/* Political Ladder - Only show on own profile */}
          {isOwnProfile && (
            <Card className="p-6 mb-8">
              <PoliticalLadder
                currentRole={mockProfile.role}
                currentFollowers={mockProfile.followers}
                onClaimRole={handleClaimRole}
              />
            </Card>
          )}

          {/* Recent Activity (Placeholder) */}
          <Card className="p-6">
            <h2 className="text-2xl font-cinzel text-gold-gradient mb-4">Recent Activity</h2>
            <div className="space-y-4">
              <div className="flex items-start gap-3 pb-4 border-b border-[rgba(212,175,55,0.1)]">
                <div className="w-2 h-2 bg-gold-primary rounded-full mt-2" />
                <div>
                  <p className="text-white font-inter">Posted about the new infrastructure bill</p>
                  <p className="text-text-secondary text-sm font-inter">2 hours ago</p>
                </div>
              </div>
              <div className="flex items-start gap-3 pb-4 border-b border-[rgba(212,175,55,0.1)]">
                <div className="w-2 h-2 bg-gold-primary rounded-full mt-2" />
                <div>
                  <p className="text-white font-inter">Started a debate on education reform</p>
                  <p className="text-text-secondary text-sm font-inter">1 day ago</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-gold-primary rounded-full mt-2" />
                <div>
                  <p className="text-white font-inter">Joined Progressive Party</p>
                  <p className="text-text-secondary text-sm font-inter">3 days ago</p>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      </main>
    </div>
  );
}
