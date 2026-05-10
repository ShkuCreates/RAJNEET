"use client";

import { useState } from "react";
import { CheckCircle2 } from "lucide-react";

export default function PollWidget({ poll }: { poll?: any }) {
  const [votedOption, setVotedOption] = useState<string | null>(null);

  // Mock Poll Data
  const mockPoll = poll || {
    id: "1",
    question: "Should local district councils have veto power over state infrastructure projects?",
    options: [
      { id: "A", text: "Yes, fully", votes: 450, percentage: 45 },
      { id: "B", text: "No, states decide", votes: 300, percentage: 30 },
      { id: "C", text: "Only on environmental grounds", votes: 250, percentage: 25 },
    ],
    totalVotes: 1000,
  };

  const handleVote = (optionId: string) => {
    if (!votedOption) setVotedOption(optionId);
  };

  return (
    <div className="border border-border rounded-lg p-4 bg-background">
      <h4 className="text-sm font-semibold mb-4 leading-tight">{mockPoll.question}</h4>
      
      <div className="space-y-3">
        {mockPoll.options.map((option: any) => (
          <div key={option.id} className="relative">
            <button
              onClick={() => handleVote(option.id)}
              disabled={!!votedOption}
              className={`w-full text-left p-3 rounded-md text-sm font-medium border transition-all z-10 relative ${
                votedOption === option.id
                  ? "border-primary bg-primary/10 text-primary"
                  : votedOption
                  ? "border-transparent bg-transparent text-foreground"
                  : "border-border hover:border-primary hover:bg-secondary/5"
              }`}
            >
              <div className="flex justify-between items-center">
                <span>{option.text}</span>
                {votedOption && (
                  <span className="font-bold">{option.percentage}%</span>
                )}
              </div>
            </button>
            
            {/* Animated Bar Background (shows only after voting) */}
            {votedOption && (
              <div 
                className={`absolute top-0 left-0 h-full rounded-md -z-0 opacity-20 transition-all duration-1000 ease-out ${
                  votedOption === option.id ? "bg-primary" : "bg-muted-foreground"
                }`}
                style={{ width: `${option.percentage}%` }}
              />
            )}
          </div>
        ))}
      </div>
      
      {votedOption && (
        <div className="mt-4 flex items-center justify-center gap-2 text-xs font-bold text-green-500 bg-green-500/10 py-1.5 rounded-md animate-in fade-in zoom-in">
          <CheckCircle2 size={14} />
          Vote Recorded! ({mockPoll.totalVotes.toLocaleString()} total votes)
        </div>
      )}
    </div>
  );
}
