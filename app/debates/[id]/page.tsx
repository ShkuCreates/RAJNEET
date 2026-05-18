"use client";

import { useState, useEffect } from "react";
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
  VolumeX
} from "lucide-react";

type Participant = {
  id: string;
  name: string;
  avatar?: string;
  side: "FOR" | "AGAINST" | "HOST";
  isMicOn: boolean;
  isCameraOn: boolean;
  isHandRaised: boolean;
};

export default function DebateRoomPage({ params }: { params: { id: string } }) {
  const [votedFor, setVotedFor] = useState<boolean | null>(null);
  const [votesFor, setVotesFor] = useState(124);
  const [votesAgainst, setVotesAgainst] = useState(89);
  const [audienceCount] = useState(456);
  const [timeRemaining] = useState("42:15");
  const [isParticipant] = useState(true); // Assume participant for now, you'd get this from your data
  const [permissionsRequested, setPermissionsRequested] = useState(false);

  const [isHost] = useState(true);
  const [isForSideMuted, setIsForSideMuted] = useState(false);
  const [isAgainstSideMuted, setIsAgainstSideMuted] = useState(false);

  useEffect(() => {
    const requestMediaPermissions = async () => {
      if (!isParticipant || permissionsRequested) return;

      try {
        await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        console.log("Camera and microphone permissions granted!");
      } catch (error) {
        console.warn("Could not get camera/microphone permissions:", error);
      } finally {
        setPermissionsRequested(true);
      }
    };

    requestMediaPermissions();
  }, [isParticipant, permissionsRequested]);

  const [hostParticipant, setHostParticipant] = useState<Participant>({
    id: "host1",
    name: "Host Name",
    side: "HOST",
    isMicOn: true,
    isCameraOn: true,
    isHandRaised: false,
  });

  const [forParticipants, setForParticipants] = useState<Participant[]>([
    { id: "for1", name: "Participant 1", side: "FOR", isMicOn: true, isCameraOn: true, isHandRaised: false },
    { id: "for2", name: "Participant 2", side: "FOR", isMicOn: false, isCameraOn: true, isHandRaised: true },
    { id: "for3", name: "Participant 3", side: "FOR", isMicOn: true, isCameraOn: false, isHandRaised: false },
  ]);

  const [againstParticipants, setAgainstParticipants] = useState<Participant[]>([
    { id: "against1", name: "Participant A", side: "AGAINST", isMicOn: true, isCameraOn: true, isHandRaised: false },
    { id: "against2", name: "Participant B", side: "AGAINST", isMicOn: false, isCameraOn: true, isHandRaised: false },
  ]);

  const mockDebate = {
    id: params.id,
    topic: "Should India implement universal basic income?",
  };

  const handleVoteFor = () => {
    if (votedFor === true) return;
    if (votedFor === false) {
      setVotesAgainst(v => v - 1);
    }
    setVotesFor(v => v + 1);
    setVotedFor(true);
  };

  const handleVoteAgainst = () => {
    if (votedFor === false) return;
    if (votedFor === true) {
      setVotesFor(v => v - 1);
    }
    setVotesAgainst(v => v + 1);
    setVotedFor(false);
  };

  const toggleParticipantMic = (id: string, side: "FOR" | "AGAINST" | "HOST") => {
    if (side === "HOST") {
      setHostParticipant(p => ({ ...p, isMicOn: !p.isMicOn }));
    } else if (side === "FOR") {
      setForParticipants(ps => ps.map(p => 
        p.id === id ? { ...p, isMicOn: !p.isMicOn } : p
      ));
    } else {
      setAgainstParticipants(ps => ps.map(p => 
        p.id === id ? { ...p, isMicOn: !p.isMicOn } : p
      ));
    }
  };

  const toggleParticipantCamera = (id: string, side: "FOR" | "AGAINST" | "HOST") => {
    if (side === "HOST") {
      setHostParticipant(p => ({ ...p, isCameraOn: !p.isCameraOn }));
    } else if (side === "FOR") {
      setForParticipants(ps => ps.map(p => 
        p.id === id ? { ...p, isCameraOn: !p.isCameraOn } : p
      ));
    } else {
      setAgainstParticipants(ps => ps.map(p => 
        p.id === id ? { ...p, isCameraOn: !p.isCameraOn } : p
      ));
    }
  };

  const toggleHandRaise = (id: string, side: "FOR" | "AGAINST") => {
    if (side === "FOR") {
      setForParticipants(ps => ps.map(p => 
        p.id === id ? { ...p, isHandRaised: !p.isHandRaised } : p
      ));
    } else {
      setAgainstParticipants(ps => ps.map(p => 
        p.id === id ? { ...p, isHandRaised: !p.isHandRaised } : p
      ));
    }
  };

  const toggleSideMute = (side: "FOR" | "AGAINST") => {
    if (side === "FOR") {
      setIsForSideMuted(!isForSideMuted);
    } else {
      setIsAgainstSideMuted(!isAgainstSideMuted);
    }
  };

  const ParticipantCard = ({ participant }: { participant: Participant }) => {
    const isMuted = participant.side === "FOR" && isForSideMuted || 
                     participant.side === "AGAINST" && isAgainstSideMuted ||
                     !participant.isMicOn;

    return (
      <div className={`relative flex-1 bg-[#0F172A] border-2 rounded-xl p-3 flex flex-col items-center justify-center min-h-[150px] ${
        participant.side === "HOST" ? "border-accent-blue/30" :
        participant.side === "FOR" ? "border-green-500/30" :
        "border-red-500/30"
      }`}>
        <div className="relative">
          <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-white/10 border border-white/20 flex items-center justify-center">
            {participant.isCameraOn ? (
              <User size={32} className="text-gray-400" />
            ) : (
              <VideoOff size={32} className="text-gray-500" />
            )}
          </div>
          {participant.isHandRaised && (
            <div className="absolute -top-2 -right-2 bg-yellow-500 text-black rounded-full p-1">
              <HandHelping size={14} />
            </div>
          )}
        </div>
        
        <p className="text-white text-sm font-semibold mt-2 truncate w-full text-center">
          {participant.name}
        </p>

        <div className="flex items-center gap-2 mt-2">
          <button
            onClick={() => toggleParticipantMic(participant.id, participant.side)}
            className="p-2 rounded-lg bg-white/10 hover:bg-white/20"
          >
            {isMuted ? <MicOff size={16} className="text-red-400" /> : <Mic size={16} className="text-green-400" />}
          </button>
          <button
            onClick={() => toggleParticipantCamera(participant.id, participant.side)}
            className="p-2 rounded-lg bg-white/10 hover:bg-white/20"
          >
            {participant.isCameraOn ? <Video size={16} className="text-green-400" /> : <VideoOff size={16} className="text-gray-400" />}
          </button>
          {participant.side !== "HOST" && (
            <button
              onClick={() => toggleHandRaise(participant.id, participant.side as "FOR" | "AGAINST")}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20"
            >
              <Hand size={16} className={participant.isHandRaised ? "text-yellow-400" : "text-gray-400"} />
            </button>
          )}
        </div>
      </div>
    );
  };

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
              {mockDebate.topic}
            </h1>
          </div>

          <button className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all">
            <User size={18} className="text-gray-400" />
            <span className="text-sm font-semibold text-gray-300">Profile</span>
          </button>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="border-b border-white/10 bg-[#111827] p-4">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-center gap-6 md:gap-12">
          <div className="flex items-center gap-2">
            <Users size={18} className="text-accent-blue" />
            <span className="text-sm md:text-base font-semibold text-white">
              {audienceCount} <span className="text-gray-400">Audience</span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Timer size={18} className="text-accent-red" />
            <span className="text-sm md:text-base font-mono font-bold text-white">
              {timeRemaining}
            </span>
          </div>
        </div>
      </div>

      {/* Main Debate Stage */}
      <div className="p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] gap-4 md:gap-8 items-start">
            {/* AGAINST Side */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-2xl md:text-3xl font-bold text-red-500">Against</h2>
                {isHost && (
                  <button
                    onClick={() => toggleSideMute("AGAINST")}
                    className="flex items-center gap-2 px-3 py-2 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10"
                  >
                    {isAgainstSideMuted ? <VolumeX size={16} className="text-red-400" /> : <Volume2 size={16} className="text-gray-400" />}
                    <span className="text-sm">
                      {isAgainstSideMuted ? "Unmute Side" : "Mute Side"}
                    </span>
                  </button>
                )}
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {againstParticipants.map(p => (
                  <ParticipantCard key={p.id} participant={p} />
                ))}
              </div>

              <button
                onClick={handleVoteAgainst}
                disabled={votedFor === false}
                className={`w-full py-4 md:py-6 rounded-2xl font-bold text-lg md:text-xl transition-all mt-2 ${
                  votedFor === false
                    ? "bg-red-500 text-white"
                    : "bg-white/5 border border-white/10 hover:bg-white/10 text-gray-300 hover:text-white"
                }`}
              >
                <span className="flex items-center justify-center gap-2">
                  <ThumbsUp size={20} />
                  Vote Against ({votesAgainst})
                </span>
              </button>
            </div>

            {/* HOST Center */}
            <div className="flex flex-col justify-center w-full lg:w-auto">
              <div className="text-center mb-2">
                <h2 className="text-xl md:text-2xl font-bold text-accent-blue">Host</h2>
              </div>
              
              <ParticipantCard participant={hostParticipant} />
            </div>

            {/* FOR Side */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-2xl md:text-3xl font-bold text-green-500">For</h2>
                {isHost && (
                  <button
                    onClick={() => toggleSideMute("FOR")}
                    className="flex items-center gap-2 px-3 py-2 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10"
                  >
                    {isForSideMuted ? <VolumeX size={16} className="text-red-400" /> : <Volume2 size={16} className="text-gray-400" />}
                    <span className="text-sm">
                      {isForSideMuted ? "Unmute Side" : "Mute Side"}
                    </span>
                  </button>
                )}
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {forParticipants.map(p => (
                  <ParticipantCard key={p.id} participant={p} />
                ))}
              </div>

              <button
                onClick={handleVoteFor}
                disabled={votedFor === true}
                className={`w-full py-4 md:py-6 rounded-2xl font-bold text-lg md:text-xl transition-all mt-2 ${
                  votedFor === true
                    ? "bg-green-500 text-white"
                    : "bg-white/5 border border-white/10 hover:bg-white/10 text-gray-300 hover:text-white"
                }`}
              >
                <span className="flex items-center justify-center gap-2">
                  <ThumbsUp size={20} />
                  Vote For ({votesFor})
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
