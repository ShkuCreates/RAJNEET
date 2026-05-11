"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { toast } from "sonner";

interface SidebarNavItemProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  badge?: "red" | "blue";
  badgeCount?: number;
  comingSoon?: boolean;
}

export function SidebarNavItem({ 
  href, 
  icon, 
  label, 
  badge, 
  badgeCount,
  comingSoon 
}: SidebarNavItemProps) {
  const pathname = usePathname();
  const isActive = pathname === href;

  const handleClick = (e: React.MouseEvent) => {
    if (comingSoon) {
      e.preventDefault();
      toast.info("This feature is coming soon!");
    }
  };

  return (
    <Link 
      href={href} 
      onClick={handleClick}
      className={`flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-200 group ${
        isActive 
          ? "bg-accent-blue/15 text-white border-l-2 border-accent-blue" 
          : "text-gray-400 hover:text-white hover:bg-white/[0.03]"
      }`}
    >
      <div className="flex items-center gap-3">
        <span className={`${isActive ? "text-accent-blue" : "text-gray-500 group-hover:text-gray-300"} transition-colors`}>
          {icon}
        </span>
        <span className="text-sm font-medium tracking-tight">{label}</span>
      </div>

      {badge && (
        <div className={`w-2 h-2 rounded-full ${badge === "red" ? "bg-red-500 animate-pulse" : "bg-accent-blue"}`} />
      )}

      {badgeCount !== undefined && badgeCount > 0 && (
        <span className="px-1.5 py-0.5 rounded-md bg-accent-blue text-[10px] font-black text-white">
          {badgeCount}
        </span>
      )}

      {comingSoon && (
        <span className="text-[8px] font-black uppercase tracking-widest text-gray-600 group-hover:text-gray-400 transition-colors">
          SOON
        </span>
      )}
    </Link>
  );
}
