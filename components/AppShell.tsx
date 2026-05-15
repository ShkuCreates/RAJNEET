"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  CalendarDays,
  ChevronDown,
  ChevronUp,
  Crown,
  MessagesSquare,
  Newspaper,
  Radio,
  Shield,
  TrendingUp,
  User,
} from "lucide-react";
import { useSession, signIn } from "next-auth/react";
import { toast } from "sonner";

type DashboardUser = {
  id?: string;
  name?: string | null;
  email?: string | null;
  avatar_url?: string | null;
  role?: string | null;
};

type AppShellProps = {
  children: React.ReactNode;
};

type NavItem = {
  label: string;
  category?: string | null;
  href?: string | null;
  isLive?: boolean;
  isTrending?: boolean;
  isDebate?: boolean;
  isPremium?: boolean;
  isAdmin?: boolean;
  isAction?: boolean;
};

const NAV_ITEMS: NavItem[] = [
  { label: "Live", category: null, href: "/live", isLive: true },
  { label: "Trending", category: null, href: "/trending", isTrending: true },
  { label: "Politics", category: "Politics", href: null },
  { label: "Sports", category: "Sports", href: null },
  { label: "Finance", category: "Finance", href: null },
  { label: "Entertainment", category: "Entertainment", href: null },
  { label: "Others", category: "Others", href: null },
  { label: "World", category: "World", href: null },
  { label: "Debates", href: "/debates", isDebate: true },
  { label: "Premium", href: "/premium", isPremium: true },
];

const NEWS_OPTIONS = ["Politics", "Sports", "Finance", "Entertainment", "Others", "World"] as const;
const DEBATE_OPTIONS = [
  { label: "Live", href: "/debates" },
  { label: "Calendar", href: "/debates/calendar" },
  { label: "Creators", href: "/creators" },
] as const;
const ADMIN_DROPDOWN_OPTIONS: NavItem[] = [
  { label: "Manage Post", href: "/admin/manage-news" },
  { label: "Upload News", href: "/admin/post-news" },
  { label: "Upload Article", href: "/admin/articles" },
  { label: "Manage Article", href: "/admin/manage-articles" },
  { label: "Analytics", href: "/admin/analytics" },
  { label: "Users", href: "/admin/users" },
  { label: "Fetch News", href: null, isAction: true },
];

