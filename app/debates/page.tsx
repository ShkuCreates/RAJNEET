"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import LiveDebatesClient from "@/components/debates/LiveDebatesClient";
import UpcomingDebatesClient from "@/components/debates/UpcomingDebatesClient";
import ScheduleDebateForm from "@/components/debates/ScheduleDebateForm";
import ManageDebatesClient from "@/components/debates/ManageDebatesClient";

type Tab = "ongoing" | "calendar" | "admin";
type AdminTab = "schedule" | "manage";

export default function DebatesPage() {
  const [activeTab, setActiveTab] = useState<Tab>("ongoing");
  const [adminSubTab, setAdminSubTab] = useState<AdminTab>("schedule");
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
            <UpcomingDebatesClient currentUser={session?.user} />
          )}
          {activeTab === "admin" && isAdmin && (
            <div>
              <div className="flex gap-2 mb-6 border-b border-white/10 pb-2">
                <button
                  onClick={() => setAdminSubTab("schedule")}
                  className={`px-6 py-3 text-sm font-bold uppercase tracking-wider rounded-t-xl transition-all ${
                    adminSubTab === "schedule"
                      ? "bg-accent-amber/10 text-accent-amber border-t border-l border-r border-accent-amber/30"
                      : "text-gray-500 hover:text-white hover:bg-white/5"
                  }`}
                >
                  Schedule
                </button>
                <button
                  onClick={() => setAdminSubTab("manage")}
                  className={`px-6 py-3 text-sm font-bold uppercase tracking-wider rounded-t-xl transition-all ${
                    adminSubTab === "manage"
                      ? "bg-accent-blue/10 text-accent-blue border-t border-l border-r border-accent-blue/30"
                      : "text-gray-500 hover:text-white hover:bg-white/5"
                  }`}
                >
                  Manage
                </button>
              </div>
              
              {adminSubTab === "schedule" && <ScheduleDebateForm />}
              {adminSubTab === "manage" && <ManageDebatesClient />}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
