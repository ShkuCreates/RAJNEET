"use client";

import { useEffect, useState } from "react";
import { User, Shield, TrendingUp, Calendar, Loader2, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

type UserWithStats = {
  id: string;
  name: string | null;
  email: string | null;
  username: string | null;
  role: string;
  reputation_score: number;
  reputation_tier: string;
  created_at: Date;
  _count: {
    opinions: number;
  };
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch("/api/admin/users");
        const data = await res.json();
        console.log("[ADMIN_USERS_PAGE_DEBUG] Received data:", data);
        console.log("[ADMIN_USERS_PAGE_DEBUG] Users count:", data.users?.length || 0);
        setUsers(data.users || []);
      } catch (err) {
        console.error("[ADMIN_USERS_PAGE_ERROR]", err);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const handlePromote = async (userId: string) => {
    setUpdating(userId);
    try {
      const res = await fetch(`/api/admin/users/${userId}/promote`, { method: "POST" });
      if (res.ok) {
        toast.success("User promoted to admin!");
        const res2 = await fetch("/api/admin/users");
        const data = await res2.json();
        setUsers(data.users || []);
      } else {
        toast.error("Failed to promote user");
      }
    } catch (e) {
      toast.error("Failed to promote user");
    } finally {
      setUpdating(null);
    }
  };

  const handleDelete = async (userId: string, userName: string | null) => {
    if (!confirm(`Are you sure you want to delete ${userName || "this user"}? This action cannot be undone.`)) {
      return;
    }
    
    setUpdating(userId);
    try {
      const res = await fetch(`/api/admin/users/${userId}/delete`, { method: "POST" });
      if (res.ok) {
        toast.success("User deleted successfully!");
        const res2 = await fetch("/api/admin/users");
        const data = await res2.json();
        setUsers(data.users || []);
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to delete user");
      }
    } catch (e) {
      toast.error("Failed to delete user");
    } finally {
      setUpdating(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#050A14] p-6 md:p-10">
      <div className="mx-auto max-w-6xl space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <User size={28} className="text-[#3B82F6]" />
              User Management
            </h1>
            <p className="text-gray-400 mt-2">Manage all users on RAJNEET</p>
          </div>
        </div>

        {/* Users Table */}
        <div className="border border-white/10 bg-[#0D1B3E]/50 rounded-[20px] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#070B14] border-b border-white/10">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">User</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">Role</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">Reputation</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">Posts</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">Joined</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="px-6 py-4">
                        <div className="h-4 w-32 bg-white/10 rounded" />
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-4 w-20 bg-white/10 rounded" />
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-4 w-16 bg-white/10 rounded" />
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-4 w-12 bg-white/10 rounded" />
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-4 w-24 bg-white/10 rounded" />
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-4 w-20 bg-white/10 rounded" />
                      </td>
                    </tr>
                  ))
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center gap-4">
                        <User size={48} className="text-gray-600" />
                        <div>
                          <p className="text-gray-500 text-lg font-medium">No real users found</p>
                          <p className="text-gray-600 text-sm mt-1">Users will appear here when they sign up through Google OAuth</p>
                          <p className="text-gray-600 text-xs mt-2">System and admin users are filtered out from this view</p>
                        </div>
                      </div>
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-[#1f2937] flex items-center justify-center text-white font-semibold border border-white/10">
                            {(user.name || user.username || "U").charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="text-white font-medium">{user.name || "Anonymous"}</div>
                            <div className="text-gray-500 text-sm">
                              {user.username ? `@${user.username}` : user.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                          user.role === "ADMIN"
                            ? "bg-amber-500/20 text-amber-300"
                            : "bg-blue-500/20 text-blue-300"
                        }`}>
                          {user.role === "ADMIN" ? <Shield size={12} /> : <User size={12} />}
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <TrendingUp size={14} className="text-green-400" />
                          <span className="text-white font-semibold">{user.reputation_score}</span>
                          <span className="text-gray-500 text-xs">({user.reputation_tier})</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-white">
                        {user._count.opinions}
                      </td>
                      <td className="px-6 py-4 text-gray-400 text-sm flex items-center gap-2">
                        <Calendar size={14} />
                        {format(new Date(user.created_at), "MMM d, yyyy")}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {user.role !== "ADMIN" ? (
                            <button
                              onClick={() => handlePromote(user.id)}
                              disabled={updating === user.id}
                              className="inline-flex items-center gap-2 px-3 py-1.5 bg-amber-500/20 text-amber-300 rounded-lg text-sm font-medium hover:bg-amber-500/30 disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                              {updating === user.id ? <Loader2 size={14} className="animate-spin" /> : <Shield size={14} />}
                              {updating === user.id ? "Promoting..." : "Promote to Admin"}
                            </button>
                          ) : null}
                          <button
                            onClick={() => handleDelete(user.id, user.name)}
                            disabled={updating === user.id}
                            className="inline-flex items-center gap-2 px-3 py-1.5 bg-red-500/20 text-red-300 rounded-lg text-sm font-medium hover:bg-red-500/30 disabled:opacity-60 disabled:cursor-not-allowed"
                          >
                            {updating === user.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                            {updating === user.id ? "Deleting..." : "Delete"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
