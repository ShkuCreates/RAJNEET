"use client";

import { ExternalLink, Trophy } from "lucide-react";

const CRICBUZZ_LIVE_URL = "https://www.cricbuzz.com/cricket-match/live-scores";

export default function IplScoreWidget() {
  return (
    <div className="rounded-xl border border-white/10 bg-[#111827]/10 p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Trophy className="text-red-500" size={16} />
          <span className="text-sm font-semibold text-white">IPL Live Scores</span>
        </div>
        <a
          href={CRICBUZZ_LIVE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-lg bg-red-500/90 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-600"
        >
          <ExternalLink size={14} />
          Cricbuzz
        </a>
      </div>
      <div className="relative w-full overflow-hidden rounded-lg border border-white/10 bg-black/30">
        <iframe
          title="Cricbuzz live cricket scores"
          src={CRICBUZZ_LIVE_URL}
          width="100%"
          height={280}
          className="block w-full border-0"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>
    </div>
  );
}
