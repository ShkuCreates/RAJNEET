"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import LiveDebatesClient from "@/components/debates/LiveDebatesClient";

type Tab = "ongoing" | "calendar" | "admin";

export default function DebatesPage() {
  const [activeTab, setActiveTab] = useState<Tab>("ongoing");
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "ADMIN";

  const tabs: { id: Tab; label: string; isAdmin?: boolean }[] = [
    { id: "ongoing", label: "Ongoing" },
    { id: "calendar", label: "Calendar" },
    ...(isAdmin ? [{ id: "admin", label: "Admin" }] : []),
  ];

  return (
    <div className="min-h-screen bg-[#050A14] py-12 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Debates</h1>
          <p className="text-gray-400">Join live debates, view the calendar, or manage debates</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 border-b border-white/10 pb-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 text-sm font-bold uppercase tracking-wider rounded-t-xl transition-all ${
                activeTab === tab.id
                  ? "bg-accent-blue/10 text-accent-blue border-t border-l border-r border-accent-blue/30"
                  : "text-gray-500 hover:text-white hover:bg-white/5"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === "ongoing" && (
            <LiveDebatesClient currentUser={session?.user} />
          )}
          {activeTab === "calendar" && (
            <div className="min-h-[400px] rounded-[32px] border border-white/10 bg-[#111827] px-8 py-16 text-center shadow-2xl">
              <div className="mx-auto">
                <h1 className="mb-3 text-3xl font-semibold text-white">Calendar Section</h1>
                <p className="text-base text-gray-400">Upcoming debates with slot management</p>
              </div>
            </div>
          )}
          {activeTab === "admin" && isAdmin && (
            <div className="min-h-[400px] rounded-[32px] border border-white/10 bg-[#111827] px-8 py-16 text-center shadow-2xl">
              <div className="mx-auto">
                <h1 className="mb-3 text-3xl font-semibold text-white">Admin Section</h1>
                <p className="text-base text-gray-400">Schedule and manage debates</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
