"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import ScheduleDebateForm from "@/components/debates/ScheduleDebateForm";
import ManageDebatesClient from "@/components/debates/ManageDebatesClient";

export default function DebatesAdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeSubTab, setActiveSubTab] = useState("schedule");

  useEffect(() => {
    if (status === "loading") return;
    if (!session?.user?.email || session.user.role !== "ADMIN") {
      router.push("/");
    }
  }, [session, status, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-[#050A14] px-6 py-12 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (!session?.user?.email || session.user.role !== "ADMIN") {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#050A14] px-6 py-12">
      <div className="mx-auto max-w-5xl">
        <div className="mb-10">
          <h1 className="mb-3 text-4xl font-bold text-white">Debate Admin</h1>
          <p className="text-gray-400">Schedule and manage debates on RAJNEET.</p>
        </div>

        {/* Subtabs */}
        <div className="flex gap-4 mb-8 border-b border-white/10 pb-1">
          <button
            onClick={() => setActiveSubTab("schedule")}
            className={`px-4 py-2 text-sm font-semibold rounded-t-lg transition-colors ${
              activeSubTab === "schedule"
                ? "bg-accent-blue/10 text-accent-blue border-b-2 border-accent-blue"
                : "text-gray-400 hover:text-white"
            }`}
          >
            Schedule New Debate
          </button>
          <button
            onClick={() => setActiveSubTab("manage")}
            className={`px-4 py-2 text-sm font-semibold rounded-t-lg transition-colors ${
              activeSubTab === "manage"
                ? "bg-accent-blue/10 text-accent-blue border-b-2 border-accent-blue"
                : "text-gray-400 hover:text-white"
            }`}
          >
            Manage Debates
          </button>
        </div>

        {activeSubTab === "schedule" ? (
          <ScheduleDebateForm />
        ) : (
          <ManageDebatesClient />
        )}
      </div>
    </div>
  );
}
