"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { CalendarDays, ChevronDown, Menu, Shield, X } from "lucide-react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";

type DashboardUser = {
  id?: string;
  name?: string | null;
  email?: string | null;
  avatar_url?: string | null;
  role?: string | null;
};

type DashboardShellProps = {
  user: DashboardUser;
  children: React.ReactNode;
};

const NEWS_OPTIONS = ["Politics", "Finance", "Sports", "World"] as const;
const DEBATE_OPTIONS = [
  { label: "Live", href: "/debates" },
  { label: "Calendar", href: "/debates/calendar" },
  { label: "Creators", href: "/creators" },
] as const;
const ADMIN_EMAIL_FALLBACK = "your-admin-email@gmail.com";

function UserLink({ user }: { user: DashboardUser }) {
  if (!user?.id) {
    return (
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 animate-pulse rounded-full bg-white/10" />
        <div className="h-4 w-24 animate-pulse rounded bg-white/10" />
      </div>
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

export default function DashboardShell({ user, children }: DashboardShellProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const [section, setSection] = useState<"news" | "article">("news");
  const [newsOpen, setNewsOpen] = useState(false);
  const [debatesOpen, setDebatesOpen] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [fetchingNow, setFetchingNow] = useState(false);
  const [now, setNow] = useState(() => new Date());
  const newsRef = useRef<HTMLDivElement | null>(null);
  const debatesRef = useRef<HTMLDivElement | null>(null);
  const adminRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (newsRef.current && !newsRef.current.contains(target)) setNewsOpen(false);
      if (debatesRef.current && !debatesRef.current.contains(target)) setDebatesOpen(false);
      if (adminRef.current && !adminRef.current.contains(target)) setAdminOpen(false);
    };

    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
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
    pathname === "/dashboard/live"
      ? "live"
      : pathname.startsWith("/debates")
        ? "debates"
        : pathname.startsWith("/admin")
          ? "admin"
          : "news";

  const isAdmin =
    session?.user?.role === "ADMIN" ||
    session?.user?.role === "admin" ||
    session?.user?.email?.toLowerCase() === ADMIN_EMAIL_FALLBACK.toLowerCase() ||
    user?.email?.toLowerCase() === ADMIN_EMAIL_FALLBACK.toLowerCase();

  const isDebateLive = pathname === "/debates";

  const goToCategory = (category: string) => {
    router.push(`/dashboard?category=${encodeURIComponent(category)}`);
    setNewsOpen(false);
  };

  const handleFetchNow = async () => {
    try {
      setFetchingNow(true);
      const res = await fetch("/api/cron/fetch-news", { cache: "no-store" });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Fetch failed");
      }
      toast.success("Fetch started");
      setAdminOpen(false);
    } catch (error: any) {
      toast.error(error?.message || "Unable to start fetch");
    } finally {
      setFetchingNow(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#050A14] text-white">
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

      <header className="border-b border-[rgba(59,130,246,0.15)] bg-[#0A0F1E] shadow-[0_1px_20px_rgba(0,0,0,0.4)]">
        <div className="mx-auto relative h-[60px] w-full max-w-[1400px] px-4 sm:px-6">
          {/* Left - Logo */}
          <div className="absolute left-0 top-1/2 -translate-y-1/2 flex items-center gap-3">
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

          {/* Center - Switcher - absolutely centered */}
          <div className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 z-20">
            <div className="hidden rounded-[25px] border border-white/10 bg-white/[0.08] backdrop-blur-sm p-1 md:flex shadow-[0_8px_32px_rgba(0,0,0,0.1)]">
              <button
                onClick={() => setSection("news")}
                className={`rounded-[20px] px-3 py-2 text-sm font-semibold transition-all duration-250 active:scale-[0.98] ${
                  section === "news"
                    ? "scale-100 bg-gradient-to-br from-[#2563EB] to-[#3B82F6] text-white shadow-[0_4px_20px_rgba(59,130,246,0.3)]"
                    : "text-gray-400"
                }`}
              >
                NEWS
              </button>
              <button
                onClick={() => setSection("article")}
                className={`rounded-[20px] px-3 py-2 text-sm font-semibold transition-all duration-250 active:scale-[0.98] ${
                  section === "article"
                    ? "scale-100 bg-gradient-to-br from-[#2563EB] to-[#3B82F6] text-white shadow-[0_4px_20px_rgba(59,130,246,0.3)]"
                    : "text-gray-400"
                }`}
              >
                ARTICLE
              </button>
            </div>
          </div>

          
          {/* Right - Date Time + Profile */}
          <div className="absolute right-0 top-1/2 -translate-y-1/2 hidden items-center gap-4 md:flex">
            <div className="flex items-center gap-2 text-right">
              <span className="text-[13px] font-medium text-[#6B7280]">{`${weekday}, ${month} ${day}`}</span>
              <span className="text-[#374151]">-</span>
              <span className="text-lg font-semibold text-[#F9FAFB]">{time}</span>
              <span className="rounded-full bg-[#3B82F6] px-2 py-1 text-[11px] font-semibold text-white">IST</span>
            </div>
            <div className="h-7 w-px bg-white/10" />
            <UserLink user={user} />
          </div>

          {/* Navigation Bar */}
          <div className="absolute left-1/2 top-full z-10 hidden md:flex">
            <button
              onClick={() => router.push('/dashboard/live')}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white hover:text-blue-300 transition-colors"
            >
              <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
              LIVE
            </button>
            <button
              onClick={() => router.push('/dashboard')}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white hover:text-blue-300 transition-colors"
            >
              <span className="text-xl">📰</span>
              NEWS
            </button>
            <button
              onClick={() => router.push('/debates')}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white hover:text-blue-300 transition-colors"
            >
              <span className="text-xl">🗳️</span>
              DEBATE
            </button>
            {isAdmin && (
              <button
                onClick={() => router.push('/admin')}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white hover:text-blue-300 transition-colors"
              >
                <span className="text-xl">⚙️</span>
                ADMIN
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="absolute right-4 top-1/2 -translate-y-1/2 inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] md:hidden"
            aria-label="Open navigation"
          >
            <Menu size={18} />
          </button>
        </div>
      </header>

      {section === "news" ? (
        <div className="border-b-2 border-[#1E3A5F] bg-[#070B14]">
          <div className="mx-auto flex h-[52px] w-full max-w-[1400px] items-center gap-8 px-4 sm:px-6">
            <div className="hidden items-center gap-3 md:flex">
              <button
                onClick={() => router.push("/dashboard/live")}
                className="relative flex h-9 items-center gap-2 rounded-md px-3 text-[13px] font-bold tracking-[0.5px] text-[#EF4444] transition hover:bg-[rgba(239,68,68,0.1)]"
              >
                <span className="h-2 w-2 rounded-full bg-[#EF4444]" style={{ animation: "livePulse 1.2s infinite" }} />
                LIVE
                <span className={`absolute inset-x-0 -bottom-[8px] h-0.5 bg-[#3B82F6] transition-all duration-200 ${currentNav === "live" ? "opacity-100" : "opacity-0"}`} />
              </button>

              <div className="relative" ref={newsRef}>
                <button
                  onClick={() => {
                    setNewsOpen((value) => !value);
                    setDebatesOpen(false);
                    setAdminOpen(false);
                  }}
                  className={`relative flex h-9 items-center gap-1 px-1 text-sm font-semibold transition-colors ${
                    currentNav === "news" ? "text-[#3B82F6]" : "text-white"
                  }`}
                >
                  NEWS
                  <ChevronDown size={16} className={`transition-transform duration-200 ${newsOpen ? "rotate-180" : ""}`} />
                  <span className={`absolute inset-x-0 -bottom-[8px] h-0.5 bg-[#3B82F6] transition-all duration-200 ${currentNav === "news" ? "opacity-100" : "opacity-0"}`} />
                </button>
                {newsOpen ? (
                  <div className="absolute left-0 top-full z-30 mt-2 min-w-[180px] overflow-hidden rounded-[10px] border border-[rgba(59,130,246,0.2)] bg-[#111827] p-2 shadow-[0_8px_32px_rgba(0,0,0,0.6)]" style={{ animation: "dropdownIn 150ms ease" }}>
                    {NEWS_OPTIONS.map((option) => (
                      <button
                        key={option}
                        onClick={() => goToCategory(option)}
                        className={`flex w-full items-center border-l-2 px-4 py-3 text-left text-sm font-medium transition-colors touch-manipulation-adjustment ${
                          activeCategory === option
                            ? "border-[#3B82F6] bg-[rgba(59,130,246,0.08)] text-white"
                            : "border-transparent text-gray-400 hover:border-[#3B82F6] hover:bg-[rgba(59,130,246,0.08)] hover:text-white"
                        }`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>

              <div className="relative" ref={debatesRef}>
                <button
                  onClick={() => {
                    setDebatesOpen((value) => !value);
                    setNewsOpen(false);
                    setAdminOpen(false);
                  }}
                  className={`relative flex h-9 items-center gap-1 px-1 text-sm font-semibold transition-colors ${
                    currentNav === "debates" ? "text-[#3B82F6]" : "text-white"
                  }`}
                >
                  DEBATES
                  <ChevronDown size={16} className={`transition-transform duration-200 ${debatesOpen ? "rotate-180" : ""}`} />
                  <span className={`absolute inset-x-0 -bottom-[8px] h-0.5 bg-[#3B82F6] transition-all duration-200 ${currentNav === "debates" ? "opacity-100" : "opacity-0"}`} />
                </button>
                {debatesOpen ? (
                  <div className="absolute left-0 top-full z-30 mt-2 min-w-[180px] overflow-hidden rounded-[10px] border border-[rgba(59,130,246,0.2)] bg-[#111827] p-2 shadow-[0_8px_32px_rgba(0,0,0,0.6)]" style={{ animation: "dropdownIn 150ms ease" }}>
                    <Link href="/debates" className="flex items-center gap-3 border-l-2 border-transparent px-4 py-3 text-sm font-medium text-gray-400 transition-colors hover:border-[#3B82F6] hover:bg-[rgba(59,130,246,0.08)] hover:text-white">
                      <span className={`h-2 w-2 rounded-full ${isDebateLive ? "bg-green-500" : "bg-red-500"}`} style={{ animation: "livePulse 1.2s infinite" }} />
                      Live
                    </Link>
                    <Link href="/debates/calendar" className="flex items-center gap-3 border-l-2 border-transparent px-4 py-3 text-sm font-medium text-gray-400 transition-colors hover:border-[#3B82F6] hover:bg-[rgba(59,130,246,0.08)] hover:text-white">
                      <CalendarDays size={16} />
                      Calendar
                    </Link>
                  </div>
                ) : null}
              </div>

              {isAdmin ? (
                <div className="relative" ref={adminRef}>
                  <button
                    onClick={() => {
                      setAdminOpen((value) => !value);
                      setNewsOpen(false);
                      setDebatesOpen(false);
                    }}
                    className={`relative flex h-9 items-center gap-1 px-1 text-sm font-semibold transition-colors ${
                      currentNav === "admin" ? "text-amber-400" : "text-amber-300"
                    }`}
                  >
                    <Shield size={15} />
                    ADMIN
                    <ChevronDown size={16} className={`transition-transform duration-200 ${adminOpen ? "rotate-180" : ""}`} />
                    <span className={`absolute inset-x-0 -bottom-[8px] h-0.5 bg-amber-400 transition-all duration-200 ${currentNav === "admin" ? "opacity-100" : "opacity-0"}`} />
                  </button>
                  {adminOpen ? (
                    <div className="absolute left-0 top-full z-30 mt-2 min-w-[220px] overflow-hidden rounded-[10px] border border-amber-500/20 bg-[#111827] p-2 shadow-[0_8px_32px_rgba(0,0,0,0.6)]" style={{ animation: "dropdownIn 150ms ease" }}>
                      <Link href="/admin/analytics" className="flex items-center border-l-2 border-transparent px-4 py-3 text-sm font-medium text-amber-100 transition-colors hover:border-amber-400 hover:bg-amber-500/10">Analytics</Link>
                      <Link href="/admin/post-news" className="flex items-center border-l-2 border-transparent px-4 py-3 text-sm font-medium text-amber-100 transition-colors hover:border-amber-400 hover:bg-amber-500/10">Post News</Link>
                      <Link href="/admin/manage-news" className="flex items-center border-l-2 border-transparent px-4 py-3 text-sm font-medium text-amber-100 transition-colors hover:border-amber-400 hover:bg-amber-500/10">Manage News</Link>
                      <Link href="/admin/automation-logs" className="flex items-center border-l-2 border-transparent px-4 py-3 text-sm font-medium text-amber-100 transition-colors hover:border-amber-400 hover:bg-amber-500/10">Automation Logs</Link>
                      <button
                        onClick={handleFetchNow}
                        disabled={fetchingNow}
                        className="flex w-full items-center border-l-2 border-transparent px-4 py-3 text-left text-sm font-medium text-amber-100 transition-colors hover:border-amber-400 hover:bg-amber-500/10 disabled:opacity-60"
                      >
                        {fetchingNow ? "Starting fetch..." : "Run Fetch Now"}
                      </button>
                    </div>
                  ) : null}
                </div>
              ) : null}
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

      {mobileOpen ? (
        <div className="fixed inset-0 z-50 bg-black/60 md:hidden">
          <div className="absolute inset-x-0 bottom-0 rounded-t-[28px] border border-white/10 bg-[#0D1117] p-6">
            <div className="mb-6 flex items-center justify-between">
              <div className="rounded-full border border-white/10 bg-[#1F2937] p-1">
                <button onClick={() => setSection("news")} className={`rounded-[20px] px-4 py-1.5 text-sm font-semibold ${section === "news" ? "bg-gradient-to-br from-[#2563EB] to-[#3B82F6] text-white" : "text-gray-300"}`}>NEWS</button>
                <button onClick={() => setSection("article")} className={`rounded-[20px] px-4 py-1.5 text-sm font-semibold ${section === "article" ? "bg-gradient-to-br from-[#2563EB] to-[#3B82F6] text-white" : "text-gray-300"}`}>ARTICLE</button>
              </div>
              <button onClick={() => setMobileOpen(false)} className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10" aria-label="Close navigation">
                <X size={18} />
              </button>
            </div>

            <div className="mb-6 text-sm">
              <div className="mb-3 text-[#6B7280]">{`${weekday}, ${month} ${day}`}</div>
              <div className="text-lg font-semibold text-[#F9FAFB]">{time} <span className="rounded-full bg-[#3B82F6] px-2 py-1 text-[11px] text-white">IST</span></div>
            </div>

            <div className="mb-6">
              <UserLink user={user} />
            </div>

            {section === "news" ? (
              <div className="space-y-4">
                <button onClick={() => { router.push("/dashboard/live"); setMobileOpen(false); }} className="flex w-full items-center gap-2 rounded-2xl border border-white/10 px-4 py-4 text-left text-[#EF4444]">
                  <span className="h-2 w-2 rounded-full bg-[#EF4444]" style={{ animation: "livePulse 1.2s infinite" }} />
                  LIVE
                </button>

                <div className="rounded-2xl border border-white/10 p-2">
                  <div className="px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">News</div>
                  {NEWS_OPTIONS.map((option) => (
                    <button key={option} onClick={() => { goToCategory(option); setMobileOpen(false); }} className="flex w-full items-center rounded-xl px-3 py-3 text-left text-white hover:bg-white/[0.04]">
                      {option}
                    </button>
                  ))}
                </div>

                <div className="rounded-2xl border border-white/10 p-2">
                  <div className="px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">Debates</div>
                  {DEBATE_OPTIONS.map((option) => (
                    <button key={option.href} onClick={() => { router.push(option.href); setMobileOpen(false); }} className="flex w-full items-center rounded-xl px-3 py-3 text-left text-white hover:bg-white/[0.04]">
                      {option.label}
                    </button>
                  ))}
                </div>

                {isAdmin ? (
                  <div className="rounded-2xl border border-amber-500/20 p-2">
                    <div className="px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-amber-300">Admin</div>
                    <button onClick={() => { router.push("/admin/analytics"); setMobileOpen(false); }} className="flex w-full rounded-xl px-3 py-3 text-left text-amber-100 hover:bg-amber-500/10">Analytics</button>
                    <button onClick={() => { router.push("/admin/post-news"); setMobileOpen(false); }} className="flex w-full rounded-xl px-3 py-3 text-left text-amber-100 hover:bg-amber-500/10">Post News</button>
                    <button onClick={() => { router.push("/admin/manage-news"); setMobileOpen(false); }} className="flex w-full rounded-xl px-3 py-3 text-left text-amber-100 hover:bg-amber-500/10">Manage News</button>
                    <button onClick={() => { router.push("/admin/automation-logs"); setMobileOpen(false); }} className="flex w-full rounded-xl px-3 py-3 text-left text-amber-100 hover:bg-amber-500/10">Automation Logs</button>
                    <button onClick={handleFetchNow} className="flex w-full rounded-xl px-3 py-3 text-left text-amber-100 hover:bg-amber-500/10">Run Fetch Now</button>
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
