import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { 
  Calendar, 
  MapPin, 
  Shield, 
  MessageSquare, 
  BarChart, 
  Mail, 
  User as UserIcon,
  Award
} from "lucide-react";

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      _count: {
        select: {
          opinions: true,
          pollVotes: true,
          mpLetters: true,
        }
      }
    }
  });

  if (!user) return null;

  const totalParticipation = user._count.opinions + user._count.pollVotes + user._count.mpLetters;

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      {/* Profile Header */}
      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
        <div className="h-32 bg-gradient-to-r from-primary/20 to-secondary/20" />
        <div className="px-6 pb-6 relative">
          <div className="flex flex-col md:flex-row md:items-end gap-6 -mt-12">
            <div className="w-24 h-24 rounded-full border-4 border-card bg-secondary text-secondary-foreground flex items-center justify-center text-4xl font-bold overflow-hidden">
              {user.avatar_url ? (
                <img src={user.avatar_url} alt={user.name || ""} className="w-full h-full object-cover" />
              ) : (
                user.name?.charAt(0) || "U"
              )}
            </div>
            <div className="flex-1 pb-1">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold">{user.name}</h1>
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-primary/20 text-primary uppercase tracking-wider">
                  {user.role}
                </span>
              </div>
              <p className="text-muted-foreground text-sm">{user.username || `@${user.id.slice(0, 8)}`}</p>
            </div>
            <button className="px-4 py-2 border border-border rounded-md text-sm font-medium hover:bg-muted transition-colors">
              Edit Profile
            </button>
          </div>

          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4 py-4 border-y border-border">
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin size={16} className="text-primary" />
              <span className="text-sm font-medium">{user.district}, {user.state}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Shield size={16} className="text-primary" />
              <span className="text-sm font-medium">Verified {user.role}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar size={16} className="text-primary" />
              <span className="text-sm font-medium italic">Joined {new Date(user.created_at).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Award size={16} className="text-primary" />
              <span className="text-sm font-bold text-foreground">Reputation: {totalParticipation}</span>
            </div>
          </div>

          <div className="mt-6">
            <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-2">Bio</h3>
            <p className="text-sm leading-relaxed">
              {user.bio || "No bio provided yet. Every citizen has a story."}
            </p>
          </div>
        </div>
      </div>

      {/* Activity Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-card border border-border p-6 rounded-xl shadow-sm text-center">
          <MessageSquare className="mx-auto mb-2 text-primary" size={24} />
          <p className="text-2xl font-bold">{user._count.opinions}</p>
          <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest">Opinions Posted</p>
        </div>
        <div className="bg-card border border-border p-6 rounded-xl shadow-sm text-center">
          <BarChart className="mx-auto mb-2 text-primary" size={24} />
          <p className="text-2xl font-bold">{user._count.pollVotes}</p>
          <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest">Polls Voted</p>
        </div>
        <div className="bg-card border border-border p-6 rounded-xl shadow-sm text-center">
          <Mail className="mx-auto mb-2 text-primary" size={24} />
          <p className="text-2xl font-bold">{user._count.mpLetters}</p>
          <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest">Letters to MP</p>
        </div>
      </div>

      {/* Tabs Placeholder */}
      <div className="border-b border-border">
        <div className="flex gap-8">
          {["Activity Feed", "Recent Opinions", "Participated Polls"].map((tab, i) => (
            <button 
              key={tab} 
              className={`pb-4 text-sm font-bold tracking-wider uppercase transition-colors ${
                i === 0 ? "border-b-2 border-primary text-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="py-12 text-center border-2 border-dashed border-border rounded-xl">
        <UserIcon className="mx-auto mb-2 text-muted-foreground/50" size={32} />
        <p className="text-sm text-muted-foreground italic">Activity log will appear here as you participate in RAJNEET.</p>
      </div>
    </div>
  );
}
