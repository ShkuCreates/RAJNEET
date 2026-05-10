import { useState } from "react";
import { MessageSquare, Share2, ChevronDown, ChevronUp, MapPin, Landmark } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import DebateSection from "./DebateSection";
import WriteToMpModal from "../mp/WriteToMpModal";

export default function NewsCard({ news, currentUser }: { news: any, currentUser: any }) {
  const [expanded, setExpanded] = useState(false);
  const [stance, setStance] = useState<string | null>(null);
  const [showMpModal, setShowMpModal] = useState(false);

  const handleStance = (newStance: string) => {
    // Stance selection logic - will be fully implemented in Debate phase
    if (!stance) setStance(newStance);
  };

  return (
    <article className="border border-border bg-card rounded-xl overflow-hidden shadow-sm transition-shadow hover:shadow-md">
      {/* Card Header: Tags & Meta */}
      <div className="p-5 pb-3">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary rounded-md">
              {news.category}
            </span>
            {(news.district || news.state) && (
              <span className="flex items-center gap-1 text-xs text-muted-foreground font-medium">
                <MapPin size={12} />
                {news.district ? `${news.district}, ` : ""}
                {news.state}
              </span>
            )}
          </div>
          <span className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(news.created_at), { addSuffix: true })}
          </span>
        </div>

        {/* Headline & Summary */}
        <h2 className="text-xl md:text-2xl font-bold leading-tight mb-2 text-foreground">
          {news.headline}
        </h2>
        <p className="text-sm text-muted-foreground leading-relaxed mb-4 line-clamp-3">
          {news.summary}
        </p>

        {/* Author Info */}
        <div className="flex items-center gap-2 mb-4">
          <div className="w-6 h-6 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center text-xs font-bold shrink-0">
            {news.author?.avatar_url ? (
              <img src={news.author.avatar_url} alt="" className="w-6 h-6 rounded-full object-cover" />
            ) : (
              news.author?.name?.charAt(0) || "A"
            )}
          </div>
          <span className="text-xs font-medium text-foreground">{news.author?.name}</span>
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
            {news.author?.role}
          </span>
        </div>

        {/* Action Bar */}
        <div className="flex items-center justify-between border-t border-border pt-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleStance("FOR")}
              className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors ${
                stance === "FOR" ? "bg-green-500 text-white" : "bg-muted text-muted-foreground hover:bg-green-500/20 hover:text-green-600"
              }`}
            >
              FOR
            </button>
            <button
              onClick={() => handleStance("NEUTRAL")}
              className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors ${
                stance === "NEUTRAL" ? "bg-gray-500 text-white" : "bg-muted text-muted-foreground hover:bg-gray-500/20 hover:text-gray-600"
              }`}
            >
              NEUTRAL
            </button>
            <button
              onClick={() => handleStance("AGAINST")}
              className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors ${
                stance === "AGAINST" ? "bg-red-500 text-white" : "bg-muted text-muted-foreground hover:bg-red-500/20 hover:text-red-600"
              }`}
            >
              AGAINST
            </button>
          </div>

          <div className="flex items-center gap-4 text-muted-foreground">
            {currentUser?.district && (
              <button 
                onClick={() => setShowMpModal(true)}
                className="flex items-center gap-1.5 text-sm hover:text-primary transition-colors border border-border px-2 py-1 rounded bg-secondary/5"
                title="Write to Your MP regarding this issue"
              >
                <Landmark size={14} />
                <span className="font-medium hidden sm:inline">Write to MP</span>
              </button>
            )}
            <button className="flex items-center gap-1.5 text-sm hover:text-primary transition-colors">
              <MessageSquare size={16} />
              <span className="font-medium">{news._count?.opinions || 0}</span>
            </button>
            <button className="flex items-center gap-1.5 text-sm hover:text-primary transition-colors">
              <Share2 size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Expand Toggle */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-center gap-1 py-2 bg-secondary/5 text-xs font-semibold text-secondary-foreground hover:bg-secondary/10 transition-colors border-t border-border"
      >
        {expanded ? (
          <>Read Less <ChevronUp size={14} /></>
        ) : (
          <>Read Full Story <ChevronDown size={14} /></>
        )}
      </button>

      {/* Expanded Content */}
      {expanded && (
        <div className="p-5 border-t border-border bg-background animate-in slide-in-from-top-2 duration-200">
          {news.cover_image_url && (
            <img 
              src={news.cover_image_url} 
              alt="Cover" 
              className="w-full h-48 md:h-64 object-cover rounded-lg mb-4"
            />
          )}
          <div 
            className="prose prose-sm dark:prose-invert max-w-none mb-6 text-foreground"
            dangerouslySetInnerHTML={{ __html: news.body }} 
          />
          
          {news.source_url && (
            <a 
              href={news.source_url} 
              target="_blank" 
              rel="noreferrer"
              className="text-xs text-primary hover:underline"
            >
              Original Source ↗
            </a>
          )}

          {/* Connect to Debate System Component here later */}
          <div className="mt-6 pt-4 border-t border-border text-center">
            <DebateSection newsId={news.id} currentUser={currentUser} />
          </div>
        </div>
      )}

      {showMpModal && currentUser?.district && (
        <WriteToMpModal 
          newsHeadline={news.headline}
          userDistrict={currentUser.district}
          onClose={() => setShowMpModal(false)}
        />
      )}
    </article>
  );
}
