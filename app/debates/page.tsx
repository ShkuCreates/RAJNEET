"use client";

import { Newspaper } from "lucide-react";

export default function DebatesPage() {
  const hasLiveDebates = false;

  return (
    <div className="min-h-screen bg-[#050A14] py-12 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Ongoing Debates</h1>
          <p className="text-gray-400">Live political debates happening right now</p>
        </div>

        {!hasLiveDebates ? (
          <div className="flex min-h-[400px] items-center justify-center rounded-[32px] border border-white/10 bg-[#111827] px-8 py-16 text-center shadow-2xl">
            <div className="mx-auto">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-accent-amber/10">
                <Newspaper className="text-accent-amber" size={30} />
              </div>
              <h1 className="mb-3 text-3xl font-semibold text-white">Coming Soon</h1>
              <p className="text-base text-gray-400">Live debates launching soon. Stay tuned.</p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Live debates will go here */}
          </div>
        )}
      </div>
    </div>
  );
}
