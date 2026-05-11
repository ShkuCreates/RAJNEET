"use client";

import { useState } from "react";
import { Search } from "lucide-react";

interface ArticleSearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
}

export function ArticleSearchBar({ onSearch, placeholder = "Search by title, author @username, or #tag" }: ArticleSearchBarProps) {
  const [query, setQuery] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    onSearch(value);
  };

  return (
    <div className="relative mb-6">
      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
        <Search size={18} />
      </div>
      <input
        type="text"
        value={query}
        onChange={handleChange}
        placeholder={placeholder}
        className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-accent-blue/50 focus:bg-white/[0.07] transition-all"
      />
    </div>
  );
}
