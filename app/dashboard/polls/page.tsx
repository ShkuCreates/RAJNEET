import { prisma } from "@/lib/prisma";
import { DashboardTopBar } from "@/components/dashboard/DashboardTopBar";
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
    <div className="flex flex-col h-full bg-[#050A14]">
      <DashboardTopBar user={user} />
      
      <div className="flex-1 overflow-y-auto">
        <div className="p-8 md:p-12">
          <header className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <BarChart2 className="text-accent-blue" size={24} />
              <h2 className="text-[10px] font-black text-accent-blue uppercase tracking-[0.3em]">National Opinion</h2>
            </div>
            <h1 className="text-4xl font-heading font-black text-white uppercase tracking-tight mb-4">Opinion Polls</h1>
            <p className="text-gray-500 max-w-xl">Cast your vote on the most critical issues. Your voice shapes the national sentiment dashboard.</p>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {polls.length > 0 ? (
              polls.map((poll) => (
                <div key={poll.id} className="bg-[#111827] border border-white/5 rounded-[32px] p-8 shadow-2xl">
                  <div className="flex items-center justify-between mb-6">
                    <span className="px-3 py-1 bg-accent-blue/10 text-accent-blue text-[10px] font-black rounded-full uppercase tracking-widest border border-accent-blue/20">
                      {poll.geo_scope}
                    </span>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <MessageSquare size={14} />
                      {poll._count.votes} votes
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-bold text-white mb-8">{poll.question}</h3>
                  
                  <PollWidget poll={poll} />
                </div>
              ))
            ) : (
              <div className="col-span-full py-20 text-center bg-white/[0.02] border border-dashed border-white/10 rounded-[32px]">
                <BarChart2 className="mx-auto text-gray-600 mb-4" size={48} />
                <p className="text-gray-500 font-medium">No active polls at the moment. Check back soon!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
