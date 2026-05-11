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

interface TickerItem {
  headline: string;
  category: string;
  geo_level: string;
}

interface PreviewNews {
  id: string;
  headline: string;
  summary: string;
  cover_image_url: string | null;
  category: string;
  geo_level: string;
  state: string | null;
  created_at: Date;
  slug: string | null;
}

export default function LandingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [tickerItems, setTickerItems] = useState<TickerItem[]>([]);
  const [previewNews, setPreviewNews] = useState<PreviewNews[]>([]);
  const [newsPopups, setNewsPopups] = useState<{ id: number; text: string }[]>([]);
  const [currentNewsSet, setCurrentNewsSet] = useState(0);
  const [showCreatorsPopup, setShowCreatorsPopup] = useState(true);
  const newsIndex = useRef(0);

  useEffect(() => {
    setMounted(true);
    // Fetch ticker data
    fetch('/api/public/ticker')
      .then(res => res.json())
      .then(data => setTickerItems(data))
      .catch(err => console.error('Failed to fetch ticker:', err));
    // Fetch preview news
    fetch('/api/public/preview-news')
      .then(res => res.json())
      .then(data => setPreviewNews(data))
      .catch(err => console.error('Failed to fetch preview news:', err));
  }, []);

  useEffect(() => {
    // News popup logic using real news - slower speed
    const interval = setInterval(() => {
      if (tickerItems.length === 0) return;
      const id = Date.now();
      const news = tickerItems[newsIndex.current % tickerItems.length];
      const text = `${news.category} — ${news.headline}`;
      setNewsPopups(prev => [...prev.slice(-2), { id, text }]);
      newsIndex.current = (newsIndex.current + 1) % tickerItems.length;

      // Auto remove after 8 seconds
      setTimeout(() => {
        setNewsPopups(prev => prev.filter(p => p.id !== id));
      }, 8000);
    }, 20000);

    return () => clearInterval(interval);
  }, [tickerItems]);

  useEffect(() => {
    // Auto-rotate news cards every 5 seconds
    const interval = setInterval(() => {
      if (previewNews.length >= 3) {
        setCurrentNewsSet(prev => (prev + 1) % Math.floor(previewNews.length / 3));
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [previewNews]);

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
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-4 w-full max-w-[380px]">
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

      {/* Meet the Creators Popup - Desktop Only */}
      <AnimatePresence>
        {showCreatorsPopup && status !== "authenticated" && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="hidden md:block fixed top-20 right-6 z-[99] bg-surface/95 backdrop-blur-md border border-accent-amber/30 rounded-xl shadow-2xl p-5 max-w-sm"
          >
            <div className="mb-4">
              <h3 className="text-lg font-bold text-white">Meet the Creators</h3>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full border-2 border-accent-amber overflow-hidden flex-shrink-0">
                  <img
                    src="https://i.ibb.co/JRTRH2wz/kumar-shourya.jpg"
                    alt="Kumar Shourya"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <p className="text-white font-semibold">Kumar Shourya</p>
                  <p className="text-xs text-muted-foreground">Co-Founder</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full border-2 border-accent-amber overflow-hidden flex-shrink-0">
                  <img
                    src="https://i.ibb.co/Vpz344P8/devanshu-bhardwaj.jpg"
                    alt="Devanshu Bhardwaj"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <p className="text-white font-semibold">Devanshu Bhardwaj</p>
                  <p className="text-xs text-muted-foreground">Co-Founder</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation Header */}
      <nav className="fixed top-0 left-0 right-0 bg-surface/95 backdrop-blur-md border-b border-white/5 z-[100] px-6 py-4">
        <div className="container mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-accent-amber/10 rounded-xl flex items-center justify-center border border-accent-amber/20 group-hover:scale-110 transition-transform">
              <Landmark size={24} className="text-accent-amber" />
            </div>
            <span className="text-2xl font-heading font-black text-accent-amber tracking-tighter">RAJNEET</span>
          </Link>
          <div className="flex items-center gap-4">
            {status === "authenticated" && (
              <button onClick={() => router.push('/dashboard')} className="p-2 text-white hover:bg-white/10 rounded-lg transition-colors">
                <Bell size={20} />
              </button>
            )}
            {status === "authenticated" && (
              <Link href="/dashboard" className="px-4 py-2 bg-accent-blue text-white text-sm font-bold rounded-lg hover:bg-accent-blue/90 transition-colors">
                Dashboard
              </Link>
            )}
          </div>
        </div>
      </nav>

      
      {/* SECTION 2 - HERO SECTION */}
      <section className="relative min-h-[90vh] flex items-center px-6 overflow-hidden">
        {/* Subtle Radial Glow */}
        <div className="absolute inset-0 z-0 hero-glow" />
        
        <div className="container mx-auto relative z-10 max-w-[1200px]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left Column - Text Content */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="flex flex-col space-y-8 text-left"
            >
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-accent-blue/10 rounded-full text-xs font-semibold text-accent-blue border border-accent-blue/20 w-fit">
                🇮🇳 RAJNEET - India's Political Debate Platform
              </div>
              
              <div className="space-y-4">
                <h1 className="text-6xl md:text-7xl font-heading font-bold text-accent-amber tracking-tight">
                  RAJNEET
                </h1>
                <p className="text-4xl md:text-5xl font-heading font-bold text-white">
                  Your Voice. Your Democracy.
                </p>
              </div>
              
              <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl">
                Read real political news. Debate your stance. Hold power accountable.
              </p>
              
              <div className="flex flex-col items-start gap-4 pt-4">
                {status === "authenticated" ? (
                  <>
                    <Link
                      href="/dashboard"
                      className="inline-flex h-14 items-center justify-center rounded-full bg-accent-blue px-10 text-base font-bold text-white transition-all hover:bg-accent-blue/90 hover:scale-[1.03] shadow-[0_0_20px_rgba(59,130,246,0.4)] gap-3"
                    >
                      Continue Reading
                      <ArrowRight size={20} />
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      href="/login"
                      className="inline-flex h-14 items-center justify-center rounded-full bg-accent-blue px-10 text-base font-bold text-white transition-all hover:bg-accent-blue/90 hover:scale-[1.03] shadow-[0_0_20px_rgba(59,130,246,0.4)] gap-3"
                    >
                      <GoogleIcon />
                      Login with Google to Continue Reading
                    </Link>
                    <p className="text-sm text-muted-foreground -mt-2">
                      Free forever. No credit card. Protected under Article 19(1)(a).
                    </p>
                  </>
                )}
                <button className="inline-flex h-14 items-center justify-center rounded-full border border-white/20 bg-transparent px-10 text-base font-bold text-white transition-all hover:bg-white/5 hover:scale-[1.03]">
                  See How It Works
                </button>
              </div>

              
              <div className="flex flex-wrap items-center gap-6 pt-12">
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

            {/* Right Column - News Preview Cards (Desktop) */}
            <div className="hidden lg:block relative h-[500px]">
              <AnimatePresence mode="wait">
                {previewNews.length >= 3 && (
                  <motion.div
                    key={currentNewsSet}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                    className="relative w-full h-full"
                  >
                    {previewNews.slice(currentNewsSet * 3, currentNewsSet * 3 + 3).map((news, index) => {
                      const isRecent = new Date(news.created_at).getTime() > Date.now() - 2 * 60 * 60 * 1000;
                      const rotations = [0, 2, -2];
                      const offsets = [0, 20, -20];
                      const zIndices = [10, 5, 1];
                      
                      return (
                        <motion.div
                          key={news.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className={`absolute w-[320px] bg-surface/90 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden shadow-2xl cursor-pointer group`}
                          style={{
                            transform: `rotate(${rotations[index]}deg) translateY(${offsets[index]}px)`,
                            zIndex: zIndices[index],
                            left: `${index * 40}px`,
                            top: `${index * 30}px`,
                          }}
                          whileHover={{
                            scale: 1.05,
                            zIndex: 50,
                            transition: { duration: 0.2 }
                          }}
                        >
                          {/* Cover Image */}
                          <div className="relative h-48 w-full">
                            <img
                              src={news.cover_image_url || `/api/og?title=${encodeURIComponent(news.headline)}&category=${news.category}`}
                              alt={news.headline}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.src = `/api/og?title=${encodeURIComponent(news.headline)}&category=${news.category}`;
                              }}
                            />
                            {/* Category Badge */}
                            <div className="absolute top-3 left-3">
                              <span className="px-2 py-0.5 bg-accent-blue/90 text-white text-[8px] font-bold uppercase tracking-wider rounded-full">
                                {news.category}
                              </span>
                            </div>
                            {/* LIVE/NEW Badge */}
                            {isRecent && (
                              <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-red-500/90 px-2 py-1 rounded-full">
                                <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                                <span className="text-[10px] font-bold text-white uppercase">LIVE</span>
                              </div>
                            )}
                          </div>
                          
                          {/* Content */}
                          <div className="p-4">
                            <h3 className="text-white font-semibold text-base leading-snug line-clamp-2 mb-2">
                              {news.headline}
                            </h3>
                            <p className="text-muted-foreground text-xs line-clamp-1">
                              {news.summary}
                            </p>
                          </div>

                          {/* Login Overlay */}
                          {status !== "authenticated" && (
                            <div className="absolute inset-x-0 bottom-0 h-1/3 bg-midnight/80 backdrop-blur-md border-t border-white/10 flex items-center justify-center">
                              <p className="text-xs font-bold text-white text-center px-4">
                                Login to read and debate
                              </p>
                            </div>
                          )}
                        </motion.div>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
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
              <img 
                src="/images/rajneet-logo.png" 
                alt="RAJNEET Logo" 
                className="h-8 w-auto mb-4"
              />
              <p className="text-sm text-muted-foreground leading-relaxed">
                Your Voice. Your Democracy. <br />
                Dedicated to Article 19(1)(a).
              </p>
            </div>
            
            <div className="space-y-6">
              <h4 className="text-xs font-bold text-white uppercase tracking-widest">Platform</h4>
              <nav className="flex flex-col gap-3 text-sm text-muted-foreground">
                <Link href="/privacy" className="hover:text-accent-blue transition-colors">Privacy Policy</Link>
                <Link href="/terms" className="hover:text-accent-blue transition-colors">Terms of Service</Link>
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
