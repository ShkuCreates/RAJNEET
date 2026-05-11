"use client";

import Link from "next/link";
import { 
  ArrowRight, 
  Play, 
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
  Info
} from "lucide-react";
import { useEffect, useState } from "react";

export default function LandingPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="flex flex-col bg-navy-primary overflow-hidden">
      {/* SECTION 1 - HERO SECTION */}
      <section className="relative min-h-screen flex items-center justify-center pt-20 px-6">
        {/* Animated Background Mesh */}
        <div className="absolute inset-0 z-0 mesh-gradient opacity-60" />
        <div className="absolute inset-0 z-0 india-dot-map opacity-20" />
        
        <div className="container mx-auto grid lg:grid-cols-2 gap-12 items-center relative z-10">
          {/* Left Hero Content */}
          <div className="flex flex-col space-y-8 animate-fade-up">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 border border-saffron/30 bg-saffron/5 rounded text-[10px] font-mono font-bold text-saffron uppercase tracking-[0.2em] w-fit">
              🇮🇳 India&apos;s Civic Debate Platform
            </div>
            
            <h1 className="text-6xl md:text-8xl font-editorial font-bold leading-tight text-white">
              Where India&apos;s Voice <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-saffron to-gold">Becomes Policy</span>
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-xl leading-relaxed">
              Protected under <span className="text-white font-medium">Article 19(1)(a)</span> of the Indian Constitution. Debate real news, track Parliament, and make your opinion count.
            </p>
            
            <div className="flex flex-wrap gap-4 pt-4">
              <Link
                href="/login"
                className="inline-flex h-14 items-center justify-center rounded-md bg-saffron px-8 text-base font-bold text-white shadow-lg shadow-saffron/20 transition-all hover:bg-saffron/90 hover:scale-[1.02] active:scale-95"
              >
                Enter RAJNEET
              </Link>
              <button className="inline-flex h-14 items-center justify-center rounded-md border border-white/10 bg-white/5 px-8 text-base font-bold text-white transition-all hover:bg-white/10 group">
                <Play className="mr-2 h-4 w-4 fill-white group-hover:text-saffron transition-colors" />
                Watch How It Works
              </button>
            </div>
            
            <div className="flex items-center gap-4 pt-6">
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="w-10 h-10 rounded-full border-2 border-navy-primary bg-navy-secondary flex items-center justify-center text-[10px] font-bold text-muted-foreground overflow-hidden">
                    <img 
                      src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i + 100}`} 
                      alt="User" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
              <p className="text-xs font-medium text-muted-foreground">
                Join <span className="text-white">1,200+ citizens</span> already debating
              </p>
            </div>
          </div>

          {/* Right Hero Content - Floating Cards */}
          <div className="hidden lg:flex justify-center items-center relative h-[600px]">
            {/* Blurred Depth Cards */}
            <div className="absolute top-1/4 -right-4 w-72 p-6 border border-white/5 bg-navy-secondary/40 backdrop-blur-md rounded-xl rotate-12 opacity-30 animate-float [animation-delay:1s]">
              <div className="h-4 w-20 bg-white/10 rounded mb-4" />
              <div className="h-6 w-full bg-white/20 rounded mb-2" />
              <div className="h-4 w-2/3 bg-white/10 rounded" />
            </div>
            
            <div className="absolute bottom-1/4 -left-8 w-72 p-6 border border-white/5 bg-navy-secondary/40 backdrop-blur-md rounded-xl -rotate-12 opacity-30 animate-float [animation-delay:2s]">
              <div className="h-4 w-12 bg-white/10 rounded mb-4" />
              <div className="h-6 w-full bg-white/20 rounded mb-2" />
              <div className="h-4 w-1/2 bg-white/10 rounded" />
            </div>

            {/* Main Animated Card */}
            <div className="w-[400px] border border-white/10 bg-navy-secondary shadow-2xl rounded-2xl overflow-hidden animate-float">
              <div className="p-6 border-b border-white/5 flex justify-between items-center">
                <span className="px-2 py-0.5 rounded bg-saffron/10 text-[10px] font-mono font-bold text-saffron uppercase tracking-widest">
                  LEGISLATIVE UPDATE
                </span>
                <span className="text-[10px] font-mono font-bold text-muted-foreground">4M AGO</span>
              </div>
              
              <div className="p-8 space-y-6">
                <h3 className="text-2xl font-editorial font-bold leading-snug">
                  Parliament passes new Data Protection Bill with 350 votes in Lok Sabha.
                </h3>
                
                <div className="flex gap-2">
                  {["CITIZEN", "LAWYER", "JOURNALIST"].map((role) => (
                    <span key={role} className="px-1.5 py-0.5 rounded bg-white/5 text-[9px] font-mono font-bold text-muted-foreground">
                      {role}
                    </span>
                  ))}
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-[10px] font-mono font-bold text-muted-foreground">
                    <span className="text-saffron">64% FOR</span>
                    <span>36% AGAINST</span>
                  </div>
                  <div className="h-2.5 w-full bg-white/5 rounded-full flex overflow-hidden">
                    <div className="h-full bg-saffron animate-in slide-in-from-left duration-1000" style={{ width: '64%' }} />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                  <div className="flex items-center gap-2">
                    <MessageSquare size={16} className="text-muted-foreground" />
                    <span className="text-xs font-bold text-muted-foreground">1,204</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users size={16} className="text-muted-foreground" />
                    <span className="text-xs font-bold text-muted-foreground">Live Opinion...</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2 - LIVE TICKER BAR */}
      <div className="relative z-20 border-y border-white/5 bg-navy-secondary/80 backdrop-blur-sm overflow-hidden py-4">
        <div className="flex animate-ticker whitespace-nowrap">
          {[1, 2].map((i) => (
            <div key={i} className="flex gap-12 items-center px-6">
              <span className="flex items-center gap-3 text-sm font-mono font-bold uppercase tracking-widest text-white border-l-2 border-saffron pl-4">
                <span className="text-saffron">•</span> Lok Sabha Session Live
              </span>
              <span className="flex items-center gap-3 text-sm font-mono font-bold uppercase tracking-widest text-white border-l-2 border-saffron pl-4">
                <span className="text-saffron">•</span> Supreme Court hearing on Electoral Bonds
              </span>
              <span className="flex items-center gap-3 text-sm font-mono font-bold uppercase tracking-widest text-white border-l-2 border-saffron pl-4">
                <span className="text-saffron">•</span> UP Budget 2025 tabled
              </span>
              <span className="flex items-center gap-3 text-sm font-mono font-bold uppercase tracking-widest text-white border-l-2 border-saffron pl-4">
                <span className="text-saffron">•</span> New Criminal Law BNS in effect
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 3 - FEATURE HIGHLIGHTS */}
      <section className="py-32 px-6 relative">
        <div className="container mx-auto">
          <div className="text-center space-y-4 mb-20 animate-fade-up">
            <h2 className="text-4xl md:text-5xl font-editorial font-bold">A Platform Built For Real Democracy</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">Verified news, structured debates, and a direct line to your representatives.</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { 
                icon: Newspaper, 
                title: "Real Political News", 
                desc: "Verified news posted by admins, categorised by district, state, and national level." 
              },
              { 
                icon: MessageSquare, 
                title: "Structured Debate", 
                desc: "Pick your stance (For/Against/Neutral) and argue with verified citizens and professionals." 
              },
              { 
                icon: Landmark, 
                title: "Parliament Tracker", 
                desc: "Track every bill, every vote, every session in real time from our custom dashboard." 
              },
              { 
                icon: Gavel, 
                title: "Fact vs Opinion", 
                desc: "Every claim tagged as Fact, Opinion, Allegation, or Satire so you know what's verified." 
              },
              { 
                icon: Vote, 
                title: "Opinion Polls", 
                desc: "See what your district thinks vs what the nation thinks on critical legislative issues." 
              },
              { 
                icon: Users, 
                title: "Citizen to MP Pipeline", 
                desc: "Write directly to your local MP, publicly and on record. Transparency in action." 
              }
            ].map((feature, i) => (
              <div 
                key={i} 
                className="group p-8 border border-white/5 bg-navy-secondary/50 rounded-2xl transition-all duration-300 hover:bg-navy-secondary hover:border-saffron/20 hover:-translate-y-2 relative overflow-hidden"
              >
                <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-saffron/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <feature.icon size={40} className="text-saffron mb-6" />
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 4 - HOW IT WORKS */}
      <section className="py-32 px-6 bg-navy-secondary/30 relative">
        <div className="container mx-auto">
          <div className="text-center space-y-4 mb-24 animate-fade-up">
            <h2 className="text-4xl md:text-5xl font-editorial font-bold">How It Works</h2>
          </div>
          
          <div className="relative grid md:grid-cols-3 gap-12 max-w-5xl mx-auto">
            {/* Connecting Line (Desktop) */}
            <div className="hidden md:block absolute top-12 left-[15%] right-[15%] h-[1px] border-t border-dashed border-white/20 z-0" />
            
            {[
              { step: "01", title: "Join the Arena", desc: "Login with Google, select your role and district to personalize your feed." },
              { step: "02", title: "Analyze Reality", desc: "Read real political news curated specifically for your location and interests." },
              { step: "03", title: "Take Your Stance", desc: "Debate, vote, and write to your MP — your voice on record forever." }
            ].map((item, i) => (
              <div key={i} className="relative z-10 text-center flex flex-col items-center group">
                <div className="w-24 h-24 rounded-full border border-white/10 bg-navy-primary flex items-center justify-center text-3xl font-editorial font-bold text-saffron mb-8 transition-transform group-hover:scale-110">
                  {item.step}
                </div>
                <h3 className="text-2xl font-bold mb-4">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 5 - ROLE SHOWCASE */}
      <section className="py-32 px-6 relative">
        <div className="container mx-auto">
          <div className="text-center space-y-4 mb-20 animate-fade-up">
            <h2 className="text-4xl md:text-5xl font-editorial font-bold">Built For Every Citizen</h2>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { role: "Citizen", tint: "blue", desc: "Read, debate, vote, and petition your representatives." },
              { role: "Lawyer", tint: "purple", desc: "Verified legal voice. Challenge facts, flag misinformation, and argue cases." },
              { role: "Journalist", tint: "amber", desc: "Break stories, share investigations, and reach a civic audience." },
              { role: "Political Worker", tint: "green", desc: "Organise opinion, track bills, and mobilise your constituency." }
            ].map((card, i) => (
              <div 
                key={i} 
                className={`p-8 border border-white/5 rounded-2xl flex flex-col justify-between h-[320px] transition-all duration-300 hover:shadow-[0_0_30px_rgba(255,107,0,0.1)] hover:border-saffron/20 group`}
              >
                <div>
                  <div className="inline-flex items-center gap-2 px-2 py-1 rounded bg-white/5 text-[10px] font-mono font-bold text-muted-foreground uppercase tracking-widest mb-6">
                    ROLE
                  </div>
                  <h3 className="text-3xl font-editorial font-bold mb-4">{card.role}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{card.desc}</p>
                </div>
                <div className="h-1 w-0 bg-saffron group-hover:w-full transition-all duration-500" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 6 - CONSTITUTION CALLOUT */}
      <section className="relative overflow-hidden">
        <div className="bg-saffron py-24 px-6 relative z-10 flex flex-col items-center text-center">
          <div className="animate-rotate-slow mb-12 opacity-80">
            <img 
              src="https://upload.wikimedia.org/wikipedia/commons/1/17/Ashoka_Chakra.svg" 
              alt="Ashoka Chakra" 
              className="w-24 h-24 invert contrast-[10] brightness-0"
              style={{ filter: 'brightness(0) saturate(100%) invert(10%) sepia(85%) saturate(1469%) hue-rotate(204deg) brightness(91%) contrast(98%)' }}
            />
          </div>
          <div className="max-w-4xl space-y-6">
            <h2 className="text-4xl md:text-6xl font-editorial font-bold text-navy-primary italic">
              &quot;Freedom of speech and expression — Article 19(1)(a), Constitution of India&quot;
            </h2>
            <p className="text-xl font-bold text-navy-primary/70 font-mono tracking-tight uppercase">
              RAJNEET exists entirely within your fundamental rights. Express freely. Debate responsibly.
            </p>
          </div>
        </div>
      </section>

      {/* SECTION 7 - NEWS CATEGORY PREVIEW */}
      <section className="py-32 px-6 relative">
        <div className="container mx-auto">
          <div className="text-center space-y-4 mb-12 animate-fade-up">
            <h2 className="text-4xl md:text-5xl font-editorial font-bold">Covering Every Dimension of Indian Politics</h2>
          </div>
          
          <div className="flex gap-4 overflow-x-auto pb-12 scrollbar-hide">
            {["Political", "Criminal", "Finance", "Corporate", "Infrastructure", "Environment", "Health", "Education", "International"].map((cat) => (
              <button key={cat} className="whitespace-nowrap px-6 py-2 rounded-full border border-white/10 bg-white/5 text-sm font-bold hover:bg-saffron hover:border-saffron hover:text-white transition-all">
                {cat}
              </button>
            ))}
          </div>

          <div className="relative">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 blur-[4px] opacity-40 select-none">
              {[1, 2, 3].map((i) => (
                <div key={i} className="border border-white/5 bg-navy-secondary/50 rounded-2xl overflow-hidden p-6 space-y-4">
                  <div className="h-4 w-20 bg-white/10 rounded" />
                  <div className="h-24 w-full bg-white/10 rounded-lg" />
                  <div className="h-6 w-full bg-white/10 rounded" />
                  <div className="h-4 w-2/3 bg-white/10 rounded" />
                </div>
              ))}
            </div>
            
            <div className="absolute inset-0 flex flex-col items-center justify-center z-10 text-center p-6">
              <div className="bg-navy-primary/60 backdrop-blur-md border border-white/10 p-12 rounded-3xl shadow-2xl max-w-lg">
                <Info size={40} className="text-saffron mx-auto mb-6" />
                <h3 className="text-2xl font-bold mb-4">Enter the Arena to Debate</h3>
                <p className="text-muted-foreground mb-8 text-sm">Join verified citizens, lawyers, and journalists in shaping the national narrative. Login is required to view full stories and participate in debates.</p>
                <Link
                  href="/login"
                  className="inline-flex h-12 items-center justify-center rounded-md bg-white px-8 text-sm font-bold text-navy-primary hover:bg-saffron hover:text-white transition-all"
                >
                  Sign in with Google
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 8 - FOOTER */}
      <footer className="bg-navy-secondary/50 border-t border-white/5 py-20 px-6">
        <div className="container mx-auto grid md:grid-cols-3 gap-12">
          <div className="space-y-6">
            <h2 className="text-3xl font-editorial font-bold text-white tracking-tight">RAJNEET</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Your Voice. Your Democracy. <br />
              Protected under Article 19(1)(a) of the Indian Constitution.
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-4">
              <h4 className="text-xs font-mono font-bold text-saffron uppercase tracking-[0.2em]">Platform</h4>
              <nav className="flex flex-col gap-2 text-sm text-muted-foreground">
                <Link href="#" className="hover:text-white transition-colors">About</Link>
                <Link href="#" className="hover:text-white transition-colors">Parliament Tracker</Link>
                <Link href="#" className="hover:text-white transition-colors">Live Debates</Link>
              </nav>
            </div>
            <div className="space-y-4">
              <h4 className="text-xs font-mono font-bold text-saffron uppercase tracking-[0.2em]">Legal</h4>
              <nav className="flex flex-col gap-2 text-sm text-muted-foreground">
                <Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link>
                <Link href="#" className="hover:text-white transition-colors">Terms of Service</Link>
                <Link href="#" className="hover:text-white transition-colors">Grievance Officer</Link>
              </nav>
            </div>
          </div>
          
          <div className="space-y-6">
            <h4 className="text-xs font-mono font-bold text-saffron uppercase tracking-[0.2em]">Connect</h4>
            <p className="text-sm text-muted-foreground italic">
              &quot;Made for India. Built for democracy.&quot;
            </p>
            <div className="flex gap-4">
              {/* Placeholder Social Icons */}
              {[1, 2, 3].map((i) => (
                <div key={i} className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-saffron hover:border-saffron transition-all cursor-pointer">
                  <ArrowRight size={18} className="text-muted-foreground group-hover:text-white" />
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="container mx-auto mt-20 pt-8 border-t border-white/5 text-center">
          <p className="text-[10px] font-mono text-muted-foreground/60 uppercase tracking-widest">
            © 2025 RAJNEET. This platform is an independent civic initiative and is not affiliated with any political party.
          </p>
        </div>
      </footer>
    </div>
  );
}
