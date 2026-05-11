"use client";

import { useState } from "react";

interface NewsFilterBarProps {
  onFilterChange: (category: string) => void;
  activeFilter: string;
  categoryCounts?: Record<string, number>;
}

const categories = [
  { id: "all", label: "All" },
  { id: "POLITICAL", label: "Politics" },
  { id: "CRIMINAL", label: "Criminal" },
  { id: "FINANCE", label: "Finance" },
  { id: "CORPORATE", label: "Corporate" },
  { id: "INFRASTRUCTURE", label: "Infrastructure" },
  { id: "SOCIAL", label: "Social" },
  { id: "ENVIRONMENT", label: "Environment" },
];

export function NewsFilterBar({ onFilterChange, activeFilter, categoryCounts = {} }: NewsFilterBarProps) {
  return (
    <div className="mb-6">
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {categories.map((category) => {
          const count = category.id === "all" 
            ? Object.values(categoryCounts).reduce((sum, c) => sum + c, 0)
            : categoryCounts[category.id] || 0;
          
          return (
            <button
              key={category.id}
              onClick={() => onFilterChange(category.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all duration-200 ${
                activeFilter === category.id
                  ? "bg-accent-blue text-white shadow-lg shadow-accent-blue/25"
                  : "bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 border border-white/10"
              }`}
            >
              <span>{category.label}</span>
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                activeFilter === category.id
                  ? "bg-white/20 text-white"
                  : "bg-white/10 text-gray-400"
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
