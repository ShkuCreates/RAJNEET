"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ChevronDown, Menu, X } from "lucide-react";

type DashboardUser = {
  id?: string;
  name?: string | null;
  email?: string | null;
  avatar_url?: string | null;
};

type DashboardShellProps = {
  user: DashboardUser;
  children: React.ReactNode;
};

const NEWS_OPTIONS = ["Politics", "Finance", "Sports", "World"] as const;
const DEBATE_OPTIONS = [
  { label: "Live", href: "/debates" },
  { label: "Calendar", href: "/debates/calendar" },
] as const;

function UserLink({ user }: { user: DashboardUser }) {
  if (!user?.id) {
    return (
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 animate-pulse rounded-full bg-white/10" />
        <div className="h-4 w-24 animate-pulse rounded bg-white/10" />
      </div>
    );
  }

  return (
    <Link href="/profile" className="flex items-center gap-3 transition-opacity hover:opacity-80">
      {user.avatar_url ? (
        <img
          src={user.avatar_url}
          alt={user.name || "Profile"}
          className="h-9 w-9 rounded-full object-cover"
          referrerPolicy="no-referrer"
        />
      ) : (
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1f2937] text-sm font-semibold text-white">
          {(user.name || "U").charAt(0).toUpperCase()}
        </div>
      )}
      <span className="max-w-[120px] truncate text-sm font-medium text-white">
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
          <stop offset="0%" stopColor="#f58529" />
          <stop offset="50%" stopColor="#dd2a7b" />
          <stop offset="100%" stopColor="#515bd4" />
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
  const [section, setSection] = useState<"news" | "article">("news");
  const [newsOpen, setNewsOpen] = useState(false);
  const [debatesOpen, setDebatesOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [now, setNow] = useState(() => new Date());
  const newsRef = useRef<HTMLDivElement | null>(null);
  const debatesRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (newsRef.current && !newsRef.current.contains(target)) {
        setNewsOpen(false);
      }
      if (debatesRef.current && !debatesRef.current.contains(target)) {
        setDebatesOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setNewsOpen(false);
    setDebatesOpen(false);
  }, [pathname]);

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
    pathname === "/dashboard/live" ? "live" : pathname.startsWith("/debates") ? "debates" : "news";

  const goToCategory = (category: string) => {
    router.push(`/dashboard?category=${encodeURIComponent(category)}`);
    setNewsOpen(false);
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#050A14] text-white">
      <header className="border-b border-white/5 bg-[#111827]">
        <div className="mx-auto flex h-14 w-full max-w-[1400px] items-center justify-between gap-4 px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-3">
            <img src="/images/rajneet-logo.png" alt="RAJNEET" className="h-8 w-auto" />
            <span className="text-2xl font-heading font-black tracking-tight text-accent-amber">
              RAJNEET
            </span>
          </Link>

          <div className="hidden rounded-full border border-white/10 bg-white/[0.04] p-1 md:flex">
            <button
              onClick={() => setSection("news")}
              className={`rounded-full px-5 py-1.5 text-sm font-semibold transition-all duration-200 ${
                section === "news" ? "bg-accent-blue text-white" : "text-gray-300"
              }`}
            >
              NEWS
            </button>
            <button
              onClick={() => setSection("article")}
              className={`rounded-full px-5 py-1.5 text-sm font-semibold transition-all duration-200 ${
                section === "article" ? "bg-accent-blue text-white" : "text-gray-300"
              }`}
            >
              ARTICLE
            </button>
          </div>

          <div className="hidden items-center gap-4 md:flex">
            <div className="text-right text-[15px]">
              <span className="text-gray-400">{`${weekday}, ${month} ${day} - `}</span>
              <span className="text-white">{time} </span>
              <span className="text-accent-blue">IST</span>
            </div>
            <div className="h-7 w-px bg-white/10" />
            <UserLink user={user} />
          </div>

          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] md:hidden"
            aria-label="Open navigation"
          >
            <Menu size={18} />
          </button>
        </div>
      </header>

      {section === "news" ? (
        <div className="border-b border-accent-blue/60 bg-[#0D1117]">
          <div className="mx-auto flex h-12 w-full max-w-[1400px] items-center justify-between gap-4 px-4 sm:px-6">
            <div className="hidden items-center gap-8 md:flex">
              <button
                onClick={() => router.push("/dashboard/live")}
                className={`relative flex h-12 items-center gap-2 text-sm font-medium ${
                  currentNav === "live" ? "text-white" : "text-gray-300 hover:text-white"
                }`}
              >
                <span className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
                LIVE
                <span
                  className={`absolute inset-x-0 bottom-0 h-0.5 bg-accent-blue transition-opacity ${
                    currentNav === "live" ? "opacity-100" : "opacity-0"
                  }`}
                />
              </button>

              <div className="relative" ref={newsRef}>
                <button
                  onClick={() => {
                    setNewsOpen((value) => !value);
                    setDebatesOpen(false);
                  }}
                  className={`relative flex h-12 items-center gap-1 text-sm font-medium ${
                    currentNav === "news" ? "text-white" : "text-gray-300 hover:text-white"
                  }`}
                >
                  NEWS
                  <ChevronDown size={16} className={`transition-transform ${newsOpen ? "rotate-180" : ""}`} />
                  <span
                    className={`absolute inset-x-0 bottom-0 h-0.5 bg-accent-blue transition-opacity ${
                      currentNav === "news" ? "opacity-100" : "opacity-0"
                    }`}
                  />
                </button>
                {newsOpen ? (
                  <div className="absolute left-0 top-full z-30 mt-2 w-52 overflow-hidden rounded-2xl border border-white/10 bg-[#111827] p-2 shadow-2xl">
                    {NEWS_OPTIONS.map((option) => (
                      <button
                        key={option}
                        onClick={() => goToCategory(option)}
                        className={`flex w-full items-center border-l-2 px-4 py-3 text-left text-sm ${
                          activeCategory === option
                            ? "border-accent-blue bg-accent-blue/10 text-white"
                            : "border-transparent text-gray-300 hover:bg-white/[0.04] hover:text-white"
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
                  }}
                  className={`relative flex h-12 items-center gap-1 text-sm font-medium ${
                    currentNav === "debates" ? "text-white" : "text-gray-300 hover:text-white"
                  }`}
                >
                  DEBATES
                  <ChevronDown size={16} className={`transition-transform ${debatesOpen ? "rotate-180" : ""}`} />
                  <span
                    className={`absolute inset-x-0 bottom-0 h-0.5 bg-accent-blue transition-opacity ${
                      currentNav === "debates" ? "opacity-100" : "opacity-0"
                    }`}
                  />
                </button>
                {debatesOpen ? (
                  <div className="absolute left-0 top-full z-30 mt-2 w-52 overflow-hidden rounded-2xl border border-white/10 bg-[#111827] p-2 shadow-2xl">
                    {DEBATE_OPTIONS.map((option) => (
                      <Link
                        key={option.href}
                        href={option.href}
                        className={`flex items-center border-l-2 px-4 py-3 text-sm ${
                          pathname === option.href
                            ? "border-accent-blue bg-accent-blue/10 text-white"
                            : "border-transparent text-gray-300 hover:bg-white/[0.04] hover:text-white"
                        }`}
                      >
                        {option.label}
                      </Link>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>

            <div className="hidden md:block">
              <UserLink user={user} />
            </div>
          </div>
        </div>
      ) : null}

      <main className="flex-1">
        {section === "article" ? (
          <div className="mx-auto flex min-h-[calc(100vh-160px)] max-w-[1200px] items-center justify-center px-6 py-12 text-center">
            <div className="rounded-[28px] border border-white/10 bg-[#111827] px-8 py-16 shadow-2xl">
              <h1 className="mb-3 text-3xl font-semibold text-white">Coming Soon</h1>
              <p className="text-base text-gray-400">Articles section launching soon. Stay tuned.</p>
            </div>
          </div>
        ) : (
          children
        )}
      </main>

      <footer className="border-t border-white/10 bg-[#0D1117]">
        <div className="mx-auto flex min-h-12 w-full max-w-[1400px] flex-col items-center justify-between gap-3 px-4 py-3 text-center text-sm text-gray-400 md:flex-row md:px-6 md:text-left">
          <div className="flex items-center gap-3">
            <Link href="/terms" className="hover:text-white">
              Terms of Service
            </Link>
            <span>|</span>
            <Link href="/privacy" className="hover:text-white">
              Privacy Policy
            </Link>
          </div>
          <a
            href="https://www.instagram.com/rajneet.co.in/"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 hover:text-white"
          >
            <InstagramIcon />
            <span>Instagram</span>
          </a>
          <div>
            Made with <span className="text-red-500">❤️</span> in India
          </div>
        </div>
      </footer>

      {mobileOpen ? (
        <div className="fixed inset-0 z-50 bg-black/60 md:hidden">
          <div className="absolute inset-x-0 bottom-0 rounded-t-[28px] border border-white/10 bg-[#0D1117] p-6">
            <div className="mb-6 flex items-center justify-between">
              <div className="rounded-full border border-white/10 bg-white/[0.04] p-1">
                <button
                  onClick={() => setSection("news")}
                  className={`rounded-full px-4 py-1.5 text-sm font-semibold ${
                    section === "news" ? "bg-accent-blue text-white" : "text-gray-300"
                  }`}
                >
                  NEWS
                </button>
                <button
                  onClick={() => setSection("article")}
                  className={`rounded-full px-4 py-1.5 text-sm font-semibold ${
                    section === "article" ? "bg-accent-blue text-white" : "text-gray-300"
                  }`}
                >
                  ARTICLE
                </button>
              </div>
              <button
                onClick={() => setMobileOpen(false)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10"
                aria-label="Close navigation"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mb-6 text-sm">
              <div className="mb-3 text-gray-400">{`${weekday}, ${month} ${day}`}</div>
              <div className="text-white">
                {time} <span className="text-accent-blue">IST</span>
              </div>
            </div>

            <div className="mb-6">
              <UserLink user={user} />
            </div>

            {section === "news" ? (
              <div className="space-y-4">
                <button
                  onClick={() => {
                    router.push("/dashboard/live");
                    setMobileOpen(false);
                  }}
                  className="flex w-full items-center gap-2 rounded-2xl border border-white/10 px-4 py-4 text-left text-white"
                >
                  <span className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
                  LIVE
                </button>

                <div className="rounded-2xl border border-white/10 p-2">
                  <div className="px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">
                    News
                  </div>
                  {NEWS_OPTIONS.map((option) => (
                    <button
                      key={option}
                      onClick={() => {
                        goToCategory(option);
                        setMobileOpen(false);
                      }}
                      className="flex w-full items-center rounded-xl px-3 py-3 text-left text-white hover:bg-white/[0.04]"
                    >
                      {option}
                    </button>
                  ))}
                </div>

                <div className="rounded-2xl border border-white/10 p-2">
                  <div className="px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">
                    Debates
                  </div>
                  {DEBATE_OPTIONS.map((option) => (
                    <button
                      key={option.href}
                      onClick={() => {
                        router.push(option.href);
                        setMobileOpen(false);
                      }}
                      className="flex w-full items-center rounded-xl px-3 py-3 text-left text-white hover:bg-white/[0.04]"
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
