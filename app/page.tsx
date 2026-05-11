"use client";

import Link from "next/link";
import { 
  ArrowRight, 
  MapPin, 
  Landmark, 
  Newspaper, 
  BarChart3, 
  CheckCircle2, 
  ShieldCheck, 
  Users, 
  MessageSquare, 
  Scale, 
  Vote,
  Gavel,
  History,
  Info,
  ChevronRight,
  User,
  Bell,
  X
} from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

const GoogleIcon = () => (
  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

const LIVE_NEWS_ITEMS = [
  "Finance Minister signals major GST overhaul in upcoming council meet.",
  "Supreme Court seeks response from Center on new digital media regulations.",
  "Opposition parties to hold joint rally in Mumbai over unemployment.",
  "Indian Space Agency successfully launches 3rd generation climate satellite.",
  "Local bodies election dates announced for Karnataka and Telangana.",
  "New education policy implementation reaches 70% of rural districts."
];

export default function LandingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [newsPopups, setNewsPopups] = useState<{ id: number; text: string }[]>([]);
  const newsIndex = useRef(0);

  useEffect(() => {
    setMounted(true);
    if (status === "authenticated") {
      router.push("/dashboard");
    }
    
    // News popup logic
    const interval = setInterval(() => {
      const id = Date.now();
      const text = LIVE_NEWS_ITEMS[newsIndex.current];
      setNewsPopups(prev => [...prev.slice(-2), { id, text }]);
      newsIndex.current = (newsIndex.current + 1) % LIVE_NEWS_ITEMS.length;

      // Auto remove after 5 seconds
      setTimeout(() => {
        setNewsPopups(prev => prev.filter(p => p.id !== id));
      }, 5000);
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  if (!mounted) return null;

  return (
    <div className="flex flex-col bg-midnight relative">
      {/* Newspaper Background Overlay (10% Opacity + Blur) */}
      <div 
        className="fixed inset-0 z-0 pointer-events-none opacity-[0.08] grayscale blur-[2px]"
        style={{ 
          backgroundImage: 'url("/images/newspaper-bg.png")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed'
        }}
      />

      {/* Live News Popups Container */}
      <div className="fixed bottom-10 right-6 z-[100] flex flex-col gap-4 w-full max-w-sm">
        <AnimatePresence>
          {newsPopups.map((news) => (
            <motion.div
              key={news.id}
              initial={{ opacity: 0, x: 50, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 50, scale: 0.9 }}
              className="bg-surface border border-accent-blue/30 p-4 rounded-xl shadow-2xl flex gap-4 items-start relative overflow-hidden group"
            >
              <div className="absolute top-0 left-0 w-1 h-full bg-accent-blue" />
              <div className="w-10 h-10 rounded-full bg-accent-blue/10 flex items-center justify-center shrink-0">
                <Bell size={18} className="text-accent-blue animate-bounce" />
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold text-accent-blue uppercase tracking-widest">LIVE_NEWS</span>
                  <button 
                    onClick={() => setNewsPopups(prev => prev.filter(p => p.id !== news.id))}
                    className="text-muted-foreground hover:text-white"
                  >
                    <X size={14} />
                  </button>
                </div>
                <p className="text-sm text-off-white font-medium leading-snug">
                  {news.text}
                </p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* SECTION 1 - NEWS TICKER (TOP) */}
      <div className="bg-surface/90 backdrop-blur-md border-b border-white/5 py-2 relative z-[100] overflow-hidden">
        <div className="flex items-center">
          <div className="px-6 bg-surface border-r border-white/10 shrink-0 flex items-center gap-2 relative z-10">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.6)]" />
            <span className="text-xs font-bold text-white tracking-widest">LIVE</span>
          </div>
          <div className="flex animate-ticker whitespace-nowrap">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-12 px-6 items-center">
                <span className="text-sm font-medium text-white/90 uppercase tracking-tight flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-white/20" /> LOK SABHA SESSION LIVE
                </span>
                <span className="text-sm font-medium text-white/90 uppercase tracking-tight flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-white/20" /> SUPREME COURT HEARING ON ELECTORAL BONDS RESUMES
                </span>
                <span className="text-sm font-medium text-white/90 uppercase tracking-tight flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-white/20" /> UP BUDGET 2025 TABLED: FOCUS ON INFRASTRUCTURE
                </span>
                <span className="text-sm font-medium text-white/90 uppercase tracking-tight flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-white/20" /> NEW CRIMINAL LAWS (BNS) IN EFFECT NATIONWIDE
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* SECTION 2 - HERO SECTION */}
      <section className="relative min-h-[90vh] flex items-center justify-center pt-10 px-6 overflow-hidden">
        {/* Subtle Radial Glow */}
        <div className="absolute inset-0 z-0 hero-glow" />
        
        <div className="container mx-auto text-center relative z-10 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex flex-col items-center space-y-8"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-accent-blue/10 rounded-full text-xs font-semibold text-accent-blue border border-accent-blue/20">
              🇮🇳 India&apos;s Political Debate Platform
            </div>
            
            <div className="space-y-4">
              <h1 className="text-7xl md:text-9xl font-heading font-extrabold tracking-tight text-accent-amber drop-shadow-[0_0_15px_rgba(245,158,11,0.3)]">
                RAJNEET
              </h1>
              <p className="text-4xl md:text-5xl font-heading font-bold text-white">
                Your Voice. Your Democracy.
              </p>
            </div>
            
            <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl">
              Read real political news. Debate your stance. Hold power accountable.
            </p>
            
            <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
              <Link
                href="/login"
                className="inline-flex h-14 items-center justify-center rounded-full bg-accent-blue px-10 text-base font-bold text-white transition-all hover:bg-accent-blue/90 hover:scale-[1.03] shadow-[0_0_20px_rgba(59,130,246,0.4)]"
              >
                <GoogleIcon />
                Get Started with Google
              </Link>
              <button className="inline-flex h-14 items-center justify-center rounded-full border border-white/20 bg-transparent px-10 text-base font-bold text-white transition-all hover:bg-white/5 hover:scale-[1.03]">
                See How It Works
              </button>
            </div>
            
            <div className="flex flex-wrap items-center justify-center gap-6 pt-12">
              {[
                { label: "12K+ Citizens", icon: Users },
                { label: "4,800+ Debates", icon: MessageSquare },
                { label: "Protected under Article 19(1)(a)", icon: ShieldCheck }
              ].map((chip, i) => (
                <div key={i} className="flex items-center gap-2 px-4 py-2 bg-surface/80 backdrop-blur-sm rounded-full border border-white/5 shadow-sm transition-transform hover:scale-105">
                  <chip.icon size={16} className="text-accent-blue" />
                  <span className="text-sm font-medium text-white">{chip.label}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Animated News Card Mockup */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 1 }}
            className="mt-24 max-w-2xl mx-auto animate-float"
          >
            <div className="bg-surface/90 backdrop-blur-md border border-white/10 rounded-2xl p-8 shadow-2xl text-left relative overflow-hidden group">
              <div className="flex justify-between items-center mb-6">
                <span className="text-[10px] font-bold text-accent-amber uppercase tracking-widest bg-accent-amber/10 px-2 py-0.5 rounded">BREAKING_NEWS</span>
                <span className="text-xs text-muted-foreground font-mono tracking-widest uppercase">02:14:45_IST</span>
              </div>
              <h3 className="text-2xl font-heading font-bold text-white mb-8 group-hover:text-accent-blue transition-colors">
                Parliament passes new Data Protection Bill with 350 votes in Lok Sabha.
              </h3>
              
              <div className="space-y-4">
                <div className="flex justify-between text-xs font-bold uppercase tracking-wider">
                  <span className="text-success-green">64% FOR</span>
                  <span className="text-danger-red">36% AGAINST</span>
                </div>
                <div className="h-3 w-full bg-midnight rounded-full flex overflow-hidden p-0.5 border border-white/5">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: "64%" }}
                    transition={{ duration: 1.5, ease: "easeOut", delay: 1.2 }}
                    className="h-full bg-success-green rounded-full shadow-[0_0_10px_rgba(16,185,129,0.3)]" 
                  />
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>


      {/* SECTION 3 - FEATURES GRID */}
      <section className="py-32 px-6 relative z-10">
        <div className="container mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
            <h2 className="text-4xl md:text-5xl font-heading font-bold text-white">Everything you need to participate in democracy</h2>
            <p className="text-lg text-muted-foreground">Built for citizens, lawyers, journalists, and activists.</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: MapPin, title: "Real News by District", desc: "Curated political intelligence delivered specifically to your location." },
              { icon: MessageSquare, title: "Structured Debate", desc: "Pick your stance and argue with verified professionals and citizens." },
              { icon: Landmark, title: "Parliament Tracker", desc: "Monitor every bill, every vote, and every session in real time." },
              { icon: Users, title: "Write to Your MP", desc: "Direct communication pipeline on record for public transparency." },
              { icon: Vote, title: "Opinion Polls", desc: "See where your district and the nation stand on critical policies." },
              { icon: ShieldCheck, title: "Fact vs Opinion Tagging", desc: "Every word tagged to separate verified truth from perspective." }
            ].map((feature, i) => (
              <div key={i} className="p-8 bg-surface/80 backdrop-blur-sm rounded-xl border border-white/5 transition-all duration-300 hover:bg-border-alt hover:-translate-y-2 group">
                <div className="w-12 h-12 rounded-lg bg-accent-blue/10 flex items-center justify-center text-accent-blue mb-6 group-hover:bg-accent-blue group-hover:text-white transition-all">
                  <feature.icon size={24} />
                </div>
                <h3 className="text-xl font-heading font-bold text-white mb-3">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 4 - HOW IT WORKS */}
      <section className="py-32 px-6 bg-surface/40 backdrop-blur-sm border-y border-white/5 relative z-10">
        <div className="container mx-auto">
          <div className="relative grid md:grid-cols-3 gap-20 max-w-5xl mx-auto">
            {/* Dashed Connector (Desktop) */}
            <div className="hidden md:block absolute top-12 left-[15%] right-[15%] h-[1px] border-t border-dashed border-white/20 z-0" />
            
            {[
              { step: "01", title: "Join the Platform", desc: "Login with Google and set your location to start your journey." },
              { step: "02", title: "Analyze Reality", desc: "Read news curated for your specific district and state interest." },
              { step: "03", title: "Make Your Mark", desc: "Debate, vote, and write to your representative on public record." }
            ].map((item, i) => (
              <div key={i} className="relative z-10 text-center flex flex-col items-center group">
                <div className="w-24 h-24 rounded-full bg-midnight border border-white/10 flex items-center justify-center text-3xl font-heading font-extrabold text-accent-blue mb-8 transition-all group-hover:bg-accent-blue group-hover:text-white group-hover:scale-110 shadow-xl">
                  {item.step}
                </div>
                <h3 className="text-2xl font-heading font-bold text-white mb-4">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed max-w-xs mx-auto">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 5 - ROLES SECTION */}
      <section className="py-32 px-6 relative z-10">
        <div className="container mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-heading font-bold text-white">Built for every Indian citizen</h2>
          </div>
          
          <div className="grid sm:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {[
              { role: "Citizen", color: "border-accent-blue", icon: User, desc: "Read, debate, vote, and petition your representatives in district level." },
              { role: "Lawyer", color: "border-purple-500", icon: Gavel, desc: "Verified legal voice. Challenge facts, flag misinformation, and argue cases." },
              { role: "Journalist", color: "border-accent-amber", icon: Newspaper, desc: "Break stories, share investigations, and reach a civic audience directly." },
              { role: "Activist", color: "border-success-green", icon: Users, desc: "Organise opinion, track bills, and mobilise your constituency." }
            ].map((role, i) => (
              <div key={i} className={`p-10 bg-surface/80 backdrop-blur-sm rounded-2xl border border-white/5 border-t-4 ${role.color} transition-all hover:scale-[1.02] hover:shadow-2xl group`}>
                <role.icon className="w-10 h-10 text-white opacity-40 mb-8 group-hover:opacity-100 transition-opacity" />
                <h3 className="text-3xl font-heading font-bold text-white mb-4">{role.role}</h3>
                <p className="text-lg text-muted-foreground leading-relaxed">{role.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 6 - CONSTITUTION STRIP */}
      <section className="py-32 px-6 bg-gradient-to-b from-surface/60 to-midnight/80 backdrop-blur-md border-y border-white/5 relative z-10">
        <div className="container mx-auto text-center space-y-12 max-w-4xl">
          <div className="flex justify-center">
            <img 
              src="https://upload.wikimedia.org/wikipedia/commons/1/17/Ashoka_Chakra.svg" 
              alt="Ashoka Chakra" 
              className="w-20 h-20 opacity-30 brightness-0 invert sepia(100%) hue-rotate(190deg) saturate(500%)"
              style={{ filter: 'invert(58%) sepia(91%) saturate(1478%) hue-rotate(190deg) brightness(100%) contrast(100%)' }}
            />
          </div>
          <div className="space-y-6">
            <h2 className="text-4xl md:text-5xl font-heading font-bold text-white leading-tight">
              &quot;Freedom of speech and expression is your fundamental right.&quot;
            </h2>
            <p className="text-xl text-muted-foreground">
              Article 19(1)(a) — Constitution of India. <br />
              RAJNEET is built entirely within your rights.
            </p>
          </div>
          <div className="pt-8">
            <Link
              href="/login"
              className="inline-flex h-14 items-center justify-center rounded-full bg-accent-blue px-12 text-lg font-bold text-white transition-all hover:bg-accent-blue/90 hover:scale-105 shadow-[0_0_30px_rgba(59,130,246,0.3)]"
            >
              Join RAJNEET Free
            </Link>
          </div>
        </div>
      </section>

      {/* SECTION 7 - FOOTER */}
      <footer className="bg-surface/90 backdrop-blur-md pt-20 pb-10 px-6 border-t border-white/5 relative z-10">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-3 gap-16 mb-20">
            <div className="space-y-6">
              <h2 className="text-3xl font-heading font-extrabold text-accent-amber">RAJNEET</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Your Voice. Your Democracy. <br />
                Dedicated to Article 19(1)(a).
              </p>
            </div>
            
            <div className="space-y-6">
              <h4 className="text-xs font-bold text-white uppercase tracking-widest">Platform</h4>
              <nav className="flex flex-col gap-3 text-sm text-muted-foreground">
                <Link href="#" className="hover:text-accent-blue transition-colors">About</Link>
                <Link href="#" className="hover:text-accent-blue transition-colors">Privacy Policy</Link>
                <Link href="#" className="hover:text-accent-blue transition-colors">Terms of Service</Link>
                <Link href="#" className="hover:text-accent-blue transition-colors">Grievance Officer</Link>
              </nav>
            </div>
            
            <div className="space-y-6">
              <p className="text-sm text-muted-foreground italic">
                &quot;Not affiliated with any political party or government body.&quot;
              </p>
              <div className="flex gap-4">
                {/* Social Placeholder */}
                {[1, 2, 3].map((i) => (
                  <div key={i} className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center hover:bg-accent-blue hover:border-accent-blue transition-all cursor-pointer">
                    <ArrowRight size={18} className="text-muted-foreground" />
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="pt-8 border-t border-white/5 text-center">
            <p className="text-xs text-muted-foreground">
              © 2025 RAJNEET. All rights reserved. Built for India.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
