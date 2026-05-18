"use client";

import { useState, useEffect, useRef } from "react";
import {
  Share2,
  User,
  ThumbsUp,
  Mic,
  MicOff,
  Video,
  VideoOff,
  Loader2,
  X
} from "lucide-react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import {
  LiveKitRoom,
  VideoConference,
  ControlBar,
  RoomAudioRenderer,
} from "@livekit/components-react";

type DebateParticipant = {
  id: string;
  user_id: string;
  debate_id: string;
  side: string;
  joined_at: string;
  user: {
    id: string;
    name: string;
    avatar_url?: string;
  };
};

type Debate = {
  id: string;
  topic: string;
  description?: string;
  status: string;
  max_for_participants?: number;
  max_against_participants?: number;
  participants?: DebateParticipant[];
};

type Poll = {
  id: string;
  question: string;
  options: string[];
  votes: Record<string, string>;
};



export default function DebateRoomPage({ params }: { params: { id: string } }) {
  const { data: session } = useSession();
  const [debate, setDebate] = useState<Debate | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<"AUDIENCE" | "FOR" | "AGAINST" | "HOST">("AUDIENCE");
  const [showJoinOptions, setShowJoinOptions] = useState(false);
  const [userVote, setUserVote] = useState<"FOR" | "AGAINST" | null>(null);
  
  // Poll state
  const [showPollModal, setShowPollModal] = useState(false);
  const [pollQuestion, setPollQuestion] = useState("");
  const [pollOptions, setPollOptions] = useState(["", ""]);
  const [currentPoll, setCurrentPoll] = useState<Poll | null>(null);
  const [userPollVote, setUserPollVote] = useState<string | null>(null);

  // LiveKit state
  const [livekitToken, setLivekitToken] = useState<string | null>(null);
  const [livekitWsUrl, setLivekitWsUrl] = useState<string | null>(null);

  // Mock participants for now
  const [forParticipants, setForParticipants] = useState<any[]>([]);
  const [againstParticipants, setAgainstParticipants] = useState<any[]>([]);

  // Fetch debate data
  useEffect(() => {
    const fetchDebate = async () => {
      try {
        const res = await fetch(`/api/debates/${params.id}`);
        if (res.ok) {
          const data = await res.json();
          setDebate(data.debate);
          
          // Determine user role
          if (data.debate.participants && session?.user?.id) {
            const participant = data.debate.participants.find(
              (p: DebateParticipant) => p.user_id === session.user.id
            );
            if (participant) {
              setUserRole(participant.side as any);
              fetchLiveKitToken();
            } else if (session.user.role === "ADMIN") {
              setShowJoinOptions(true);
            } else {
              // Audience
              fetchLiveKitToken();
            }
          }

          // Set participants
          if (data.debate.participants) {
            setForParticipants(
              data.debate.participants.filter((p: DebateParticipant) => p.side === "FOR")
            );
            setAgainstParticipants(
              data.debate.participants.filter((p: DebateParticipant) => p.side === "AGAINST")
            );
          }
        }
      } catch (error) {
        console.error("Failed to fetch debate:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDebate();
  }, [params.id, session?.user?.id, session?.user?.role]);

  // Handle voting
  const handleVote = (side: "FOR" | "AGAINST") => {
    setUserVote(side);
    toast.success(`Voted for ${side.toLowerCase()}!`);
  };

  // Add poll option
  const addPollOption = () => {
    setPollOptions([...pollOptions, ""]);
  };

  // Remove poll option
  const removePollOption = (index: number) => {
    if (pollOptions.length > 2) {
      const newOptions = [...pollOptions];
      newOptions.splice(index, 1);
      setPollOptions(newOptions);
    }
  };

  // Create poll
  const createPoll = () => {
    if (!pollQuestion.trim()) {
      toast.error("Please enter a poll question");
      return;
    }
    const validOptions = pollOptions.filter(opt => opt.trim() !== "");
    if (validOptions.length < 2) {
      toast.error("Please add at least 2 options");
      return;
    }
    const newPoll: Poll = {
      id: Date.now().toString(),
      question: pollQuestion,
      options: validOptions,
      votes: {},
    };
    setCurrentPoll(newPoll);
    setShowPollModal(false);
    setPollQuestion("");
    setPollOptions(["", ""]);
    toast.success("Poll created!");
  };

  // Vote in poll
  const voteInPoll = (option: string) => {
    if (!session?.user?.id) return;
    if (!currentPoll) return;
    setCurrentPoll({
      ...currentPoll,
      votes: {
        ...currentPoll.votes,
        [session.user.id]: option,
      },
    });
    setUserPollVote(option);
    toast.success(`Voted for: ${option}`);
  };

  // Fetch LiveKit token
  const fetchLiveKitToken = async () => {
    try {
      const res = await fetch("/api/livekit/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomName: `debate-${params.id}`,
          participantName: session?.user?.name || "Anonymous",
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setLivekitToken(data.token);
        setLivekitWsUrl(data.wsUrl);
      } else {
        console.error("Failed to get LiveKit token");
      }
    } catch (error) {
      console.error("Error fetching LiveKit token:", error);
    }
  };

  // Join as host
  const joinAsHost = () => {
    setUserRole("HOST");
    setShowJoinOptions(false);
    fetchLiveKitToken();
  };

  // Join as participant (for or against)
  const joinAsParticipant = async (side: "FOR" | "AGAINST") => {
    try {
      const res = await fetch(`/api/debates/${params.id}/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: "PARTICIPANT", side }),
      });

      if (res.ok) {
        setUserRole(side);
        setShowJoinOptions(false);
        fetchLiveKitToken();
        toast.success(`Joined as ${side.toLowerCase()}!`);
        
        // Refresh debate data
        const refreshRes = await fetch(`/api/debates/${params.id}`);
        if (refreshRes.ok) {
          const data = await refreshRes.json();
          setDebate(data.debate);
          if (data.debate.participants) {
            setForParticipants(
              data.debate.participants.filter((p: DebateParticipant) => p.side === "FOR")
            );
            setAgainstParticipants(
              data.debate.participants.filter((p: DebateParticipant) => p.side === "AGAINST")
            );
          }
        }
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to join debate");
      }
    } catch (error) {
      console.error("Failed to join debate:", error);
      toast.error("Failed to join debate");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050A14] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-accent-blue" />
          <p className="text-gray-400">Loading debate...</p>
        </div>
      </div>
    );
  }

  if (!debate) {
    return (
      <div className="min-h-screen bg-[#050A14] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Debate not found</h2>
          <p className="text-gray-400">The debate you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050A14] text-white">
      {/* Top Bar */}
      <div className="border-b border-white/10 bg-[#050A14]/95 backdrop-blur-sm p-4 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all">
            <Share2 size={18} className="text-gray-400" />
            <span className="text-sm font-semibold text-gray-300">Share</span>
          </button>

          <div className="flex-1 px-4">
            <h1 className="text-center text-lg md:text-xl font-bold text-white truncate">
              {debate?.topic}
            </h1>
          </div>

          <button className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all">
            <User size={18} className="text-gray-400" />
            <span className="text-sm font-semibold text-gray-300">Profile</span>
          </button>
        </div>
      </div>

      {/* Join Options for Admins */}
      {showJoinOptions && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-[#111827] rounded-[32px] border border-white/10 p-8 max-w-md w-full shadow-2xl">
            <h2 className="text-2xl font-bold text-white mb-6 text-center">Join Debate</h2>
            <div className="space-y-4">
              <button
                onClick={joinAsHost}
                className="w-full px-6 py-4 bg-accent-blue hover:bg-accent-blue/90 text-white font-bold rounded-xl transition-all"
              >
                Join as Host
              </button>
              <button
                onClick={() => joinAsParticipant("FOR")}
                className="w-full px-6 py-4 bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl transition-all"
              >
                Join as For
              </button>
              <button
                onClick={() => joinAsParticipant("AGAINST")}
                className="w-full px-6 py-4 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl transition-all"
              >
                Join as Against
              </button>
              <button
                onClick={() => {
                  setShowJoinOptions(false);
                  setUserRole("AUDIENCE");
                  fetchLiveKitToken();
                }}
                className="w-full px-6 py-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold rounded-xl transition-all"
              >
                Join as Audience
              </button>
            </div>
          </div>
        </div>
      )}

      {/* LiveKit Room */}
      {livekitToken && livekitWsUrl ? (
        <LiveKitRoom
          token={livekitToken}
          serverUrl={livekitWsUrl}
          connect={true}
          video={userRole !== "AUDIENCE"}
          audio={userRole !== "AUDIENCE"}
        >
          <RoomAudioRenderer />
          <VideoConference />
        </LiveKitRoom>
      ) : (
        <div className="p-4 md:p-8 text-center">
          <p className="text-gray-400">Loading debate...</p>
        </div>
      )}
    </div>
  );
}
