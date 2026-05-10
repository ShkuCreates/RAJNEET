"use client";

import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { ThumbsUp, ThumbsDown, Flag, AlertTriangle, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

export default function DebateSection({ newsId, currentUser }: { newsId: string; currentUser: any }) {
  const [stance, setStance] = useState<string | null>(null);
  const [comment, setComment] = useState("");
  const [tag, setTag] = useState("OPINION");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Mock comments for now
  const [comments, setComments] = useState<any[]>([
    {
      id: "1",
      user: { name: "Anil Sharma", role: "LAWYER", avatar_url: null },
      stance: "FOR",
      comment: "According to the recent supreme court ruling, this action is entirely legal and necessary.",
      tag: "FACT",
      upvotes: 12,
      downvotes: 1,
      created_at: new Date(Date.now() - 3600000),
    },
    {
      id: "2",
      user: { name: "Rahul Verma", role: "CITIZEN", avatar_url: null },
      stance: "AGAINST",
      comment: "This will only cause more problems for the common man.",
      tag: "OPINION",
      upvotes: 5,
      downvotes: 8,
      created_at: new Date(Date.now() - 7200000),
    }
  ]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stance) {
      toast.error("You must select a stance before commenting.");
      return;
    }
    if (!comment.trim()) return;

    setIsSubmitting(true);
    // Here we would typically make an API call to save the opinion
    setTimeout(() => {
      setComments([
        {
          id: Date.now().toString(),
          user: currentUser,
          stance,
          comment,
          tag,
          upvotes: 0,
          downvotes: 0,
          created_at: new Date(),
        },
        ...comments,
      ]);
      setComment("");
      setIsSubmitting(false);
      toast.success("Opinion posted successfully");
    }, 500);
  };

  const getTagStyle = (t: string) => {
    switch(t) {
      case "FACT": return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case "OPINION": return "bg-gray-500/10 text-gray-500 border-gray-500/20";
      case "ALLEGATION": return "bg-red-500/10 text-red-500 border-red-500/20";
      case "SATIRE": return "bg-purple-500/10 text-purple-500 border-purple-500/20";
      default: return "bg-gray-500/10 text-gray-500 border-gray-500/20";
    }
  };

  return (
    <div className="text-left w-full">
      {/* Live Opinion Bar */}
      <div className="mb-6">
        <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Live Public Opinion</h4>
        <div className="w-full h-3 rounded-full flex overflow-hidden">
          <div className="bg-green-500" style={{ width: '45%' }} title="For: 45%" />
          <div className="bg-gray-400" style={{ width: '20%' }} title="Neutral: 20%" />
          <div className="bg-red-500" style={{ width: '35%' }} title="Against: 35%" />
        </div>
        <div className="flex justify-between text-[10px] font-bold mt-1 text-muted-foreground">
          <span className="text-green-500">45% FOR</span>
          <span className="text-gray-400">20% NEUTRAL</span>
          <span className="text-red-500">35% AGAINST</span>
        </div>
      </div>

      {/* Post Opinion Form */}
      <div className="mb-8 p-4 border border-border rounded-lg bg-secondary/5">
        {!stance && (
          <div className="mb-4">
            <p className="text-sm font-semibold mb-2">Select your stance to enter the debate:</p>
            <div className="flex gap-2">
              <button onClick={() => setStance("FOR")} className="flex-1 py-2 text-sm font-bold bg-green-500/10 text-green-600 border border-green-500/20 rounded hover:bg-green-500 hover:text-white transition-colors">FOR</button>
              <button onClick={() => setStance("NEUTRAL")} className="flex-1 py-2 text-sm font-bold bg-gray-500/10 text-gray-600 border border-gray-500/20 rounded hover:bg-gray-500 hover:text-white transition-colors">NEUTRAL</button>
              <button onClick={() => setStance("AGAINST")} className="flex-1 py-2 text-sm font-bold bg-red-500/10 text-red-600 border border-red-500/20 rounded hover:bg-red-500 hover:text-white transition-colors">AGAINST</button>
            </div>
          </div>
        )}

        {stance && (
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="flex items-center justify-between">
              <span className={`text-xs font-bold px-2 py-1 rounded text-white ${
                stance === "FOR" ? "bg-green-500" : stance === "NEUTRAL" ? "bg-gray-500" : "bg-red-500"
              }`}>
                YOUR STANCE: {stance}
              </span>
              <button type="button" onClick={() => setStance(null)} className="text-xs text-muted-foreground hover:underline">Change</button>
            </div>
            
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="State your argument..."
              className="w-full p-3 text-sm bg-background border border-input rounded resize-none focus:ring-1 focus:ring-primary"
              rows={3}
              required
            />
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-muted-foreground">Tag as:</span>
                <select 
                  value={tag} 
                  onChange={(e) => setTag(e.target.value)}
                  className="text-xs p-1 border border-input rounded bg-background"
                >
                  <option value="OPINION">Opinion</option>
                  <option value="FACT">Fact</option>
                  <option value="ALLEGATION">Allegation</option>
                  <option value="SATIRE">Satire</option>
                </select>
              </div>
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="bg-primary text-primary-foreground px-4 py-1.5 text-sm font-medium rounded hover:bg-primary/90 disabled:opacity-50"
              >
                {isSubmitting ? "Posting..." : "Post Opinion"}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Comments List */}
      <div className="space-y-4">
        {comments.map((c) => (
          <div key={c.id} className={`p-4 border rounded-lg ${
            c.user.role === "LAWYER" || c.user.role === "JOURNALIST" ? "border-primary/50 bg-primary/5" : "border-border bg-card"
          }`}>
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${
                  c.stance === "FOR" ? "bg-green-500" : c.stance === "NEUTRAL" ? "bg-gray-500" : "bg-red-500"
                }`} />
                <span className="text-sm font-semibold">{c.user.name}</span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                  {c.user.role}
                </span>
                {(c.user.role === "LAWYER" || c.user.role === "JOURNALIST") && (
                  <ShieldCheck size={14} className="text-primary" />
                )}
                <span className="text-xs text-muted-foreground ml-2">
                  {formatDistanceToNow(c.created_at, { addSuffix: true })}
                </span>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${getTagStyle(c.tag)}`}>
                {c.tag}
              </span>
            </div>
            
            <p className="text-sm text-foreground mb-3 pl-4 border-l-2 border-border">
              {c.comment}
            </p>
            
            <div className="flex items-center gap-4 text-xs text-muted-foreground pl-4">
              <button className="flex items-center gap-1 hover:text-green-500 transition-colors">
                <ThumbsUp size={14} /> {c.upvotes}
              </button>
              <button className="flex items-center gap-1 hover:text-red-500 transition-colors">
                <ThumbsDown size={14} /> {c.downvotes}
              </button>
              <button className="flex items-center gap-1 hover:text-primary transition-colors ml-2">
                Reply
              </button>
              {c.tag === "FACT" && currentUser?.role === "LAWYER" && (
                <button className="flex items-center gap-1 hover:text-destructive transition-colors ml-auto text-destructive/70">
                  <Flag size={14} /> Flag
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
