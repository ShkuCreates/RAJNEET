import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Home,
  TrendingUp,
  MapPin,
  Landmark,
  BarChart2,
  User as UserIcon,
  LogOut,
  Bell,
  MessageCircle,
  ChevronRight,
  ShieldCheck,
  Activity
} from "lucide-react";
import LogoutButton from "@/components/auth/LogoutButton";
import PollWidget from "@/components/polls/PollWidget";
import { SidebarNavItem } from "@/components/dashboard/SidebarNavItem";
import { SignOutModal } from "@/components/dashboard/SignOutModal";
import { RightPanel } from "@/components/dashboard/RightPanel";
import { MobileNav } from "@/components/dashboard/MobileNav";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  const { user } = session;

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      {/* Mobile Navigation */}
      <MobileNav user={user} />

      {/* Left Sidebar - Desktop Only */}
      <aside className="hidden md:flex md:w-64 border-r border-border bg-card flex-col justify-between sticky top-0 md:h-screen z-10">
        <div>
          <div className="p-6">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 bg-accent-amber/10 rounded-xl flex items-center justify-center border border-accent-amber/20 group-hover:scale-110 transition-transform">
                <Landmark size={24} className="text-accent-amber" />
              </div>
              <span className="text-2xl font-heading font-black text-accent-amber tracking-tighter">
                RAJNEET
              </span>
            </Link>
          </div>

          <nav className="space-y-1.5 px-4 mt-2">
            <SidebarNavItem href="/dashboard" icon={<Home size={20} />} label="Home Feed" />
            <SidebarNavItem href="/dashboard/trending" icon={<TrendingUp size={20} />} label="Trending" badge="red" />
            <SidebarNavItem href="/dashboard/district" icon={<MapPin size={20} />} label="My District" comingSoon />
            <SidebarNavItem href="/dashboard/parliament" icon={<Landmark size={20} />} label="Parliament" comingSoon />
            <SidebarNavItem href="/dashboard/polls" icon={<BarChart2 size={20} />} label="Opinion Polls" badge="blue" badgeCount={3} />
            <SidebarNavItem href="/dashboard/profile" icon={<UserIcon size={20} />} label="My Profile" />
            {user.role === "ADMIN" && (
              <>
                <div className="my-3 border-t border-white/5" />
                <p className="text-[9px] font-black text-gray-600 uppercase tracking-[0.3em] px-3 mb-2">Admin</p>
                <SidebarNavItem href="/admin/analytics" icon={<Activity size={20} />} label="Analytics" />
                <SidebarNavItem href="/admin/automation-logs" icon={<ShieldCheck size={20} />} label="Automation" />
              </>
            )}
          </nav>
        </div>

        {/* User Badge */}
        <div className="p-4 m-4 bg-[#0D1B3E]/40 border border-white/5 rounded-2xl backdrop-blur-md">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full border-2 border-accent-blue/30 p-0.5 shrink-0 overflow-hidden">
              {user.avatar_url ? (
                <img src={user.avatar_url} alt="Avatar" className="w-full h-full rounded-full object-cover" />
              ) : (
                <div className="w-full h-full rounded-full bg-accent-blue/20 flex items-center justify-center text-accent-blue font-black">
                  {user.name?.charAt(0) || "U"}
                </div>
              )}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-heading font-bold text-white truncate">{user.name}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-accent-blue/10 text-accent-blue border border-accent-blue/20">
                  {(user as any).category || "CITIZEN"}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 bg-white/[0.03] rounded-lg mb-4">
            <MapPin size={12} className="text-gray-500" />
            <p className="text-[10px] text-gray-400 font-medium truncate uppercase tracking-wider">{user.state || "India"}</p>
          </div>

          <SignOutModal />
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col md:flex-row overflow-hidden pt-16 md:pt-0">
        {/* Main Feed */}
        <div className="flex-1 overflow-y-auto border-r border-border">
          {children}
        </div>

        {/* Right Panel - Desktop Only */}
        <div className="hidden lg:block w-80 bg-[#050A14] border-l border-white/5 overflow-y-auto sticky top-0 h-screen">
          <RightPanel user={user} />
        </div>
      </main>
    </div>
  );
}
