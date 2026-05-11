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
  LogOut
} from "lucide-react";
import LogoutButton from "@/components/auth/LogoutButton";
import PollWidget from "@/components/polls/PollWidget";

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
      {/* Left Sidebar */}
      <aside className="w-full md:w-64 border-r border-border bg-card flex flex-col justify-between sticky top-0 md:h-screen z-10">
        <div>
          <div className="p-6">
            <Link href="/dashboard">
              <img 
                src="/images/rajneet-logo.png" 
                alt="RAJNEET Logo" 
                className="h-8 w-auto mb-2"
              />
            </Link>
          </div>
          
          <nav className="space-y-1 px-4">
            <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2 text-foreground rounded-md bg-secondary/10 font-medium">
              <Home size={20} className="text-primary" />
              Home Feed
            </Link>
            <Link href="/dashboard/trending" className="flex items-center gap-3 px-3 py-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md font-medium transition-colors">
              <TrendingUp size={20} />
              Trending Debates
            </Link>
            <Link href="/dashboard/district" className="flex items-center gap-3 px-3 py-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md font-medium transition-colors">
              <MapPin size={20} />
              My District
            </Link>
            <Link href="/dashboard/parliament" className="flex items-center gap-3 px-3 py-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md font-medium transition-colors">
              <Landmark size={20} />
              Parliament Tracker
            </Link>
            <Link href="/dashboard/polls" className="flex items-center gap-3 px-3 py-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md font-medium transition-colors">
              <BarChart2 size={20} />
              Opinion Polls
            </Link>
            <Link href="/dashboard/profile" className="flex items-center gap-3 px-3 py-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md font-medium transition-colors">
              <UserIcon size={20} />
              My Profile
            </Link>
          </nav>
        </div>

        {/* User Badge */}
        <div className="p-4 m-4 border border-border rounded-lg bg-background">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-secondary-foreground font-bold shrink-0">
              {user.avatar_url ? (
                <img src={user.avatar_url} alt="Avatar" className="w-10 h-10 rounded-full object-cover" />
              ) : (
                user.name?.charAt(0) || "C"
              )}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-semibold truncate">{user.name}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-primary/20 text-primary">
                  {user.role}
                </span>
              </div>
            </div>
          </div>
          <div className="mt-3 text-xs text-muted-foreground">
            <p className="truncate">{user.district}, {user.state}</p>
          </div>
          <div className="mt-3 pt-3 border-t border-border">
            <LogoutButton />
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Main Feed */}
        <div className="flex-1 overflow-y-auto border-r border-border">
          {children}
        </div>

        {/* Right Panel */}
        <aside className="w-full md:w-80 bg-card p-6 overflow-y-auto sticky top-0 h-screen hidden lg:block">
          {/* Trending in District */}
          <div className="mb-8">
            <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
              <MapPin size={16} className="text-primary" />
              Trending in {user.district}
            </h3>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground italic">No trending topics yet.</p>
            </div>
          </div>

          {/* Active Poll */}
          <div className="mb-8">
            <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
              <BarChart2 size={16} className="text-primary" />
              Live Opinion Poll
            </h3>
            <PollWidget />
          </div>

          {/* Parliament Today */}
          <div>
            <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
              <Landmark size={16} className="text-primary" />
              Parliament Today
            </h3>
            <div className="space-y-3">
              <div className="border border-border rounded-lg p-3 bg-background flex justify-between items-center">
                <span className="text-sm font-medium">Lok Sabha</span>
                <span className="text-xs px-2 py-1 rounded-full bg-green-500/20 text-green-500 font-bold">IN SESSION</span>
              </div>
              <div className="border border-border rounded-lg p-3 bg-background flex justify-between items-center">
                <span className="text-sm font-medium">Rajya Sabha</span>
                <span className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground font-bold">ADJOURNED</span>
              </div>
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
}
