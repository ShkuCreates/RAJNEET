"use client";

import { useState, useEffect, useRef } from "react";
import {
  Share2,
  User,
  Users,
  ThumbsUp,
  Timer,
  Mic,
  MicOff,
  Video,
  VideoOff,
  Hand,
  HandHelping,
  Volume2,
  VolumeX,
  Loader2,
  X
} from "lucide-react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";

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

export default function DebateRoomPage({ params }: { params: { id: string } }) {
  const { data: session } = useSession();
  const [debate, setDebate] = useState<Debate | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<"AUDIENCE" | "FOR" | "AGAINST" | "HOST">("AUDIENCE");
  const [showJoinOptions, setShowJoinOptions] = useState(false);

  // Media state
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const localVideoRef = useRef<HTMLVideoElement>(null);

  // Mock participants for now
  const [forParticipants, setForParticipants] = useState<any[]>([]);
  const [againstParticipants, setAgainstParticipants] = useState<any[]>([]);
  const [hostParticipant, setHostParticipant] = useState<any>(null);

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
            } else if (session.user.role === "ADMIN") {
              setShowJoinOptions(true);
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

  // Request media permissions and start local stream
  const startLocalStream = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      setLocalStream(stream);
      
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      
      toast.success("Camera and mic permissions granted!");
    } catch (error) {
      console.error("Failed to get media permissions:", error);
      toast.error("Could not access camera/microphone");
    }
  };

  // Toggle mic
  const toggleMic = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMicOn(audioTrack.enabled);
      }
    }
  };

  // Toggle camera
  const toggleCamera = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsCameraOn(videoTrack.enabled);
      }
    }
  };

  // Join as host
  const joinAsHost = () => {
    setUserRole("HOST");
    setShowJoinOptions(false);
    startLocalStream();
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
        startLocalStream();
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
              {debate.topic}
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
                onClick={() => setShowJoinOptions(false)}
                className="w-full px-6 py-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold rounded-xl transition-all"
              >
                Join as Audience
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Take Your Seat Screen */}
      {(userRole === "FOR" || userRole === "AGAINST" || userRole === "HOST") && !localStream && (
        <div className="min-h-[80vh] flex items-center justify-center">
          <div className="text-center rounded-[32px] border border-white/10 bg-[#111827] p-12 shadow-2xl max-w-lg">
            <div className="w-20 h-20 mx-auto mb-6 bg-accent-blue/10 rounded-full flex items-center justify-center">
              <Video size={40} className="text-accent-blue" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-4">Take Your Seat</h2>
            <p className="text-gray-400 mb-8">
              To participate in the debate, we need access to your camera and microphone.
            </p>
            <button
              onClick={startLocalStream}
              className="w-full px-8 py-4 bg-accent-blue hover:bg-accent-blue/90 text-white font-bold rounded-xl transition-all text-lg"
            >
              Allow Camera & Microphone
            </button>
          </div>
        </div>
      )}

      {/* Main Debate Stage */}
      {(userRole === "AUDIENCE" || localStream) && (
        <div className="p-4 md:p-8">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] gap-4 md:gap-8 items-start">
              {/* AGAINST Side */}
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-2xl md:text-3xl font-bold text-red-500">Against</h2>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {againstParticipants.map((p) => (
                    <div
                      key={p.id}
                      className="relative flex-1 bg-[#0F172A] border-2 border-red-500/30 rounded-xl p-3 flex flex-col items-center justify-center min-h-[150px]"
                    >
                      <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-white/10 border border-white/20 flex items-center justify-center">
                        {p.user?.avatar_url ? (
                          <img src={p.user.avatar_url} alt={p.user.name} className="w-full h-full rounded-full object-cover" />
                        ) : (
                          <User size={32} className="text-gray-400" />
                        )}
                      </div>
                      <p className="text-white text-sm font-semibold mt-2 truncate w-full text-center">
                        {p.user?.name}
                      </p>
                    </div>
                  ))}
                </div>

                {userRole === "AUDIENCE" && (
                  <button className="w-full py-4 md:py-6 rounded-2xl font-bold text-lg md:text-xl transition-all mt-2 bg-white/5 border border-white/10 hover:bg-white/10 text-gray-300 hover:text-white">
                    <span className="flex items-center justify-center gap-2">
                      <ThumbsUp size={20} />
                      Vote Against
                    </span>
                  </button>
                )}
              </div>

              {/* HOST Center */}
              <div className="flex flex-col justify-center w-full lg:w-auto">
                <div className="text-center mb-2">
                  <h2 className="text-xl md:text-2xl font-bold text-accent-blue">Host</h2>
                </div>
                
                <div className="relative flex-1 bg-[#0F172A] border-2 border-accent-blue/30 rounded-xl p-3 flex flex-col items-center justify-center min-h-[150px]">
                  <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-white/10 border border-white/20 flex items-center justify-center">
                    <User size={32} className="text-gray-400" />
                  </div>
                  <p className="text-white text-sm font-semibold mt-2 truncate w-full text-center">
                    Host
                  </p>
                </div>
              </div>

              {/* FOR Side */}
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-2xl md:text-3xl font-bold text-green-500">For</h2>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {forParticipants.map((p) => (
                    <div
                      key={p.id}
                      className="relative flex-1 bg-[#0F172A] border-2 border-green-500/30 rounded-xl p-3 flex flex-col items-center justify-center min-h-[150px]"
                    >
                      <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-white/10 border border-white/20 flex items-center justify-center">
                        {p.user?.avatar_url ? (
                          <img src={p.user.avatar_url} alt={p.user.name} className="w-full h-full rounded-full object-cover" />
                        ) : (
                          <User size={32} className="text-gray-400" />
                        )}
                      </div>
                      <p className="text-white text-sm font-semibold mt-2 truncate w-full text-center">
                        {p.user?.name}
                      </p>
                    </div>
                  ))}
                </div>

                {userRole === "AUDIENCE" && (
                  <button className="w-full py-4 md:py-6 rounded-2xl font-bold text-lg md:text-xl transition-all mt-2 bg-white/5 border border-white/10 hover:bg-white/10 text-gray-300 hover:text-white">
                    <span className="flex items-center justify-center gap-2">
                      <ThumbsUp size={20} />
                      Vote For
                    </span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Local Controls for Participants */}
          {localStream && (
            <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-[#111827] border border-white/10 rounded-2xl p-4 flex items-center gap-4 shadow-2xl">
              <button
                onClick={toggleMic}
                className="p-4 rounded-xl bg-white/10 hover:bg-white/20 transition-colors"
              >
                {isMicOn ? <Mic size={24} className="text-green-400" /> : <MicOff size={24} className="text-red-400" />}
              </button>
              <button
                onClick={toggleCamera}
                className="p-4 rounded-xl bg-white/10 hover:bg-white/20 transition-colors"
              >
                {isCameraOn ? <Video size={24} className="text-green-400" /> : <VideoOff size={24} className="text-gray-400" />}
              </button>
            </div>
          )}

          {/* Local Video Preview */}
          {localStream && (
            <div className="fixed bottom-8 right-8 w-48 h-36 rounded-xl overflow-hidden border border-white/10 bg-black shadow-2xl">
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
