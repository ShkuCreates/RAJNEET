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
  useParticipants,
  useLocalParticipant,
  ParticipantTile,
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

function DebateContent({
  debate,
  userRole,
  userVote,
  handleVote,
  currentPoll,
  userPollVote,
  voteInPoll,
  setShowPollModal
}: any) {
  const participants = useParticipants();
  const localParticipant = useLocalParticipant();

  return (
    <>
      <RoomAudioRenderer />
      
      {/* Main Debate Stage */}
      <div className="p-4 md:p-8">
        {userRole === "HOST" && (
          <div className="max-w-7xl mx-auto mb-6">
            <button
              onClick={() => setShowPollModal(true)}
              className="px-6 py-3 bg-accent-blue hover:bg-accent-blue/90 text-white font-bold rounded-xl transition-all flex items-center gap-2"
            >
              + Create Poll
            </button>
          </div>
        )}
        
        {currentPoll && (
          <div className="max-w-2xl mx-auto mb-8">
            <div className="bg-[#111827] border border-white/10 rounded-[32px] p-6 shadow-2xl">
              <h3 className="text-xl font-bold text-white mb-6">{currentPoll.question}</h3>
              <div className="space-y-3">
                {(() => {
                  const totalVotes = Object.keys(currentPoll.votes).length;
                  return (
                    <>
                      {currentPoll.options.map((option: string, index: number) => {
                        const voteCount = Object.values(currentPoll.votes).filter((v: string) => v === option).length;
                        const percentage = totalVotes > 0 ? (voteCount / totalVotes) * 100 : 0;
                        const isSelected = userPollVote === option;
                        
                        return (
                          <button
                            key={index}
                            onClick={() => userRole === "AUDIENCE" && voteInPoll(option)}
                            disabled={userRole !== "AUDIENCE"}
                            className={`w-full p-4 rounded-xl border transition-all text-left ${
                              isSelected 
                                ? 'bg-accent-blue/20 border-accent-blue/50' 
                                : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                            } ${userRole !== "AUDIENCE" ? 'cursor-default' : ''}`}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-white font-semibold">{option}</span>
                              <span className="text-sm text-gray-400">{voteCount} {voteCount === 1 ? 'vote' : 'votes'}</span>
                            </div>
                            <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                              <div 
                                className={`h-full transition-all duration-500 ${isSelected ? 'bg-accent-blue' : 'bg-white/30'}`}
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                          </button>
                        );
                      })}
                      {totalVotes > 0 && (
                        <p className="text-center text-sm text-gray-400 mt-4">
                          {totalVotes} {totalVotes === 1 ? 'person voted' : 'people voted'}
                        </p>
                      )}
                    </>
                  );
                })()}
              </div>
            </div>
          </div>
        )}
        
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-8">
            {/* AGAINST Side */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-2xl md:text-3xl font-bold text-red-500">Against</h2>
              </div>
              
              <div className="grid grid-cols-1 gap-3">
                {participants
                  .filter((p: any) => p.identity !== localParticipant?.identity)
                  .map((p: any, idx: number) => (
                    <div
                      key={p.identity}
                      className="relative flex-1 bg-[#0F172A] border-2 border-red-500/30 rounded-2xl p-4 flex flex-col items-center justify-center min-h-[200px] overflow-hidden"
                    >
                      <ParticipantTile participant={p} />
                    </div>
                  ))}
                {localParticipant && (
                  <div
                    className="relative flex-1 bg-[#0F172A] border-2 border-red-500/30 rounded-2xl p-4 flex flex-col items-center justify-center min-h-[200px] overflow-hidden"
                  >
                    <ParticipantTile participant={localParticipant} />
                  </div>
                )}
              </div>

              {(userRole === "AUDIENCE" || userRole === "HOST") && (
                <button 
                  onClick={() => handleVote("AGAINST")}
                  className={`w-full py-4 md:py-6 rounded-2xl font-bold text-lg md:text-xl transition-all mt-2 ${userVote === "AGAINST" ? 'bg-red-500 border-red-500' : 'bg-white/5 border-white/10 hover:bg-white/10'} border text-gray-300 hover:text-white`}
                >
                  <span className="flex items-center justify-center gap-2">
                    <ThumbsUp size={20} />
                    {userVote === "AGAINST" ? 'Voted Against' : 'Vote Against'}
                  </span>
                </button>
              )}
            </div>

            {/* HOST Center */}
            <div className="flex flex-col justify-center">
              <div className="text-center mb-2">
                <h2 className="text-xl md:text-2xl font-bold text-accent-blue">Host</h2>
              </div>
            </div>

            {/* FOR Side */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-2xl md:text-3xl font-bold text-green-500">For</h2>
              </div>
              
              <div className="grid grid-cols-1 gap-3">
                {participants
                  .filter((p: any) => p.identity !== localParticipant?.identity)
                  .map((p: any, idx: number) => (
                    <div
                      key={p.identity}
                      className="relative flex-1 bg-[#0F172A] border-2 border-green-500/30 rounded-2xl p-4 flex flex-col items-center justify-center min-h-[200px] overflow-hidden"
                    >
                      <ParticipantTile participant={p} />
                    </div>
                  ))}
              </div>

              {(userRole === "AUDIENCE" || userRole === "HOST") && (
                <button 
                  onClick={() => handleVote("FOR")}
                  className={`w-full py-4 md:py-6 rounded-2xl font-bold text-lg md:text-xl transition-all mt-2 ${userVote === "FOR" ? 'bg-green-500 border-green-500' : 'bg-white/5 border-white/10 hover:bg-white/10'} border text-gray-300 hover:text-white`}
                >
                  <span className="flex items-center justify-center gap-2">
                    <ThumbsUp size={20} />
                    {userVote === "FOR" ? 'Voted For' : 'Vote For'}
                  </span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Vote Tracker */}
        <div className="max-w-4xl mx-auto mt-12 mb-8">
          <div className="bg-[#111827] border border-white/10 rounded-[32px] p-6 shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-6 text-center">Current Votes</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
              {/* Against */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-lg font-bold text-red-400">Against</span>
                  <span className="text-gray-400">
                    {userVote === "AGAINST" ? "Your Vote" : "0%"}
                  </span>
                </div>
                <div className="w-full h-4 bg-white/10 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-500 ${userVote === "AGAINST" ? 'bg-red-500' : 'bg-red-500/30'}`}
                    style={{ width: userVote === "AGAINST" ? "50%" : "0%" }}
                  />
                </div>
              </div>

              {/* For */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-lg font-bold text-green-400">For</span>
                  <span className="text-gray-400">
                    {userVote === "FOR" ? "Your Vote" : "0%"}
                  </span>
                </div>
                <div className="w-full h-4 bg-white/10 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-500 ${userVote === "FOR" ? 'bg-green-500' : 'bg-green-500/30'}`}
                    style={{ width: userVote === "FOR" ? "50%" : "0%" }}
                  />
                </div>
              </div>
            </div>
            {!userVote && (
              <p className="text-center text-gray-400 text-sm">
                Vote to see the results!
              </p>
            )}
          </div>
        </div>
      </div>

      {/* LiveKit Control Bar */}
      <ControlBar />
    </>
  );
}

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

      {/* Poll Creation Modal */}
      {showPollModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-[#111827] rounded-[32px] border border-white/10 p-8 max-w-lg w-full shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Create Poll</h2>
              <button
                onClick={() => setShowPollModal(false)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X size={20} className="text-gray-400" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Poll Question
                </label>
                <input
                  type="text"
                  value={pollQuestion}
                  onChange={(e) => setPollQuestion(e.target.value)}
                  placeholder="Enter your poll question..."
                  className="w-full px-4 py-3 bg-[#0F172A] border border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-accent-blue/50 focus:outline-none focus:ring-2 focus:ring-accent-blue/20"
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-semibold text-gray-300">
                    Options
                  </label>
                  <button
                    onClick={addPollOption}
                    className="text-sm font-semibold text-accent-blue hover:text-accent-blue/80 transition-colors"
                  >
                    + Add Option
                  </button>
                </div>
                <div className="space-y-3">
                  {pollOptions.map((option, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={option}
                        onChange={(e) => {
                          const newOptions = [...pollOptions];
                          newOptions[index] = e.target.value;
                          setPollOptions(newOptions);
                        }}
                        placeholder={`Option ${index + 1}`}
                        className="flex-1 px-4 py-3 bg-[#0F172A] border border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-accent-blue/50 focus:outline-none focus:ring-2 focus:ring-accent-blue/20"
                      />
                      {pollOptions.length > 2 && (
                        <button
                          onClick={() => removePollOption(index)}
                          className="p-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-xl text-red-400 transition-colors"
                        >
                          <X size={18} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              <button
                onClick={createPoll}
                className="w-full px-6 py-4 bg-accent-blue hover:bg-accent-blue/90 text-white font-bold rounded-xl transition-all"
              >
                Create Poll
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
          video={true}
          audio={true}
        >
          <DebateContent
            debate={debate}
            userRole={userRole}
            userVote={userVote}
            handleVote={handleVote}
            currentPoll={currentPoll}
            userPollVote={userPollVote}
            voteInPoll={voteInPoll}
            setShowPollModal={setShowPollModal}
          />
        </LiveKitRoom>
      ) : (
        <div className="p-4 md:p-8">
          {userRole === "HOST" && (
            <div className="max-w-7xl mx-auto mb-6">
              <button
                onClick={() => setShowPollModal(true)}
                className="px-6 py-3 bg-accent-blue hover:bg-accent-blue/90 text-white font-bold rounded-xl transition-all flex items-center gap-2"
              >
                + Create Poll
              </button>
            </div>
          )}
          
          {currentPoll && (
            <div className="max-w-2xl mx-auto mb-8">
              <div className="bg-[#111827] border border-white/10 rounded-[32px] p-6 shadow-2xl">
                <h3 className="text-xl font-bold text-white mb-6">{currentPoll.question}</h3>
                <div className="space-y-3">
                  {(() => {
                    const totalVotes = Object.keys(currentPoll.votes).length;
                    return (
                      <>
                        {currentPoll.options.map((option: string, index: number) => {
                          const voteCount = Object.values(currentPoll.votes).filter((v: string) => v === option).length;
                          const percentage = totalVotes > 0 ? (voteCount / totalVotes) * 100 : 0;
                          const isSelected = userPollVote === option;
                          
                          return (
                            <button
                              key={index}
                              onClick={() => userRole === "AUDIENCE" && voteInPoll(option)}
                              disabled={userRole !== "AUDIENCE"}
                              className={`w-full p-4 rounded-xl border transition-all text-left ${
                                isSelected 
                                  ? 'bg-accent-blue/20 border-accent-blue/50' 
                                  : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                              } ${userRole !== "AUDIENCE" ? 'cursor-default' : ''}`}
                            >
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-white font-semibold">{option}</span>
                                <span className="text-sm text-gray-400">{voteCount} {voteCount === 1 ? 'vote' : 'votes'}</span>
                              </div>
                              <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                                <div 
                                  className={`h-full transition-all duration-500 ${isSelected ? 'bg-accent-blue' : 'bg-white/30'}`}
                                  style={{ width: `${percentage}%` }}
                                />
                              </div>
                            </button>
                          );
                        })}
                        {totalVotes > 0 && (
                          <p className="text-center text-sm text-gray-400 mt-4">
                            {totalVotes} {totalVotes === 1 ? 'person voted' : 'people voted'}
                          </p>
                        )}
                      </>
                    );
                  })()}
                </div>
              </div>
            </div>
          )}
          
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-8">
              {/* AGAINST Side */}
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-2xl md:text-3xl font-bold text-red-500">Against</h2>
                </div>
                
                <div className="grid grid-cols-1 gap-3">
                  {againstParticipants.map((p) => {
                    const isCurrentUser = p.user_id === session?.user?.id;
                    return (
                      <div
                        key={p.id}
                        className="relative flex-1 bg-[#0F172A] border-2 border-red-500/30 rounded-2xl p-4 flex flex-col items-center justify-center min-h-[200px] overflow-hidden"
                      >
                        <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-white/10 border border-white/20 flex items-center justify-center mb-3">
                          {p.user?.avatar_url ? (
                            <img src={p.user.avatar_url} alt={p.user.name} className="w-full h-full rounded-full object-cover" />
                          ) : (
                            <User size={40} className="text-gray-400" />
                          )}
                        </div>
                        <p className="text-white text-base font-semibold truncate w-full text-center">
                          {p.user?.name}
                        </p>
                      </div>
                    );
                  })}
                </div>

                {(userRole === "AUDIENCE" || userRole === "HOST") && (
                  <button 
                    onClick={() => handleVote("AGAINST")}
                    className={`w-full py-4 md:py-6 rounded-2xl font-bold text-lg md:text-xl transition-all mt-2 ${userVote === "AGAINST" ? 'bg-red-500 border-red-500' : 'bg-white/5 border-white/10 hover:bg-white/10'} border text-gray-300 hover:text-white`}
                  >
                    <span className="flex items-center justify-center gap-2">
                      <ThumbsUp size={20} />
                      {userVote === "AGAINST" ? 'Voted Against' : 'Vote Against'}
                    </span>
                  </button>
                )}
              </div>

              {/* HOST Center */}
              <div className="flex flex-col justify-center">
                <div className="text-center mb-2">
                  <h2 className="text-xl md:text-2xl font-bold text-accent-blue">Host</h2>
                </div>
                
                <div className="relative flex-1 bg-[#0F172A] border-2 border-accent-blue/30 rounded-2xl p-4 flex flex-col items-center justify-center min-h-[200px] overflow-hidden">
                  <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-white/10 border border-white/20 flex items-center justify-center mb-3">
                    <User size={40} className="text-gray-400" />
                  </div>
                  <p className="text-white text-base font-semibold truncate w-full text-center">
                    Host
                  </p>
                </div>
              </div>

              {/* FOR Side */}
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-2xl md:text-3xl font-bold text-green-500">For</h2>
                </div>
                
                <div className="grid grid-cols-1 gap-3">
                  {forParticipants.map((p) => {
                    const isCurrentUser = p.user_id === session?.user?.id;
                    return (
                      <div
                        key={p.id}
                        className="relative flex-1 bg-[#0F172A] border-2 border-green-500/30 rounded-2xl p-4 flex flex-col items-center justify-center min-h-[200px] overflow-hidden"
                      >
                        <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-white/10 border border-white/20 flex items-center justify-center mb-3">
                          {p.user?.avatar_url ? (
                            <img src={p.user.avatar_url} alt={p.user.name} className="w-full h-full rounded-full object-cover" />
                          ) : (
                            <User size={40} className="text-gray-400" />
                          )}
                        </div>
                        <p className="text-white text-base font-semibold truncate w-full text-center">
                          {p.user?.name}
                        </p>
                      </div>
                    );
                  })}
                </div>

                {(userRole === "AUDIENCE" || userRole === "HOST") && (
                  <button 
                    onClick={() => handleVote("FOR")}
                    className={`w-full py-4 md:py-6 rounded-2xl font-bold text-lg md:text-xl transition-all mt-2 ${userVote === "FOR" ? 'bg-green-500 border-green-500' : 'bg-white/5 border-white/10 hover:bg-white/10'} border text-gray-300 hover:text-white`}
                  >
                    <span className="flex items-center justify-center gap-2">
                      <ThumbsUp size={20} />
                      {userVote === "FOR" ? 'Voted For' : 'Vote For'}
                    </span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Vote Tracker */}
          <div className="max-w-4xl mx-auto mt-12 mb-8">
            <div className="bg-[#111827] border border-white/10 rounded-[32px] p-6 shadow-2xl">
              <h3 className="text-xl font-bold text-white mb-6 text-center">Current Votes</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                {/* Against */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-lg font-bold text-red-400">Against</span>
                    <span className="text-gray-400">
                      {userVote === "AGAINST" ? "Your Vote" : "0%"}
                    </span>
                  </div>
                  <div className="w-full h-4 bg-white/10 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-500 ${userVote === "AGAINST" ? 'bg-red-500' : 'bg-red-500/30'}`}
                      style={{ width: userVote === "AGAINST" ? "50%" : "0%" }}
                    />
                  </div>
                </div>

                {/* For */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-lg font-bold text-green-400">For</span>
                    <span className="text-gray-400">
                      {userVote === "FOR" ? "Your Vote" : "0%"}
                    </span>
                  </div>
                  <div className="w-full h-4 bg-white/10 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-500 ${userVote === "FOR" ? 'bg-green-500' : 'bg-green-500/30'}`}
                      style={{ width: userVote === "FOR" ? "50%" : "0%" }}
                    />
                  </div>
                </div>
              </div>
              {!userVote && (
                <p className="text-center text-gray-400 text-sm">
                  Vote to see the results!
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
