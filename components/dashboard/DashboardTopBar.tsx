"use client";

import { useEffect, useState } from "react";
import { Bell, User } from "lucide-react";
import { format } from "date-fns";

interface DashboardTopBarProps {
  user: any;
}

export function DashboardTopBar({ user }: DashboardTopBarProps) {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="sticky top-0 z-30 w-full bg-background/80 backdrop-blur-md border-b border-white/5 px-6 py-3 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
          <span className="text-[11px] font-black tracking-widest text-white uppercase">LIVE</span>
        </div>
        <div className="h-4 w-[1px] bg-white/10" />
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider">
            {format(time, "EEEE, MMMM dd")}
          </span>
          <span className="text-[10px] font-mono text-accent-blue font-bold tracking-widest">
            {format(time, "HH:mm:ss")}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <button className="relative group">
          <Bell size={18} className="text-gray-400 group-hover:text-white transition-colors" />
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-accent-blue rounded-full text-[9px] font-black text-white flex items-center justify-center border-2 border-background">
            2
          </span>
        </button>
        
        <div className="flex items-center gap-3 pl-4 border-l border-white/10">
          <div className="text-right hidden sm:block">
            <p className="text-[10px] font-black text-white uppercase tracking-wider">{user?.name?.split(" ")[0]}</p>
            <p className="text-[9px] text-gray-500 font-medium">Session: Active</p>
          </div>
          <div className="w-8 h-8 rounded-full border border-white/10 overflow-hidden bg-accent-blue/10 flex items-center justify-center">
            {user?.avatar_url ? (
              <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
            ) : (
              <User size={14} className="text-accent-blue" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
