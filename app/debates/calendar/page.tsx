import { prisma } from "@/lib/prisma";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function DebatesCalendarPage() {
  const debates = await prisma.debate.findMany({
    where: {
      status: "upcoming",
    },
    orderBy: {
      scheduled_at: "asc",
    },
  });

  return (
    <div className="min-h-screen bg-[#050A14] px-6 py-12">
      <div className="mx-auto max-w-5xl">
        <div className="mb-10">
          <h1 className="mb-3 text-4xl font-bold text-white">Debate Calendar</h1>
          <p className="text-gray-400">Upcoming scheduled debates across RAJNEET.</p>
        </div>

        {debates.length > 0 ? (
          <div className="space-y-4">
            {debates.map((debate) => (
              <Link
                key={debate.id}
                href={`/debates/${debate.id}`}
                className="block rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition hover:border-accent-blue/40"
              >
                <div className="mb-2 text-sm uppercase tracking-[0.25em] text-accent-blue">
                  Scheduled Debate
                </div>
                <h2 className="mb-2 text-xl font-semibold text-white">{debate.topic}</h2>
                <p className="text-sm text-gray-400">
                  {debate.scheduled_at
                    ? new Date(debate.scheduled_at).toLocaleString("en-IN", {
                        dateStyle: "medium",
                        timeStyle: "short",
                        timeZone: "Asia/Kolkata",
                      })
                    : "Schedule to be announced"}
                </p>
              </Link>
            ))}
          </div>
        ) : (
          <div className="rounded-[28px] border border-white/10 bg-white/[0.03] px-8 py-16 text-center">
            <h2 className="mb-3 text-2xl font-semibold text-white">Coming Soon</h2>
            <p className="text-gray-400">No debates are scheduled yet.</p>
            <p className="text-sm text-gray-500 mt-2">Upcoming debate sessions will appear here once they are added.</p>
          </div>
        )}
      </div>
    </div>
  );
}
