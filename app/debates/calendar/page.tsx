"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import UpcomingDebatesClient from "@/components/debates/UpcomingDebatesClient";

export default function DebatesCalendarPage() {
  return (
    <div className="min-h-screen bg-[#050A14] px-6 py-12">
      <div className="mx-auto max-w-5xl">
        <div className="mb-10">
          <h1 className="mb-3 text-4xl font-bold text-white">Debate Calendar</h1>
          <p className="text-gray-400">Upcoming scheduled debates across RAJNEET.</p>
        </div>

        <UpcomingDebatesClient />
      </div>
    </div>
  );
}
