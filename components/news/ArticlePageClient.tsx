"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { MapPin, Clock, ExternalLink, Copy, MessageSquare, Share2, X } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useSession, signIn } from "next-auth/react";
import DebateSection from "@/components/news/DebateSection";
import { toast } from "sonner";

const SESSION_DISMISS_KEY = "article-login-modal-dismissed";

function LoginPromptModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[120] bg-black/70 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="relative w-full max-w-md rounded-2xl bg-[#111827] p-7 border border-white/10 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute right-3 top-3 p-2 text-gray-400 hover:text-white"
          aria-label="Close"
        >
          <X size={18} />
        </button>
        <div className="flex items-center justify-center mb-5">
          <img src="/images/rajneet-logo.png" alt="RAJNEET" className="h-8 w-auto" />
        </div>
        <h3 className="text-white text-2xl font-heading font-bold mb-2 text-center">
          Join the debate on RAJNEET
        </h3>
        <p className="text-gray-400 text-sm text-center mb-6">
          Login to share your stance, comment, and debate this article. Free forever.
        </p>
        <button
          onClick={() => signIn("google")}
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3"
        >
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="" className="h-4 w-4" />
          Login with Google
        </button>
        <p className="text-xs text-gray-500 text-center mt-3">
          Protected under Article 19(1)(a) of the Indian Constitution
        </p>
      </div>
    </div>
  );
}

