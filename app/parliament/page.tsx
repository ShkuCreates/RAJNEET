import { prisma } from "@/lib/prisma";
import { Landmark, FileText, CheckCircle2, XCircle, Clock } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function BillTrackerPage() {
  const bills = await prisma.bill.findMany({
    orderBy: { created_at: "desc" },
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "PASSED": return <CheckCircle2 size={16} className="text-green-500" />;
      case "REJECTED": return <XCircle size={16} className="text-red-500" />;
      case "COMMITTEE": return <Clock size={16} className="text-yellow-500" />;
      default: return <FileText size={16} className="text-primary" />;
    }
  };

  return (
    <div className="mx-auto max-w-[1200px] space-y-8 px-6 py-8">
      <div className="flex items-center gap-3 mb-6">
        <Landmark className="text-primary" size={32} />
        <div>
          <h1 className="text-3xl font-bold text-foreground">Parliament Bill Tracker</h1>
          <p className="text-muted-foreground">Monitor the progress of key legislation in Lok Sabha and Rajya Sabha.</p>
        </div>
      </div>

      <div className="grid gap-6">
        {bills.length > 0 ? bills.map((bill: any) => (
          <div key={bill.id} className="bg-card border border-border rounded-xl p-6 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-widest text-primary px-2 py-0.5 rounded bg-primary/10">
                  {bill.ministry}
                </span>
                <h2 className="text-xl font-bold text-foreground">{bill.title}</h2>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/10 border border-border">
                {getStatusIcon(bill.status)}
                <span className="text-xs font-bold uppercase">{bill.status}</span>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-muted-foreground uppercase">Lok Sabha Breakdown</h3>
                {bill.lok_sabha_votes ? (
                  <div className="flex items-center gap-4">
                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden flex">
                      <div className="bg-green-500 h-full" style={{ width: `${(bill.lok_sabha_votes.for / (bill.lok_sabha_votes.for + bill.lok_sabha_votes.against)) * 100}%` }} />
                      <div className="bg-red-500 h-full flex-1" />
                    </div>
                    <span className="text-xs font-bold whitespace-nowrap">{bill.lok_sabha_votes.for} F / {bill.lok_sabha_votes.against} A</span>
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground italic">Voting pending or not available.</p>
                )}
              </div>

              <div className="space-y-2">
                <h3 className="text-xs font-bold text-muted-foreground uppercase">Rajya Sabha Breakdown</h3>
                {bill.rajya_sabha_votes ? (
                  <div className="flex items-center gap-4">
                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden flex">
                      <div className="bg-green-500 h-full" style={{ width: `${(bill.rajya_sabha_votes.for / (bill.rajya_sabha_votes.for + bill.rajya_sabha_votes.against)) * 100}%` }} />
                      <div className="bg-red-500 h-full flex-1" />
                    </div>
                    <span className="text-xs font-bold whitespace-nowrap">{bill.rajya_sabha_votes.for} F / {bill.rajya_sabha_votes.against} A</span>
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground italic">Voting pending or not available.</p>
                )}
              </div>
            </div>

            <div className="border-t border-border pt-4 flex justify-between items-center">
              <div className="text-xs text-muted-foreground">
                Last updated: {new Date(bill.created_at).toLocaleDateString()}
              </div>
              <button className="text-sm font-bold text-primary hover:underline flex items-center gap-1">
                View Public Opinion <CheckCircle2 size={14} />
              </button>
            </div>
          </div>
        )) : (
          <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] px-8 py-16 text-center">
            <p className="text-lg font-semibold text-white">No parliament updates are available right now.</p>
            <p className="mt-2 text-sm text-gray-500">Published bill data will appear here as soon as it is added to the database.</p>
          </div>
        )}
      </div>
    </div>
  );
}
