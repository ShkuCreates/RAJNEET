"use client";

import { useState } from "react";
import { Newspaper, PenTool } from "lucide-react";

interface TabSwitcherProps {
  onTabChange: (tab: "news" | "articles") => void;
  defaultTab?: "news" | "articles";
  articleCount?: number;
}

export function TabSwitcher({ onTabChange, defaultTab = "news", articleCount = 0 }: TabSwitcherProps) {
  const [activeTab, setActiveTab] = useState<"news" | "articles">(defaultTab);

  const handleTabChange = (tab: "news" | "articles") => {
    setActiveTab(tab);
    onTabChange(tab);
  };

  return (
    <div className="w-full mb-6">
      <div className="flex gap-2 p-1 bg-white/5 rounded-xl border border-white/10">
        <button
          onClick={() => handleTabChange("news")}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-bold transition-all duration-200 ${
            activeTab === "news"
              ? "bg-accent-blue text-white shadow-lg shadow-accent-blue/25"
              : "text-gray-400 hover:text-white hover:bg-white/5"
          }`}
        >
          <Newspaper size={18} />
          <span>NEWS</span>
          <span className="ml-1 px-2 py-0.5 rounded-full bg-accent-blue/20 text-[10px] font-bold">
            {articleCount} today
          </span>
        </button>
        <button
          onClick={() => handleTabChange("articles")}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-bold transition-all duration-200 ${
            activeTab === "articles"
              ? "bg-accent-blue text-white shadow-lg shadow-accent-blue/25"
              : "text-gray-400 hover:text-white hover:bg-white/5"
          }`}
        >
          <PenTool size={18} />
          <span>ARTICLES</span>
        </button>
      </div>
      <div
        className={`h-0.5 bg-accent-blue rounded-full transition-all duration-300 ease-out ${
          activeTab === "news" ? "w-1/2" : "w-1/2 ml-auto"
        }`}
      />
    </div>
  );
}
