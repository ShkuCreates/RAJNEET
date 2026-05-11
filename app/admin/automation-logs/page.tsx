"use client";

import { useState } from "react";
import { Play, CheckCircle2, AlertCircle, Loader2, Database, ShieldAlert } from "lucide-react";
import { toast } from "sonner";

export default function AutomationLogsPage() {
  const [isTriggering, setIsTriggering] = useState(false);
  const [logs, setLogs] = useState<any[]>([
    { id: 1, type: "FETCH", status: "SUCCESS", message: "Fetched 12 articles", time: "2024-05-11 10:30:00" },
    { id: 2, type: "POLL", status: "SUCCESS", message: "Generated poll: Infrastructure", time: "2024-05-11 10:31:12" },
    { id: 3, type: "FETCH", status: "ERROR", message: "NewsData API quota exceeded", time: "2024-05-11 10:00:00" },
  ]);

  const handleTriggerManual = async () => {
    try {
      setIsTriggering(true);
      const res = await fetch("/api/cron/fetch-news?secret=MANUAL_TRIGGER"); // In dev, we can allow this
      const data = await res.json();
      
      if (data.success) {
        toast.success(`Automation successful! Saved ${data.saved} articles.`);
        setLogs(prev => [{
          id: Date.now(),
          type: "FETCH",
          status: "SUCCESS",
          message: `Manual: Saved ${data.saved} articles`,
          time: new Date().toLocaleString()
        }, ...prev]);
      } else {
        throw new Error(data.error);
      }
    } catch (error: any) {
      toast.error(`Automation failed: ${error.message}`);
      setLogs(prev => [{
        id: Date.now(),
        type: "FETCH",
        status: "ERROR",
        message: `Manual Error: ${error.message}`,
        time: new Date().toLocaleString()
      }, ...prev]);
    } finally {
      setIsTriggering(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050A14] p-8 md:p-16">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <ShieldAlert className="text-accent-amber" size={24} />
              <h1 className="text-3xl font-heading font-black text-white uppercase tracking-tight">Admin Automation Control</h1>
            </div>
            <p className="text-gray-500 font-medium">Monitor and trigger system automation tasks manually.</p>
          </div>
          
          <button
            onClick={handleTriggerManual}
            disabled={isTriggering}
            className="flex items-center gap-3 px-8 py-4 bg-accent-blue hover:bg-accent-blue/90 disabled:bg-gray-700 text-white font-black uppercase tracking-widest rounded-2xl transition-all shadow-xl shadow-accent-blue/20 active:scale-[0.98]"
          >
            {isTriggering ? <Loader2 className="animate-spin" /> : <Play size={20} />}
            {isTriggering ? "Triggering..." : "Trigger Fetch Now"}
          </button>
        </div>

        <div className="bg-[#111827] border border-white/5 rounded-[32px] overflow-hidden shadow-2xl">
          <div className="p-6 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
            <h3 className="text-sm font-black text-white uppercase tracking-widest">Automation Logs</h3>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">System Online</span>
            </div>
          </div>

          <div className="divide-y divide-white/5">
            {logs.map((log) => (
              <div key={log.id} className="p-6 hover:bg-white/[0.01] transition-colors flex items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    log.status === "SUCCESS" ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
                  }`}>
                    {log.status === "SUCCESS" ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-black px-2 py-0.5 rounded bg-white/5 text-gray-400 uppercase tracking-widest">{log.type}</span>
                      <h4 className="text-sm font-bold text-white">{log.message}</h4>
                    </div>
                    <p className="text-xs font-mono text-gray-500">{log.time}</p>
                  </div>
                </div>
                
                <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                  log.status === "SUCCESS" ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
                }`}>
                  {log.status}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-white/[0.02] border border-white/5 rounded-2xl">
            <Database className="text-accent-blue mb-4" size={24} />
            <h5 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Total Articles</h5>
            <p className="text-2xl font-heading font-black text-white">1,204</p>
          </div>
          <div className="p-6 bg-white/[0.02] border border-white/5 rounded-2xl">
            <BarChart2 className="text-accent-amber mb-4" size={24} />
            <h5 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Total Polls</h5>
            <p className="text-2xl font-heading font-black text-white">48</p>
          </div>
          <div className="p-6 bg-white/[0.02] border border-white/5 rounded-2xl">
            <Activity className="text-green-500 mb-4" size={24} />
            <h5 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Uptime</h5>
            <p className="text-2xl font-heading font-black text-white">99.9%</p>
          </div>
        </div>
      </div>
    </div>
  );
}
