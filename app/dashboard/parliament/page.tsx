import { prisma } from "@/lib/prisma";
import { Landmark, FileText, CheckCircle2, XCircle, Clock } from "lucide-react";

export default async function BillTrackerPage() {
  const bills = await prisma.bill.findMany({
    orderBy: { created_at: "desc" },
  });

  // Mock bills if database is empty for now
  const displayBills = bills.length > 0 ? bills : [
    {
      id: "1",
      title: "Digital Personal Data Protection Bill, 2024",
      ministry: "Electronics and IT",
      status: "PASSED",
      lok_sabha_votes: { for: 350, against: 150 },
      rajya_sabha_votes: { for: 130, against: 110 },
      created_at: new Date(),
    },
    {
      id: "2",
      title: "Climate Action and Energy Transition Bill",
      ministry: "Environment and Forest",
      status: "COMMITTEE",
      lok_sabha_votes: null,
      rajya_sabha_votes: null,
      created_at: new Date(Date.now() - 86400000 * 2),
    },
    {
      id: "3",
      title: "Uniform Civil Code Amendment",
      ministry: "Law and Justice",
      status: "INTRODUCED",
      lok_sabha_votes: null,
      rajya_sabha_votes: null,
      created_at: new Date(Date.now() - 86400000 * 5),
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "PASSED": return <CheckCircle2 size={16} className="text-green-500" />;
      case "REJECTED": return <XCircle size={16} className="text-red-500" />;
      case "COMMITTEE": return <Clock size={16} className="text-yellow-500" />;
      default: return <FileText size={16} className="text-primary" />;
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      <div className="flex items-center gap-3 mb-6">
        <Landmark className="text-primary" size={32} />
        <div>
          <h1 className="text-3xl font-bold text-foreground">Parliament Bill Tracker</h1>
          <p className="text-muted-foreground">Monitor the progress of key legislation in Lok Sabha and Rajya Sabha.</p>
        </div>
      </div>

      <div className="grid gap-6">
        {displayBills.map((bill: any) => (
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
        ))}
      </div>
    </div>
  );
}
