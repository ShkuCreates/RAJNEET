"use client";

import Link from "next/link";
import { ArrowRight, Info, Terminal } from "lucide-react";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

const STAGGER_DELAY = 0.08;

export default function LandingPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="flex flex-col bg-dark-black selection:bg-blood-red selection:text-white">
      {/* SECTION 1 - HERO SECTION */}
      <section className="relative min-h-screen flex items-center px-6 md:px-20 py-20 overflow-hidden">
        {/* LIVE Indicator */}
        <div className="absolute top-10 left-10 flex items-center gap-2 z-50">
          <div className="w-2 h-2 rounded-full bg-blood-red animate-pulse" />
          <span className="text-[10px] font-bold tracking-[0.3em] text-blood-red">LIVE_WIRE_EST_2025</span>
        </div>

        <div className="container mx-auto grid lg:grid-cols-2 gap-20 items-start relative z-10">
          {/* Left Hero Content */}
          <div className="flex flex-col items-start text-left border-l border-blood-red pl-12">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
              className="w-full"
            >
              <motion.h1 
                className="text-[12rem] md:text-[16rem] font-bebas leading-[0.8] text-muted-saffron mb-4 select-none"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.1, staggerChildren: 0.1 }}
              >
                {Array.from("RAJNEET").map((char, i) => (
                  <motion.span 
                    key={i}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    {char}
                  </motion.span>
                ))}
              </motion.h1>
              
              <h2 className="text-4xl md:text-5xl font-editorial italic text-off-white mb-12">
                Your Voice. Your Democracy.
              </h2>
              
              <div className="h-[1px] w-full bg-blood-red mb-12" />
              
              <p className="text-lg text-grey-blue font-mono max-w-xl leading-tight mb-16 uppercase tracking-tight">
                India&apos;s only structured political debate platform. Read real news. 
                Argue your stance. Hold power accountable. <br />
                <span className="text-meta-blue">Protected under Article 19(1)(a).</span>
              </p>
              
              <div className="flex flex-wrap gap-8 items-center">
                <Link
                  href="/login"
                  className="bg-dark-crimson text-off-white px-12 py-5 text-xl font-bold hover:bg-blood-red transition-colors"
                >
                  ENTER_RAJNEET
                </Link>
                <Link
                  href="#"
                  className="text-grey-blue hover:text-off-white transition-colors flex items-center gap-2 group"
                >
                  READ_CONSTITUTION_CLAUSE <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </motion.div>
          </div>

          {/* Right Hero Content - Terminal Panel */}
          <div className="hidden lg:flex flex-col items-start w-full max-w-lg">
            <div className="w-full border-t border-blood-red bg-dark-slate p-8 shadow-2xl relative overflow-hidden">
              {/* Scanline Effect on Panel */}
              <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%)] bg-[length:100%_4px] opacity-20" />
              
              <div className="flex items-center gap-2 mb-8 text-meta-blue">
                <Terminal size={14} />
                <span className="text-[10px] tracking-widest font-bold uppercase">SYS_MONITOR_v1.0.4</span>
              </div>

              <div className="space-y-12">
                {[
                  { label: "NEWS_WIRE", content: "Parliament passes Data Protection Bill 2024", time: "02:14:45" },
                  { label: "DEBATE_SYNC", content: "FOR: 2,847 / AGAINST: 1,203 / NEUTRAL: 445", time: "02:14:42" },
                  { label: "PROCEDURAL", content: "LOK SABHA SESSION: ADJOURNED", time: "02:14:38" }
                ].map((item, i) => (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1 + i * 0.2 }}
                    className="space-y-2"
                  >
                    <div className="flex justify-between text-[9px] font-bold tracking-widest text-blood-red">
                      <span>{item.label}</span>
                      <span>{item.time}</span>
                    </div>
                    <p className="text-sm text-off-white uppercase leading-tight tracking-tight">
                      {item.content}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2 - BREAKING TICKER */}
      <div className="h-16 bg-dark-black border-y border-white/5 flex items-center overflow-hidden z-20">
        <div className="bg-blood-red h-full px-8 flex items-center justify-center shrink-0">
          <span className="text-white font-bold tracking-[0.4em] text-sm">BREAKING</span>
        </div>
        <div className="flex-1 overflow-hidden">
          <div className="flex animate-ticker whitespace-nowrap items-center h-full">
            {[1, 2].map((i) => (
              <div key={i} className="flex gap-24 px-12 items-center">
                <span className="text-sm font-bold text-off-white uppercase tracking-tighter">
                  • SUPREME COURT HEARING ON ELECTORAL BONDS RESUMES 
                </span>
                <span className="text-sm font-bold text-off-white uppercase tracking-tighter">
                  • UP BUDGET 2025 TABLED: FOCUS ON INFRASTRUCTURE 
                </span>
                <span className="text-sm font-bold text-off-white uppercase tracking-tighter">
                  • NEW CRIMINAL LAWS (BNS) OFFICIALLY IN EFFECT NATIONWIDE 
                </span>
                <span className="text-sm font-bold text-off-white uppercase tracking-tighter">
                  • RBI MAINTAINS REPO RATE AMID INFLATION CONCERNS 
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* SECTION 3 - FEATURES */}
      <section className="py-32 px-6 md:px-20 bg-dark-black">
        <div className="container mx-auto">
          <motion.h2 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="text-5xl md:text-6xl font-editorial italic text-off-white mb-24 text-left"
          >
            What RAJNEET Does
          </motion.h2>
          
          <div className="grid lg:grid-cols-2 gap-x-24 gap-y-16">
            {[
              { title: "Real Political News", desc: "Verified intelligence from primary sources. No noise. No clickbait. Just the facts." },
              { title: "Structured Debate", desc: "For, Against, or Neutral. Your stance is recorded. Your arguments are vetted." },
              { title: "Parliament Tracker", desc: "Live session monitoring. Every vote by every MP documented publicly." },
              { title: "Citizen to MP Pipeline", desc: "Direct communication on record. Hold your representatives accountable." },
              { title: "Opinion Polls", desc: "Aggregated district and national sentiment on upcoming legislation." },
              { title: "Fact vs Allegation", desc: "Every word tagged. We separate perspective from objective truth." }
            ].map((feature, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="group border-t border-white/5 pt-12 flex flex-col items-start text-left"
              >
                <span className="text-blood-red text-xs font-bold mb-6">0{i + 1}</span>
                <h3 className="text-3xl font-editorial font-bold text-off-white mb-4 italic">{feature.title}</h3>
                <p className="text-grey-blue text-sm leading-snug uppercase max-w-md">
                  {feature.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 4 - CONSTITUTION CALLOUT */}
      <section className="bg-dark-charcoal py-40 px-6 md:px-20 border-y border-white/5 relative overflow-hidden">
        <div className="absolute left-0 top-0 w-1 h-full bg-blood-red" />
        <div className="container mx-auto max-w-5xl">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            className="space-y-12"
          >
            <h2 className="text-5xl md:text-7xl font-editorial italic text-off-white leading-tight">
              &quot;The State shall not make any law which takes away or abridges the rights conferred by this Part&quot;
            </h2>
            <div className="space-y-4">
              <p className="text-blood-red font-bold tracking-widest text-sm uppercase">Article 13, Constitution of India</p>
              <p className="text-grey-blue text-lg uppercase leading-tight max-w-2xl">
                Article 19(1)(a) guarantees every citizen the right to speak. 
                RAJNEET is the infrastructure for that right.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* SECTION 5 - ROLE CARDS */}
      <section className="py-32 px-6 md:px-20">
        <div className="container mx-auto">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { role: "CITIZEN", desc: "Read, debate, vote, and petition your representatives." },
              { role: "LAWYER", desc: "Verified legal voice. Challenge facts, flag misinformation, and argue cases." },
              { role: "JOURNALIST", desc: "Break stories, share investigations, and reach a civic audience." },
              { role: "ACTIVIST", desc: "Organise opinion, track bills, and mobilise your constituency." }
            ].map((card, i) => (
              <div 
                key={i} 
                className="bg-dark-slate p-12 border border-white/5 border-t-blood-red transition-all hover:bg-dark-charcoal hover:border-blood-red group cursor-default"
              >
                <h3 className="text-5xl font-bebas text-off-white mb-8 group-hover:text-muted-saffron transition-colors">
                  {card.role}
                </h3>
                <p className="text-xs text-grey-blue uppercase leading-snug">
                  {card.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 6 - NEWS CATEGORY GRID */}
      <section className="py-32 px-6 md:px-20 bg-dark-black">
        <div className="container mx-auto">
          <h2 className="text-5xl md:text-6xl font-editorial italic text-off-white mb-16 text-left">
            Every Category. Every District. Every Voice.
          </h2>
          
          <div className="flex flex-wrap gap-4 mb-20">
            {["POLITICAL", "CRIMINAL", "FINANCE", "CORPORATE", "HEALTH", "INTERNATIONAL"].map((cat) => (
              <button key={cat} className="px-8 py-3 border border-blood-red text-[10px] font-bold text-blood-red hover:bg-blood-red hover:text-white transition-none">
                {cat}
              </button>
            ))}
          </div>

          <div className="relative">
            <div className="grid md:grid-cols-3 gap-8 blur-[8px] opacity-20 pointer-events-none">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-dark-slate p-8 space-y-6">
                  <div className="flex justify-between text-[9px] text-meta-blue">
                    <span>POLITICAL</span>
                    <span>2M AGO</span>
                  </div>
                  <h4 className="text-2xl font-editorial italic text-off-white">New Bill Proposed in Rajya Sabha to Regulate Social Media...</h4>
                  <div className="h-4 w-full bg-white/5" />
                  <div className="h-[2px] w-full bg-white/5" />
                </div>
              ))}
            </div>
            
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-dark-black/80 backdrop-blur-sm border border-blood-red p-16 text-center max-w-xl">
                <h3 className="text-4xl font-editorial italic text-off-white mb-8">Login to Enter the Arena</h3>
                <p className="text-grey-blue text-sm uppercase leading-tight mb-12">
                  Verified intelligence and structured debate are restricted to members. 
                  Login to read full stories and take your stance.
                </p>
                <Link
                  href="/login"
                  className="inline-block bg-dark-crimson text-white px-12 py-5 font-bold hover:bg-blood-red transition-none"
                >
                  SIGN_IN_WITH_GOOGLE
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 7 - FOOTER */}
      <footer className="bg-dark-black border-t border-white/5 py-20 px-6 md:px-20">
        <div className="container mx-auto space-y-16">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
            <h2 className="text-6xl font-bebas text-muted-saffron tracking-tight">RAJNEET</h2>
            <p className="text-[10px] font-bold text-meta-blue uppercase tracking-widest text-left md:text-right">
              NOT AFFILIATED WITH ANY POLITICAL PARTY. <br />
              NOT FUNDED BY ANY GOVERNMENT.
            </p>
          </div>
          
          <div className="h-[1px] w-full bg-white/5" />
          
          <div className="flex flex-wrap gap-x-12 gap-y-6">
            {["ABOUT", "PRIVACY_POLICY", "TERMS", "GRIEVANCE_OFFICER", "CONTACT"].map((link) => (
              <Link key={link} href="#" className="text-xs font-bold text-grey-blue hover:text-off-white transition-none uppercase tracking-widest">
                {link}
              </Link>
            ))}
          </div>
          
          <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between gap-4">
            <p className="text-[10px] text-meta-blue uppercase tracking-[0.2em]">
              © 2025 RAJNEET. Protected under Article 19(1)(a) of the Constitution of India.
            </p>
            <div className="flex gap-8">
              <span className="text-[10px] text-blood-red font-bold uppercase tracking-widest">ENCRYPTED_CONNECTION</span>
              <span className="text-[10px] text-meta-blue font-bold uppercase tracking-widest">SERVER_SGP_01</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
