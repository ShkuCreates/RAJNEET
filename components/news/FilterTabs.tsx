"use client";

import { motion } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";

const filters = ["All", "Politics", "Sports", "Finance", "Corporate", "Infrastructure", "Social", "Environment", "Health", "Education", "International"];

export function FilterTabs() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeFilter = searchParams.get("filter") || "All";

  return (
    <div className="relative flex gap-1.5 p-1 bg-white/[0.03] rounded-2xl border border-white/5 w-fit">
      {filters.map((filter) => {
        const isActive = activeFilter === filter;
        return (
          <button
            key={filter}
            onClick={() => router.push(`/dashboard?filter=${encodeURIComponent(filter)}`)}
            className={`relative px-5 py-2 text-xs font-bold transition-colors duration-300 rounded-xl ${
              isActive ? "text-white" : "text-gray-500 hover:text-gray-300"
            }`}
          >
            {isActive && (
              <motion.div
                layoutId="activeFilter"
                className="absolute inset-0 bg-accent-blue rounded-xl shadow-[0_4px_12px_rgba(59,130,246,0.3)]"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
            <span className="relative z-10">{filter}</span>
          </button>
        );
      })}
    </div>
  );
}
