import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import PollWidget from "@/components/polls/PollWidget";
import { BarChart2, MessageSquare } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function PollsPage() {
  const session = await getServerSession(authOptions);
  const user = session?.user;

  // Fetch active polls
  const polls = await prisma.poll.findMany({
    where: {
      expires_at: { gte: new Date() }
    },
    orderBy: { created_at: "desc" },
    include: {
      _count: { select: { votes: true } }
    }
  });

  return (
    <div className="mx-auto w-full max-w-[1200px] px-6 py-8">
      <header className="mb-10">
        <div className="mb-4 flex items-center gap-3">
          <BarChart2 className="text-accent-blue" size={24} />
          <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-accent-blue">National Opinion</h2>
        </div>
        <h1 className="mb-4 text-4xl font-heading font-black uppercase tracking-tight text-white">Opinion Polls</h1>
        <p className="max-w-xl text-gray-500">Cast your vote on the most critical issues. These results come from active polls only.</p>
      </header>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        {polls.length > 0 ? (
          polls.map((poll) => (
            <div key={poll.id} className="rounded-[32px] border border-white/5 bg-[#111827] p-8 shadow-2xl">
              <div className="mb-6 flex items-center justify-between">
                <span className="rounded-full border border-accent-blue/20 bg-accent-blue/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-accent-blue">
                  {poll.geo_scope}
                </span>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <MessageSquare size={14} />
                  {poll._count.votes} votes
                </div>
              </div>

              <h3 className="mb-8 text-xl font-bold text-white">{poll.question}</h3>

              <PollWidget poll={poll} />
            </div>
          ))
        ) : (
          <div className="col-span-full rounded-[32px] border border-dashed border-white/10 bg-white/[0.02] py-20 text-center">
            <BarChart2 className="mx-auto mb-4 text-gray-600" size={48} />
            <p className="font-medium text-gray-500">No active polls at the moment. Check back soon.</p>
          </div>
        )}
      </div>
    </div>
  );
}
