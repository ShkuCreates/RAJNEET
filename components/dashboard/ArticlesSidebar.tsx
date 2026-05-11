"use client";

import { useState } from "react";
import { Plus, TrendingUp, DollarSign, CheckCircle, XCircle } from "lucide-react";

interface ArticlesSidebarProps {
  user: any;
  onOpenSubmitModal: () => void;
}

export function ArticlesSidebar({ user, onOpenSubmitModal }: ArticlesSidebarProps) {
  const [isLoggedIn] = useState(!!user);

  return (
    <aside className="w-64 border-r border-border bg-card flex-col justify-between sticky top-0 h-screen">
      <div>
        {/* Submit Article Button */}
        <div className="p-4">
          {isLoggedIn ? (
            <button
              onClick={onOpenSubmitModal}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-accent-blue hover:bg-accent-blue/90 text-white font-semibold py-3 transition-all shadow-lg shadow-accent-blue/20"
            >
              <Plus size={20} />
              Submit Article
            </button>
          ) : (
            <button className="w-full flex items-center justify-center gap-2 rounded-xl bg-white/5 text-gray-400 font-semibold py-3 border border-white/10 cursor-not-allowed">
              <Plus size={20} />
              Login to Submit
            </button>
          )}
        </div>

        {/* Article Rules */}
        <div className="px-4 mb-6">
          <div className="p-4 bg-white/[0.03] border border-white/5 rounded-2xl">
            <h3 className="text-[9px] font-black text-gray-500 uppercase tracking-[0.3em] mb-3">
              ARTICLE RULES
            </h3>
            <ul className="space-y-2 text-[10px] text-gray-400">
              <li className="flex items-start gap-2">
                <CheckCircle size={10} className="text-green-500 mt-0.5 shrink-0" />
                <span>Must be original research or opinion</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle size={10} className="text-green-500 mt-0.5 shrink-0" />
                <span>Minimum 800 words</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle size={10} className="text-green-500 mt-0.5 shrink-0" />
                <span>Must cite sources</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle size={10} className="text-green-500 mt-0.5 shrink-0" />
                <span>Political topics only</span>
              </li>
              <li className="flex items-start gap-2">
                <XCircle size={10} className="text-red-500 mt-0.5 shrink-0" />
                <span>No plagiarism</span>
              </li>
              <li className="flex items-start gap-2">
                <XCircle size={10} className="text-red-500 mt-0.5 shrink-0" />
                <span>No hate speech</span>
              </li>
              <li className="flex items-start gap-2">
                <XCircle size={10} className="text-red-500 mt-0.5 shrink-0" />
                <span>No unverified claims</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Trending Articles */}
        <div className="px-4 mb-6">
          <h3 className="text-[9px] font-black text-gray-500 uppercase tracking-[0.3em] mb-3">
            TRENDING ARTICLES
          </h3>
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <button
                key={i}
                className="w-full flex items-center gap-3 p-2 hover:bg-white/[0.03] rounded-lg transition-all group"
              >
                <span className="text-xs font-mono font-bold text-accent-blue min-w-[16px]">{i}</span>
                <span className="text-[10px] font-bold text-gray-400 group-hover:text-white transition-colors truncate flex-1">
                  Article title placeholder {i}
                </span>
                <span className="text-[9px] text-gray-600">{(i * 1234).toLocaleString()}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Monetization */}
        <div className="px-4">
          <div className="p-4 bg-accent-amber/5 border border-accent-amber/10 rounded-2xl">
            <h3 className="text-[9px] font-black text-accent-amber uppercase tracking-[0.3em] mb-2 flex items-center gap-2">
              <DollarSign size={12} />
              EARN ON RAJNEET
            </h3>
            <p className="text-[10px] text-gray-400 leading-relaxed mb-3">
              Top articles get featured and earn from RAJNEET's revenue share program. Articles with 1000+ views qualify.
            </p>
            <button className="text-[10px] font-bold text-accent-amber hover:text-accent-amber/80 transition-colors">
              Learn More →
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
