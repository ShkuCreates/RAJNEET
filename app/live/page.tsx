"use client";

import { useEffect, useState } from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import LiveDebatesClient from "@/components/debates/LiveDebatesClient";
import LiveScoresWidget from "@/components/live/LiveScoresWidget";

export const dynamic = "force-dynamic";

export default function LiveDebatesPage() {
  const [session, setSession] = useState<any>(null);
  const [activeCategory, setActiveCategory] = useState("sports");

  useEffect(() => {
    getServerSession(authOptions).then(setSession);
  }, []);

  const categories = [
    { id: "sports", label: "Sports", icon: "🏏" },
    { id: "parliament", label: "Parliament", icon: "🏛️" },
    { id: "courts", label: "Courts", icon: "⚖️" }
  ];

  const renderContent = () => {
    switch (activeCategory) {
      case "sports":
        return <LiveScoresWidget />;
      case "parliament":
        return (
          <div className="bg-[#0D1B3E]/50 border border-white/10 rounded-xl p-6">
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🏛️</div>
              <h3 className="text-2xl font-bold text-white mb-4">Parliament Live</h3>
              <p className="text-gray-400 mb-6">Live parliamentary sessions and debates coming soon</p>
              <div className="bg-white/[0.05] rounded-lg p-4">
                <h4 className="text-white font-semibold mb-2">Coming Features:</h4>
                <ul className="text-gray-400 space-y-2 text-sm">
                  <li>• Live parliamentary session tracking</li>
                  <li>• Real-time voting records</li>
                  <li>• Member participation analytics</li>
                  <li>• Bill discussion forums</li>
                </ul>
              </div>
            </div>
          </div>
        );
      case "courts":
        return (
          <div className="bg-[#0D1B3E]/50 border border-white/10 rounded-xl p-6">
            <div className="text-center py-12">
              <div className="text-6xl mb-4">⚖️</div>
              <h3 className="text-2xl font-bold text-white mb-4">Court Live</h3>
              <p className="text-gray-400 mb-6">Live court proceedings and judgments coming soon</p>
              <div className="bg-white/[0.05] rounded-lg p-4">
                <h4 className="text-white font-semibold mb-2">Coming Features:</h4>
                <ul className="text-gray-400 space-y-2 text-sm">
                  <li>• Live case status updates</li>
                  <li>• Court hearing schedules</li>
                  <li>• Judgment notifications</li>
                  <li>• Legal document access</li>
                </ul>
              </div>
            </div>
          </div>
        );
      default:
        return <LiveDebatesClient currentUser={session?.user} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#050A14]">
      <div className="border-b border-white/10 bg-[#0A0F1E]">
        <div className="mx-auto max-w-6xl px-4 py-3">
          <div className="flex items-center gap-2">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${
                  activeCategory === category.id
                    ? "bg-red-500 text-white"
                    : "bg-red-500/10 text-red-500 hover:bg-red-500/20"
                }`}
              >
                <span className="mr-2">{category.icon}</span>
                {category.label}
              </button>
            ))}
          </div>
        </div>
      </div>
      
      <div className="mx-auto max-w-6xl px-4 py-6">
        {renderContent()}
      </div>
    </div>
  );
}
