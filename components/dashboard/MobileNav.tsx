"use client";

import { useState } from "react";
import { Menu, X, Home, TrendingUp, MapPin, Landmark, BarChart2, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavItem {
  href: string;
  icon: React.ReactNode;
  label: string;
}

export function MobileNav({ user }: { user: any }) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const navItems: NavItem[] = [
    { href: "/dashboard", icon: <Home size={20} />, label: "Home Feed" },
    { href: "/dashboard/trending", icon: <TrendingUp size={20} />, label: "Trending" },
    { href: "/dashboard/polls", icon: <BarChart2 size={20} />, label: "Opinion Polls" },
    { href: "/dashboard/profile", icon: <User size={20} />, label: "My Profile" },
  ];

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-[#050A14] border-b border-white/10 z-50 px-4 py-3">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-accent-amber/10 rounded-lg flex items-center justify-center border border-accent-amber/20">
              <Landmark size={20} className="text-accent-amber" />
            </div>
            <span className="text-xl font-heading font-black text-accent-amber tracking-tighter">RAJNEET</span>
          </Link>
          <button
            onClick={() => setIsOpen(true)}
            className="p-2 text-white hover:bg-white/10 rounded-lg"
          >
            <Menu size={24} />
          </button>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-50 lg:hidden"
            onClick={() => setIsOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 w-72 bg-[#050A14] border-r border-white/10 z-50 lg:hidden overflow-y-auto">
            <div className="p-4">
              <div className="flex items-center justify-between mb-6">
                <Link href="/" className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-accent-amber/10 rounded-lg flex items-center justify-center border border-accent-amber/20">
                    <Landmark size={20} className="text-accent-amber" />
                  </div>
                  <span className="text-xl font-heading font-black text-accent-amber tracking-tighter">RAJNEET</span>
                </Link>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 text-white hover:bg-white/10 rounded-lg"
                >
                  <X size={24} />
                </button>
              </div>

              <nav className="space-y-2">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      pathname === item.href
                        ? "bg-accent-blue/20 text-accent-blue"
                        : "text-gray-400 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    {item.icon}
                    <span className="font-medium">{item.label}</span>
                  </Link>
                ))}
              </nav>

              <div className="mt-8 pt-8 border-t border-white/10">
                <div className="flex items-center gap-3 px-4 py-3 bg-white/5 rounded-lg">
                  {user.avatar_url ? (
                    <img src={user.avatar_url} alt="Avatar" className="w-10 h-10 rounded-full object-cover" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-accent-blue/20 flex items-center justify-center text-accent-blue font-bold">
                      {user.name?.charAt(0) || "U"}
                    </div>
                  )}
                  <div className="overflow-hidden">
                    <p className="text-sm font-bold text-white truncate">{user.name}</p>
                    <p className="text-xs text-gray-400 truncate">{user.category || "CITIZEN"}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