export default function ArticlePageClient({ article }: { article: any }) {
  const { data: session, status } = useSession();
  const authResolved = status !== "loading";
  const isLoggedIn = status === "authenticated" && Boolean(session?.user);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [hasScrolledEnough, setHasScrolledEnough] = useState(false);
  const [pageLoaded, setPageLoaded] = useState(false);
  const [stanceCounts, setStanceCounts] = useState({ FOR: 0, NEUTRAL: 0, AGAINST: 0 });
  const modalShownByIntent = useRef(false);

  const stripHtml = (value: string) => value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  const normalizeImageUrl = (value?: string | null) => {
    if (!value) return "";
    if (value.startsWith("http://")) return value.replace("http://", "https://");
    if (value.startsWith("https://") || value.startsWith("/")) return value;
    return "";
  };

  const title = article.seo_title || article.headline;
  const ogUrl = `/api/og?title=${encodeURIComponent(title)}&category=${encodeURIComponent(article.category || "POLITICAL")}`;
  const normalizedCover = normalizeImageUrl(article.cover_image_url);
  const coverUrl = normalizedCover || ogUrl;
  const sourceName = useMemo(() => {
    if (!article.source_url) return "Original Source";
    try {
      const host = new URL(article.source_url).hostname.replace("www.", "");
      return host.charAt(0).toUpperCase() + host.slice(1);
    } catch {
      return "Original Source";
    }
  }, [article.source_url]);
  const bodyHtml = article.seo_body || article.body || "";
  const summaryText = stripHtml(article.summary || article.body || "");
  const hasReadableBody = Boolean(stripHtml(article.seo_body || article.body || "").trim());

  useEffect(() => {
    if (document.readyState === "complete") {
      setPageLoaded(true);
      return;
    }
    const onLoad = () => setPageLoaded(true);
    window.addEventListener("load", onLoad);
    return () => window.removeEventListener("load", onLoad);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY >= 100) setHasScrolledEnough(true);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (!showLoginModal) return;
    const onEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        sessionStorage.setItem(SESSION_DISMISS_KEY, "1");
        setShowLoginModal(false);
      }
    };
    window.addEventListener("keydown", onEscape);
    return () => window.removeEventListener("keydown", onEscape);
  }, [showLoginModal]);

  useEffect(() => {
    if (!authResolved || isLoggedIn || !hasScrolledEnough || !pageLoaded) return;
    if (sessionStorage.getItem(SESSION_DISMISS_KEY) === "1") return;
    const timer = window.setTimeout(() => {
      if (!modalShownByIntent.current) setShowLoginModal(true);
    }, 20000);
    return () => window.clearTimeout(timer);
  }, [authResolved, isLoggedIn, hasScrolledEnough, pageLoaded]);

  useEffect(() => {
    let mounted = true;
    const fetchOpinions = async () => {
      try {
        const res = await fetch(`/api/news/opinion?newsId=${article.id}`);
        const data = await res.json();
        const opinions = Array.isArray(data.opinions) ? data.opinions : [];
        const counts = opinions.reduce(
          (acc: { FOR: number; NEUTRAL: number; AGAINST: number }, item: any) => {
            if (item.stance === "FOR" || item.stance === "NEUTRAL" || item.stance === "AGAINST") acc[item.stance] += 1;
            return acc;
          },
          { FOR: 0, NEUTRAL: 0, AGAINST: 0 }
        );
        if (mounted) setStanceCounts(counts);
      } catch {
        // no-op
      }
    };
    fetchOpinions();
    const id = window.setInterval(fetchOpinions, 7000);
    return () => {
      mounted = false;
      window.clearInterval(id);
    };
  }, [article.id]);

  const total = stanceCounts.FOR + stanceCounts.NEUTRAL + stanceCounts.AGAINST;
  const forPct = total ? Math.round((stanceCounts.FOR / total) * 100) : 0;
  const neutralPct = total ? Math.round((stanceCounts.NEUTRAL / total) * 100) : 0;
  const againstPct = total ? 100 - forPct - neutralPct : 0;

  const openLoginModal = () => {
    modalShownByIntent.current = true;
    setShowLoginModal(true);
  };

  const closeLoginModal = () => {
    sessionStorage.setItem(SESSION_DISMISS_KEY, "1");
    setShowLoginModal(false);
  };

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(window.location.href);
    toast.success("Link copied");
  };

  const shareUrl = typeof window !== "undefined" ? window.location.href : `https://rajneet.co.in/news/${article.slug || article.id}`;
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`${title} ${shareUrl}`)}`;
  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(shareUrl)}`;

  return (
    <main className="min-h-screen bg-[#050A14] text-white">
      {showLoginModal && authResolved && !isLoggedIn && <LoginPromptModal onClose={closeLoginModal} />}

      <div className="max-w-4xl mx-auto px-6 py-12">
        <article>
          <header className="mb-10">
            <div className="flex items-center gap-3 mb-6 flex-wrap">
              <span className="px-3 py-1 bg-accent-blue/10 text-accent-blue text-[10px] font-black rounded-full uppercase tracking-widest border border-accent-blue/20">
                {article.category}
              </span>
              <div className="flex items-center gap-1 text-xs text-gray-500 font-medium">
                <MapPin size={14} />
                {article.state || "National"}
              </div>
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Clock size={14} />
                {formatDistanceToNow(new Date(article.created_at), { addSuffix: true })}
              </div>
            </div>

            <h1 className="text-4xl md:text-5xl font-heading font-bold leading-tight mb-5 text-white">
              {title}
            </h1>

            {article.source_url && (
              <a
                href={article.source_url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 text-sm text-gray-300 hover:text-white mb-3"
              >
                Source: {sourceName}
                <ExternalLink size={14} />
              </a>
            )}
            <p className="text-sm text-gray-500">
              Posted by RAJNEET Editorial • {formatDistanceToNow(new Date(article.created_at), { addSuffix: true })}
            </p>
          </header>

          <div className="aspect-video rounded-3xl overflow-hidden mb-12 border border-white/10">
            <img
              src={coverUrl}
              alt={title}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
              onError={(e) => {
                const img = e.currentTarget as HTMLImageElement;
                if (img.dataset.fallbackApplied === "1") return;
                img.dataset.fallbackApplied = "1";
                img.src = ogUrl;
              }}
            />
          </div>

          {/* Quick Summary */}
          <div className="mb-8 p-5 bg-accent-blue/5 border border-accent-blue/20 rounded-2xl">
            <p className="text-[10px] font-black text-accent-blue uppercase tracking-[0.22em] mb-2">
              Quick Summary
            </p>
            <p className="text-gray-200 leading-relaxed text-base">
              {summaryText || article.headline || "Read the full article for more details."}
            </p>
          </div>

          {/* Full Article Body */}
          {(article.seo_body || article.body) ? (
            <div className="mb-16">
              {(article.seo_body || article.body)
                .split('\n\n')
                .filter((para: string) => para.trim().length > 0)
                .map((paragraph: string, index: number) => (
                  <p
                    key={index}
                    style={{
                      color: '#D1D5DB',
                      fontSize: '17px',
                      lineHeight: '1.9',
                      marginBottom: '24px',
                      fontFamily: 'Inter, sans-serif',
                      maxWidth: '680px',
                    }}
                  >
                    {paragraph.trim()}
                  </p>
                ))}
            </div>
          ) : (
            <div className="mb-16">
              <p style={{color: '#6B7280'}}>
                Full article is being generated. Read the original story here:
              </p>
              <a
                href={article.source_url}
                target="_blank"
                rel="noopener noreferrer"
                style={{color: '#3B82F6'}}
              >
                Read full article at source →
              </a>
            </div>
          )}

          <div className="mb-10">
            <div className="flex justify-between text-[10px] font-black uppercase tracking-widest mb-2">
              <span className="text-green-500">For {forPct}%</span>
              <span className="text-gray-400">Neutral {neutralPct}%</span>
              <span className="text-red-500">Against {againstPct}%</span>
            </div>
            <div className="h-2 w-full flex rounded-full overflow-hidden bg-white/10">
              <div className="bg-green-500 transition-all duration-700" style={{ width: `${forPct}%` }} />
              <div className="bg-gray-500 transition-all duration-700" style={{ width: `${neutralPct}%` }} />
              <div className="bg-red-500 transition-all duration-700" style={{ width: `${againstPct}%` }} />
            </div>
          </div>

          {hasReadableBody ? (
            <div
              className="prose prose-invert max-w-none mb-16 prose-p:text-gray-200 prose-p:leading-[1.8] prose-p:text-[1.05rem]"
              dangerouslySetInnerHTML={{ __html: bodyHtml }}
            />
          ) : summaryText ? (
            <div className="mb-16 text-gray-300 text-lg leading-[1.8]">{summaryText}</div>
          ) : (
            <div className="mb-16 text-gray-300 text-lg leading-[1.8]">
              Full article available at source{" "}
              {article.source_url ? (
                <a href={article.source_url} target="_blank" rel="noreferrer" className="text-accent-blue underline">
                  Open source article
                </a>
              ) : null}
            </div>
          )}

          <div className="flex flex-wrap gap-3 mb-8">
            <button onClick={handleCopyLink} className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-sm inline-flex items-center gap-2">
              <Copy size={14} /> Copy Link
            </button>
            <a href={whatsappUrl} target="_blank" rel="noreferrer" className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-sm">
              WhatsApp
            </a>
            {authResolved && !isLoggedIn && (
              <button onClick={openLoginModal} className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-sm inline-flex items-center gap-2">
                <Share2 size={14} /> Join debate
              </button>
            )}
          </div>

          <section className="pt-10 border-t border-white/10">
            <div className="flex items-center gap-3 mb-8">
              <MessageSquare size={24} className="text-accent-blue" />
              <h2 className="text-3xl font-heading font-black uppercase tracking-tight">Public Debate</h2>
            </div>
            <DebateSection
              newsId={article.id}
              currentUser={session?.user || null}
              onRequireLogin={openLoginModal}
              allowInteraction={authResolved && isLoggedIn}
            />
          </section>

          {/* Instagram CTA */}
          <section className="mt-12 p-6 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-2xl text-center">
            <h3 className="text-xl font-bold text-white mb-2">Join the Conversation</h3>
            <p className="text-gray-400 mb-4">Follow us on Instagram for daily updates</p>
            <a
              href="https://instagram.com/rajneet.co.in"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-full hover:opacity-90 transition-opacity"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
              @rajneet.co.in
            </a>
          </section>
        </article>
      </div>
    </main>
  );
}
