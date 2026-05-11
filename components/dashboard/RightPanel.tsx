"use client";

import { MapPin, BarChart2, Landmark, Flame, TrendingUp, ChevronRight, Activity } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";

export function RightPanel({ user }: { user: any }) {
  return (
    <aside className="w-full md:w-80 bg-[#050A14] border-l border-white/5 p-6 overflow-y-auto sticky top-0 h-screen hidden lg:block custom-scrollbar">
      <div className="space-y-10">
        {/* Trending Section */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] flex items-center gap-2">
              <Activity size={14} className="text-accent-blue" />
              Trending in {user?.state || "India"}
            </h3>
            <span className="w-1.5 h-1.5 rounded-full bg-accent-blue animate-pulse" />
          </div>
          
          <div className="space-y-3">
            {[
              "Electoral Bonds Verdict",
              "UP Infrastructure Push",
              "Farmers Protest 2.0",
              "Digital India Bill",
              "Cauvery Water Dispute"
            ].map((topic, i) => (
              <button 
                key={i}
                className="w-full flex items-center gap-3 p-3 bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 rounded-2xl transition-all group"
              >
                <span className="text-xs font-mono font-bold text-accent-blue/60 group-hover:text-accent-blue transition-colors">0{i+1}</span>
                <span className="text-[11px] font-bold text-gray-300 group-hover:text-white transition-colors truncate">{topic}</span>
                <Flame size={12} className="ml-auto text-accent-amber opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            ))}
          </div>
        </section>

        {/* Opinion Poll Widget */}
        <section className="p-5 bg-accent-blue/5 border border-accent-blue/20 rounded-[32px] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-accent-blue/10 blur-[40px] rounded-full -mr-10 -mt-10" />
          
          <div className="flex items-center gap-2 mb-4">
            <BarChart2 size={16} className="text-accent-blue" />
            <span className="text-[10px] font-black text-white uppercase tracking-widest">LIVE POLL</span>
          </div>
          
          <h4 className="text-sm font-heading font-bold text-white mb-6 leading-snug">
            Should the government increase infrastructure spending in {user?.state || "your state"}?
          </h4>

          <div className="space-y-3">
            {[
              { label: "Highly Necessary", progress: 65 },
              { label: "Somewhat Necessary", progress: 25 },
              { label: "Not a Priority", progress: 10 }
            ].map((opt, i) => (
              <button key={i} className="w-full relative group">
                <div className="flex justify-between items-center mb-1.5 px-1">
                  <span className="text-[10px] font-bold text-gray-300">{opt.label}</span>
                  <span className="text-[10px] font-mono text-accent-blue font-black">{opt.progress}%</span>
                </div>
                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${opt.progress}%` }}
                    transition={{ duration: 1, delay: i * 0.1 }}
                    className="h-full bg-accent-blue shadow-[0_0_12px_rgba(59,130,246,0.4)]"
                  />
                </div>
              </button>
            ))}
          </div>

          <p className="mt-6 text-[9px] text-gray-500 font-medium text-center uppercase tracking-widest">
            Poll closes in 14 hours • 2,401 votes
          </p>
        </section>

        {/* Parliament Today */}
        <section>
          <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] flex items-center gap-2 mb-6">
            <Landmark size={14} className="text-accent-amber" />
            Parliament Today
          </h3>
          
          <div className="grid grid-cols-1 gap-3">
            <div className="p-4 bg-white/[0.03] border border-white/5 rounded-2xl flex items-center justify-between group">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-xs font-bold text-white">Lok Sabha</span>
              </div>
              <span className="text-[9px] font-black text-green-500 uppercase tracking-widest px-2 py-1 bg-green-500/10 rounded-lg">IN SESSION</span>
            </div>
            
            <div className="p-4 bg-white/[0.03] border border-white/5 rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-gray-600" />
                <span className="text-xs font-bold text-gray-400">Rajya Sabha</span>
              </div>
              <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest px-2 py-1 bg-white/5 rounded-lg">ADJOURNED</span>
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-accent-amber/5 border border-accent-amber/10 rounded-xl flex items-center justify-between">
            <span className="text-[10px] font-bold text-accent-amber uppercase tracking-widest">Next Session</span>
            <span className="text-[10px] font-mono font-bold text-white tracking-widest">TOMORROW 11:00</span>
          </div>
        </section>

        {/* Top Debates */}
        <section>
          <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] flex items-center gap-2 mb-6">
            <Flame size={14} className="text-red-500" />
            TOP DEBATES TODAY
          </h3>
          
          <div className="space-y-4">
            {[1, 2, 3].map((item) => (
              <button key={item} className="w-full flex gap-3 text-left group">
                <div className="w-12 h-12 rounded-xl bg-white/[0.03] border border-white/5 overflow-hidden shrink-0 group-hover:border-accent-blue/30 transition-all">
                  <div className="w-full h-full bg-gradient-to-br from-accent-blue/10 to-transparent" />
                </div>
                <div className="overflow-hidden">
                  <h5 className="text-[11px] font-bold text-gray-300 leading-snug line-clamp-2 group-hover:text-white transition-colors">
                    Supreme Court issues notice on new Digital Privacy regulations
                  </h5>
                  <div className="flex items-center gap-2 mt-1">
                    <TrendingUp size={10} className="text-red-500" />
                    <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">4.2K Debating</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </section>
      </div>
    </aside>
  );
}