function UserLink({ user }: { user: DashboardUser | null | undefined }) {
  if (!user?.id) {
    return (
      <button
        onClick={() => signIn("google")}
        className="px-4 py-2 bg-accent-blue text-white text-sm font-bold rounded-lg hover:bg-accent-blue/90 transition-colors"
      >
        Login
      </button>
    );
  }

  return (
    <Link
      href="/profile"
      className="flex cursor-pointer items-center gap-3 rounded-lg border border-transparent px-2.5 py-1.5 transition-all duration-150 hover:bg-white/[0.05] hover:opacity-80"
    >
      {user.avatar_url ? (
        <img
          src={user.avatar_url}
          alt={user.name || "Profile"}
          className="h-[38px] w-[38px] rounded-full border-2 border-[rgba(59,130,246,0.4)] object-cover transition-colors hover:border-[#3B82F6]"
          referrerPolicy="no-referrer"
        />
      ) : (
        <div className="flex h-[38px] w-[38px] items-center justify-center rounded-full border-2 border-[rgba(59,130,246,0.4)] bg-[#1f2937] text-sm font-semibold text-white">
          {(user.name || "U").charAt(0).toUpperCase()}
        </div>
      )}
      <span className="max-w-[140px] truncate text-sm font-semibold text-white">
        {user.name || "Citizen"}
      </span>
    </Link>
  );
}

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4">
      <defs>
        <linearGradient id="ig-gradient" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#F58529" />
          <stop offset="50%" stopColor="#DD2A7B" />
          <stop offset="100%" stopColor="#8134AF" />
        </linearGradient>
      </defs>
      <rect x="3" y="3" width="18" height="18" rx="5" fill="none" stroke="url(#ig-gradient)" strokeWidth="1.8" />
      <circle cx="12" cy="12" r="4.2" fill="none" stroke="url(#ig-gradient)" strokeWidth="1.8" />
      <circle cx="17.2" cy="6.8" r="1.2" fill="url(#ig-gradient)" />
    </svg>
  );
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const [section, setSection] = useState<"news" | "article">("news");
  const [newsOpen, setNewsOpen] = useState(false);
  const [debatesOpen, setDebatesOpen] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);
  const [fetchingNow, setFetchingNow] = useState(false);
  const [now, setNow] = useState(() => new Date());
  const debatesRef = useRef<HTMLDivElement | null>(null);
  const adminRef = useRef<HTMLDivElement | null>(null);
  const bottomNewsRef = useRef<HTMLDivElement | null>(null);
  const bottomDebateRef = useRef<HTMLDivElement | null>(null);
  const bottomAdminRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (newsOpen) {
        const inside = bottomNewsRef.current?.contains(target);
        if (!inside) setNewsOpen(false);
      }
      if (debatesOpen) {
        const inside = debatesRef.current?.contains(target) || bottomDebateRef.current?.contains(target);
        if (!inside) setDebatesOpen(false);
      }
      if (adminOpen) {
        const inside = adminRef.current?.contains(target) || bottomAdminRef.current?.contains(target);
        if (!inside) setAdminOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [newsOpen, debatesOpen, adminOpen]);

  useEffect(() => {
    setNewsOpen(false);
    setDebatesOpen(false);
    setAdminOpen(false);
  }, [pathname, searchParams]);

  const weekday = now.toLocaleDateString("en-IN", { weekday: "long" }).toUpperCase();
  const month = now.toLocaleDateString("en-IN", { month: "long" }).toUpperCase();
  const day = now.getDate().toString().padStart(2, "0");
  const time = now.toLocaleTimeString("en-IN", {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    timeZone: "Asia/Kolkata",
  });
  const activeCategory = searchParams.get("category");
  const currentNav =
    pathname === "/live"
      ? "live"
      : pathname.startsWith("/debates")
        ? "debates"
        : pathname.startsWith("/admin")
          ? "admin"
          : "news";

  const isAdmin = session?.user?.role === "ADMIN";

  const isDebateLive = pathname === "/debates";

  const goToCategory = (category: string) => {
    router.push(`/?category=${encodeURIComponent(category)}`);
    setNewsOpen(false);
  };

  const goHomeNews = () => {
    router.push("/");
    setNewsOpen(false);
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#050A14] pb-[calc(4.25rem+env(safe-area-inset-bottom,0px))] text-white lg:pb-0">
      <style jsx global>{`
        @keyframes livePulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.4); }
        }
        @keyframes footerHeartbeat {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.2); }
        }
        @keyframes dropdownIn {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div className="sticky top-0 z-[60] bg-[#0A0F1E] shadow-[0_1px_20px_rgba(0,0,0,0.4)] lg:static lg:z-auto lg:shadow-[0_1px_20px_rgba(0,0,0,0.4)]">
        <header className="border-b border-[rgba(59,130,246,0.15)] bg-[#0A0F1E]">
          <div className="relative mx-auto h-[60px] w-full max-w-[1400px] px-4 sm:px-6">
            <div className="absolute left-0 top-1/2 flex -translate-y-1/2 items-center gap-3">
              <Link href="/" className="flex items-center gap-3">
                <img
                  src="/images/rajneet-logo.png"
                  alt="RAJNEET"
                  className="h-8 w-auto rounded-full shadow-[0_0_12px_rgba(245,158,11,0.3)]"
                />
                <span className="text-2xl font-heading font-black tracking-tight text-accent-amber">
                  RAJNEET
                </span>
              </Link>
            </div>

            <div className="absolute left-1/2 top-1/2 z-20 hidden -translate-x-1/2 -translate-y-1/2 lg:block">
              <div className="flex rounded-[20px] border border-white/10 bg-white/[0.08] p-1 shadow-[0_8px_32px_rgba(0,0,0,0.1)] backdrop-blur-sm">
                <button
                  type="button"
                  onClick={() => {
                    setSection("news");
                    localStorage.setItem("rajneet-section", "news");
                    window.dispatchEvent(new CustomEvent("rajneet-section-change", { detail: { section: "news" } }));
                  }}
                  className={`rounded-[16px] px-12 py-1.5 text-sm font-semibold uppercase tracking-wider transition-all duration-250 active:scale-[0.98] ${
                    section === "news"
                      ? "scale-100 bg-gradient-to-br from-[#2563EB] to-[#3B82F6] text-white shadow-[0_4px_20px_rgba(59,130,246,0.3)]"
                      : "text-gray-400"
                  }`}
                >
                  NEWS
                </button>
                <div className="h-5 w-px bg-white/20" />
                <button
                  type="button"
                  onClick={() => {
                    setSection("article");
                    localStorage.setItem("rajneet-section", "article");
                    window.dispatchEvent(new CustomEvent("rajneet-section-change", { detail: { section: "article" } }));
                  }}
                  className={`rounded-[16px] px-12 py-1.5 text-sm font-semibold uppercase tracking-wider transition-all duration-250 active:scale-[0.98] ${
                    section === "article"
                      ? "scale-100 bg-gradient-to-br from-[#2563EB] to-[#3B82F6] text-white shadow-[0_4px_20px_rgba(59,130,246,0.3)]"
                      : "text-gray-400"
                  }`}
                >
                  ARTICLE
                </button>
              </div>
            </div>

            <div className="absolute right-0 top-1/2 hidden -translate-y-1/2 items-center gap-3 lg:flex">
              <div className="h-7 w-px bg-white/10" />
              <div className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/[0.06] px-3 py-1.5">
                <span className="text-[12px] font-medium text-gray-300">{`${weekday}, ${month} ${day}`}</span>
                <span className="text-white/30">•</span>
                <span className="text-lg font-semibold text-white">{time}</span>
              </div>
              <div className="h-7 w-px bg-white/10" />
              <UserLink user={session?.user} />
            </div>
          </div>
        </header>

        <div className="border-t border-white/[0.06] bg-[#070B14] px-3 py-2.5 lg:hidden">
          <div className="mx-auto flex max-w-[1400px] justify-center">
            <div className="inline-flex w-full max-w-md rounded-full border border-white/10 bg-white/[0.08] p-1">
              <button
                type="button"
                onClick={() => {
                  setSection("news");
                  localStorage.setItem("rajneet-section", "news");
                  window.dispatchEvent(new CustomEvent("rajneet-section-change", { detail: { section: "news" } }));
                }}
                className={`flex-1 rounded-full py-2 text-center text-xs font-bold uppercase tracking-wider sm:text-sm ${
                  section === "news"
                    ? "bg-gradient-to-br from-[#2563EB] to-[#3B82F6] text-white shadow-[0_4px_16px_rgba(59,130,246,0.35)]"
                    : "text-gray-400"
                }`}
              >
                News
              </button>
              <button
                type="button"
                onClick={() => {
                  setSection("article");
                  localStorage.setItem("rajneet-section", "article");
                  window.dispatchEvent(new CustomEvent("rajneet-section-change", { detail: { section: "article" } }));
                }}
                className={`flex-1 rounded-full py-2 text-center text-xs font-bold uppercase tracking-wider sm:text-sm ${
                  section === "article"
                    ? "bg-gradient-to-br from-[#2563EB] to-[#3B82F6] text-white shadow-[0_4px_16px_rgba(59,130,246,0.35)]"
                    : "text-gray-400"
                }`}
              >
                Article
              </button>
            </div>
          </div>
        </div>
      </div>

      {section === "news" ? (
        <div className="hidden border-b-2 border-[#1E3A5F] bg-[#070B14] lg:block overflow-visible">
          <div className="mx-auto flex h-[52px] w-full max-w-[1400px] items-center justify-between px-4 sm:px-6 overflow-visible">
            <div className="flex items-center gap-0">
              {NAV_ITEMS.map((item) => {
                if (item.isAdmin && !isAdmin) return null;
                
                const isActive = item.category 
                  ? activeCategory === item.category
                  : item.href 
                    ? pathname === item.href
                    : !activeCategory;

                const handleClick = (e: React.MouseEvent) => {
                  e.preventDefault();
                  e.stopPropagation();
                  
                  if (item.href) {
                    router.push(item.href);
                  } else if (item.category) {
                    goToCategory(item.category);
                  } else if (item.isDebate) {
                    setDebatesOpen((value) => !value);
                    setNewsOpen(false);
                    setAdminOpen(false);
                  } else {
                    router.push("/");
                  }
                };

                return (
                  <div key={item.label} className="relative" ref={item.isDebate ? debatesRef : undefined}>
                    <button
                      type="button"
                      onClick={handleClick}
                      className={`relative flex h-full items-center gap-1 px-5 py-2 text-[13px] font-bold uppercase tracking-wider transition-all rounded-lg ${
                        item.isDebate
                          ? pathname.startsWith("/debates") || pathname === "/live"
                            ? "bg-red-500 text-white shadow-lg"
                            : "bg-red-500/10 text-red-500 hover:bg-red-500/20"
                          : isActive 
                            ? "text-[#3B82F6] bg-white/[0.03]" 
                            : "text-white hover:text-[#93C5FD] hover:bg-white/[0.02]"
                      }`}
                    >
                      {item.isLive && (
                        <span className="h-2 w-2 rounded-full bg-[#EF4444] mr-2" style={{ animation: "livePulse 1.2s infinite" }} />
                      )}
                      {item.label}
                      {item.isDebate && <ChevronDown size={14} className={`transition-transform duration-200 ${debatesOpen ? "rotate-180" : ""}`} />}
                      {isActive && !item.isDebate && (
                        <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#3B82F6]" />
                      )}
                      {item.isDebate && (pathname.startsWith("/debates") || pathname === "/live") && (
                        <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-500 rounded-b-lg" />
                      )}
                    </button>
                    {item.isDebate && debatesOpen ? (
                      <div className="absolute left-0 top-full z-50 mt-2 min-w-[180px] overflow-visible rounded-lg border border-red-500/20 bg-[#111827] p-1 shadow-[0_8px_32px_rgba(0,0,0,0.6)]" style={{ animation: "dropdownIn 150ms ease" }}>
                        {DEBATE_OPTIONS.map((option) => (
                          <Link
                            key={option.label}
                            href={option.href}
                            className="flex w-full items-center gap-2 rounded-md px-3 py-2.5 text-sm font-medium text-gray-400 transition-colors touch-manipulation-adjustment hover:bg-red-500/10 hover:text-red-300"
                          >
                            {option.label === "Live" && (
                              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-red-500" style={{ animation: "livePulse 1.2s infinite" }} />
                            )}
                            {option.label === "Calendar" && <CalendarDays size={14} className="shrink-0 opacity-70" />}
                            {option.label}
                          </Link>
                        ))}
                      </div>
                    ) : null}
                  </div>
                );
              })}

              {/* Admin Dropdown */}
              {isAdmin && (
                <div className="relative" ref={adminRef}>
                  <button
                    type="button"
                    onClick={() => {
                      setAdminOpen((value) => !value);
                      setNewsOpen(false);
                      setDebatesOpen(false);
                    }}
                    className={`relative flex h-full items-center gap-1 px-5 text-[13px] font-semibold uppercase tracking-wider transition-colors ${
                      pathname.startsWith("/admin") ? "text-[#3B82F6]" : "text-white"
                    }`}
                  >
                    ADMIN
                    <ChevronDown size={16} className={`transition-transform duration-200 ${adminOpen ? "rotate-180" : ""}`} />
                    {pathname.startsWith("/admin") && (
                      <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#3B82F6]" />
                    )}
                  </button>
                  {adminOpen ? (
                    <div className="absolute left-0 top-full z-[1000] mt-2 min-w-[200px] overflow-hidden rounded-[10px] border border-[rgba(59,130,246,0.2)] bg-[#111827] p-2 shadow-[0_8px_32px_rgba(0,0,0,0.6)]" style={{ animation: "dropdownIn 150ms ease" }}>
                      {ADMIN_DROPDOWN_OPTIONS.map((option) => {
                        if (option.isAction) {
                          return (
                            <button
                              key={option.label}
                              type="button"
                              onClick={async () => {
                                setAdminOpen(false);
                                setFetchingNow(true);
                                toast.info("Fetching news...");
                                try {
                                  const res = await fetch("/api/admin/fetch-news", { method: "POST" });
                                  const data = await res.json();
                                  if (res.ok) {
                                    toast.success(`Fetched ${data.saved} news articles!`);
                                  } else {
                                    toast.error(data.error || "Failed to fetch news");
                                    console.error("Fetch news error:", data);
                                  }
                                } catch (e: any) {
                                  toast.error(e.message || "Failed to fetch news");
                                  console.error("Fetch news exception:", e);
                                } finally {
                                  setFetchingNow(false);
                                }
                              }}
                              disabled={fetchingNow}
                              className={`flex w-full items-center border-l-2 px-4 py-3 text-left text-sm font-medium transition-colors touch-manipulation-adjustment ${
                                fetchingNow
                                  ? "border-transparent text-gray-600 cursor-not-allowed"
                                  : "border-transparent text-gray-400 hover:border-[#3B82F6] hover:bg-[rgba(59,130,246,0.08)] hover:text-white"
                              }`}
                            >
                              {fetchingNow ? "Fetching..." : option.label}
                            </button>
                          );
                        }
                        return (
                          <Link
                            key={option.label}
                            href={option.href}
                            className={`flex w-full items-center border-l-2 px-4 py-3 text-left text-sm font-medium transition-colors touch-manipulation-adjustment ${
                              pathname === option.href
                                ? "border-[#3B82F6] bg-[rgba(59,130,246,0.08)] text-white"
                                : "border-transparent text-gray-400 hover:border-[#3B82F6] hover:bg-[rgba(59,130,246,0.08)] hover:text-white"
                            }`}
                          >
                            {option.label}
                          </Link>
                        );
                      })}
                    </div>
                  ) : null}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}

      <main className="flex-1">{section === "article" ? (
        <div className="mx-auto flex min-h-[calc(100vh-168px)] max-w-[1200px] items-center justify-center px-6 py-12 text-center">
          <div className="rounded-[28px] border border-white/10 bg-[#111827] px-8 py-16 shadow-2xl">
            <h1 className="mb-3 text-3xl font-semibold text-white">Coming Soon</h1>
            <p className="text-base text-gray-400">Articles section launching soon. Stay tuned.</p>
          </div>
        </div>
      ) : children}</main>

      <footer className="border-t border-[rgba(59,130,246,0.1)] bg-[#070B14]">
        <div className="mx-auto flex min-h-[56px] w-full max-w-[1400px] flex-col items-center justify-between gap-3 px-4 py-3 text-center md:flex-row md:px-6 md:text-left">
          <div className="flex items-center gap-2 text-[13px] text-[#6B7280]">
            <Link href="/terms" className="font-medium transition-all duration-150 hover:text-[#F9FAFB] hover:underline">
              Terms of Service
            </Link>
            <span className="h-[14px] w-px bg-[#374151]" />
            <Link href="/privacy" className="font-medium transition-all duration-150 hover:text-[#F9FAFB] hover:underline">
              Privacy Policy
            </Link>
          </div>
          <a
            href="https://www.instagram.com/rajneet.co.in/"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 rounded-full px-3 py-1 text-[13px] text-[#6B7280] transition-all duration-150 hover:border hover:border-[rgba(221,42,123,0.3)] hover:text-[#F9FAFB] hover:shadow-[0_0_16px_rgba(221,42,123,0.15)]"
          >
            <InstagramIcon />
            <span className="font-medium">Instagram</span>
          </a>
          <div className="text-[13px] text-[#6B7280]">
            Made with <span className="inline-block text-base text-red-500" style={{ animation: "footerHeartbeat 1.5s infinite" }}>❤️</span> in India 🇮🇳
          </div>
        </div>
      </footer>

      {(newsOpen || debatesOpen || adminOpen) ? (
        <button
          type="button"
          className="fixed inset-0 z-[50] bg-black/50 lg:hidden"
          aria-label="Close menu"
          onClick={() => {
            setNewsOpen(false);
            setDebatesOpen(false);
            setAdminOpen(false);
          }}
        />
      ) : null}

      <nav
        className="fixed bottom-0 left-0 right-0 z-[55] flex items-end justify-between gap-0 border-t border-white/10 bg-[#080d18]/95 px-0.5 pb-[max(0.4rem,env(safe-area-inset-bottom,0px))] pt-1.5 backdrop-blur-md lg:hidden"
        role="navigation"
        aria-label="Main mobile navigation"
      >
        <button
          type="button"
          onClick={() => {
            setNewsOpen(false);
            setDebatesOpen(false);
            setAdminOpen(false);
            router.push("/live");
          }}
          className={`flex min-w-0 flex-1 flex-col items-center gap-0.5 rounded-lg py-1.5 transition-colors ${
            pathname === "/live" ? "text-red-500" : "text-gray-500 hover:text-gray-300"
          }`}
        >
          <Radio className="h-5 w-5 shrink-0" strokeWidth={2.2} />
          <span className="max-w-full truncate px-0.5 text-[9px] font-bold uppercase tracking-tight sm:text-[10px]">Live</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setNewsOpen(false);
            setDebatesOpen(false);
            setAdminOpen(false);
            router.push("/trending");
          }}
          className={`flex min-w-0 flex-1 flex-col items-center gap-0.5 rounded-lg py-1.5 transition-colors ${
            pathname === "/trending" ? "text-[#3B82F6]" : "text-gray-500 hover:text-gray-300"
          }`}
        >
          <TrendingUp className="h-5 w-5 shrink-0" strokeWidth={2.2} />
          <span className="max-w-full truncate px-0.5 text-[9px] font-bold uppercase tracking-tight sm:text-[10px]">Trending</span>
        </button>

        <div ref={bottomNewsRef} className="relative flex min-w-0 flex-1 flex-col items-center">
          <button
            type="button"
            onClick={() => {
              setNewsOpen((v) => !v);
              setDebatesOpen(false);
              setAdminOpen(false);
            }}
            className={`flex w-full flex-col items-center gap-0.5 rounded-lg py-1.5 transition-colors ${
              newsOpen || (!!activeCategory && pathname === "/")
                ? "text-[#3B82F6]"
                : "text-gray-500 hover:text-gray-300"
            }`}
          >
            <Newspaper className="h-5 w-5 shrink-0" strokeWidth={2.2} />
            <span className="flex max-w-full items-center gap-0.5 truncate px-0.5 text-[9px] font-bold uppercase tracking-tight sm:text-[10px]">
              News
              {newsOpen ? <ChevronUp className="h-3 w-3 shrink-0" /> : <ChevronDown className="h-3 w-3 shrink-0" />}
            </span>
          </button>
          {newsOpen ? (
            <div
              className="absolute bottom-full left-1/2 z-[60] mb-2 w-[min(19rem,calc(100vw-1.5rem))] -translate-x-1/2 overflow-hidden rounded-xl border border-white/10 bg-[#111827] py-2 shadow-2xl"
              style={{ animation: "dropdownIn 150ms ease" }}
            >
              <button
                type="button"
                onClick={() => {
                  goHomeNews();
                  setDebatesOpen(false);
                  setAdminOpen(false);
                }}
                className="flex w-full border-b border-white/5 px-4 py-3 text-left text-sm font-semibold text-white hover:bg-white/[0.06]"
              >
                All news
              </button>
              {NEWS_OPTIONS.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => goToCategory(option)}
                  className={`flex w-full px-4 py-2.5 text-left text-sm font-medium transition-colors ${
                    activeCategory === option ? "bg-[rgba(59,130,246,0.12)] text-white" : "text-gray-400 hover:bg-white/[0.05] hover:text-white"
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          ) : null}
        </div>

        <div ref={bottomDebateRef} className="relative flex min-w-0 flex-1 flex-col items-center">
          <button
            type="button"
            onClick={() => {
              setDebatesOpen((v) => !v);
              setNewsOpen(false);
              setAdminOpen(false);
            }}
            className={`flex w-full flex-col items-center gap-0.5 rounded-lg py-1.5 transition-colors ${
              debatesOpen || pathname.startsWith("/debates") || pathname === "/creators"
                ? "text-red-400"
                : "text-gray-500 hover:text-gray-300"
            }`}
          >
            <MessagesSquare className="h-5 w-5 shrink-0" strokeWidth={2.2} />
            <span className="flex max-w-full items-center gap-0.5 truncate px-0.5 text-[9px] font-bold uppercase tracking-tight sm:text-[10px]">
              Debate
              {debatesOpen ? <ChevronUp className="h-3 w-3 shrink-0" /> : <ChevronDown className="h-3 w-3 shrink-0" />}
            </span>
          </button>
          {debatesOpen ? (
            <div
              className="absolute bottom-full left-1/2 z-[60] mb-2 w-[min(17rem,calc(100vw-1.5rem))] -translate-x-1/2 overflow-hidden rounded-xl border border-red-500/20 bg-[#111827] py-2 shadow-2xl"
              style={{ animation: "dropdownIn 150ms ease" }}
            >
              {DEBATE_OPTIONS.map((option) => (
                <Link
                  key={option.href}
                  href={option.href}
                  onClick={() => setDebatesOpen(false)}
                  className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-300 hover:bg-red-500/10 hover:text-red-200"
                >
                  {option.label === "Live" && (
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-red-500" style={{ animation: "livePulse 1.2s infinite" }} />
                  )}
                  {option.label === "Calendar" && <CalendarDays size={14} className="shrink-0 opacity-70" />}
                  {option.label}
                </Link>
              ))}
            </div>
          ) : null}
        </div>

        <button
          type="button"
          onClick={() => {
            setNewsOpen(false);
            setDebatesOpen(false);
            setAdminOpen(false);
            router.push("/premium");
          }}
          className={`flex min-w-0 flex-1 flex-col items-center gap-0.5 rounded-lg py-1.5 transition-colors ${
            pathname === "/premium" ? "text-amber-400" : "text-gray-500 hover:text-gray-300"
          }`}
        >
          <Crown className="h-5 w-5 shrink-0" strokeWidth={2.2} />
          <span className="max-w-full truncate px-0.5 text-[9px] font-bold uppercase tracking-tight sm:text-[10px]">Premium</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setNewsOpen(false);
            setDebatesOpen(false);
            setAdminOpen(false);
            if (session?.user) router.push("/profile");
            else void signIn("google");
          }}
          className={`flex min-w-0 flex-1 flex-col items-center gap-0.5 rounded-lg py-1.5 transition-colors ${
            pathname === "/profile" ? "text-[#3B82F6]" : "text-gray-500 hover:text-gray-300"
          }`}
        >
          <User className="h-5 w-5 shrink-0" strokeWidth={2.2} />
          <span className="max-w-full truncate px-0.5 text-[9px] font-bold uppercase tracking-tight sm:text-[10px]">Profile</span>
        </button>

        {isAdmin ? (
          <div ref={bottomAdminRef} className="relative flex min-w-0 flex-1 flex-col items-center">
            <button
              type="button"
              onClick={() => {
                setAdminOpen((v) => !v);
                setNewsOpen(false);
                setDebatesOpen(false);
              }}
              className={`flex w-full flex-col items-center gap-0.5 rounded-lg py-1.5 transition-colors ${
                adminOpen || pathname.startsWith("/admin") ? "text-amber-400" : "text-gray-500 hover:text-gray-300"
              }`}
            >
              <Shield className="h-5 w-5 shrink-0" strokeWidth={2.2} />
              <span className="flex max-w-full items-center gap-0.5 truncate px-0.5 text-[9px] font-bold uppercase tracking-tight sm:text-[10px]">
                Admin
                {adminOpen ? <ChevronUp className="h-3 w-3 shrink-0" /> : <ChevronDown className="h-3 w-3 shrink-0" />}
              </span>
            </button>
            {adminOpen ? (
              <div
                className="absolute bottom-full right-0 z-[60] mb-2 max-h-[min(24rem,70vh)] w-[min(20rem,calc(100vw-1rem))] overflow-y-auto rounded-xl border border-amber-500/25 bg-[#111827] py-2 shadow-2xl sm:right-auto sm:left-1/2 sm:-translate-x-1/2"
                style={{ animation: "dropdownIn 150ms ease" }}
              >
                {ADMIN_DROPDOWN_OPTIONS.map((option) => {
                  if (option.isAction) {
                    return (
                      <button
                        key={option.label}
                        type="button"
                        onClick={async () => {
                          setAdminOpen(false);
                          setFetchingNow(true);
                          toast.info("Fetching news...");
                          try {
                            const res = await fetch("/api/admin/fetch-news", { method: "POST" });
                            const data = await res.json();
                            if (res.ok) {
                              toast.success(`Fetched ${data.saved} news articles!`);
                            } else {
                              toast.error(data.error || "Failed to fetch news");
                            }
                          } catch (e: any) {
                            toast.error(e.message || "Failed to fetch news");
                          } finally {
                            setFetchingNow(false);
                          }
                        }}
                        disabled={fetchingNow}
                        className="flex w-full px-4 py-2.5 text-left text-sm font-medium text-amber-100 hover:bg-amber-500/15 disabled:opacity-50"
                      >
                        {fetchingNow ? "Fetching…" : option.label}
                      </button>
                    );
                  }
                  return (
                    <Link
                      key={option.label}
                      href={option.href ?? "/"}
                      onClick={() => setAdminOpen(false)}
                      className="block px-4 py-2.5 text-sm font-medium text-amber-100 hover:bg-amber-500/15"
                    >
                      {option.label}
                    </Link>
                  );
                })}
              </div>
            ) : null}
          </div>
        ) : null}
      </nav>
    </div>
  );
}
