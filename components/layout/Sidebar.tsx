"use client";

import { motion } from "framer-motion";
import { usePathname } from "next/navigation";
import Image from "next/image";
import {
  Home,
  Swords,
  Vote,
  Landmark,
  Calendar,
  Flag,
  Users,
  Newspaper,
  Trophy,
  User,
} from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { useSession } from "next-auth/react";

const navItems = [
  { icon: Home, label: "Dashboard", href: "/dashboard" },
  { icon: Swords, label: "Debates", href: "/debates" },
  { icon: Vote, label: "Elections", href: "/elections" },
  { icon: Landmark, label: "Treasury", href: "/treasury" },
  { icon: Calendar, label: "Events", href: "/events" },
  { icon: Flag, label: "Parties", href: "/parties" },
  { icon: Users, label: "Citizens", href: "/citizens" },
  { icon: Newspaper, label: "Media", href: "/media" },
  { icon: Trophy, label: "Rankings", href: "/rankings" },
];

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <motion.aside
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="w-60 bg-bg-secondary border-r border-[rgba(212,175,55,0.2)] min-h-screen flex flex-col"
    >
      {/* Logo Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          padding: "20px 16px 24px",
          borderBottom: "1px solid rgba(212,175,55,0.1)",
        }}
      >
        <Image
          src="/images/rajneet-logo.png"
          alt="RAJNEET"
          width={32}
          height={32}
        />
        <span
          style={{
            fontFamily: "Cinzel, serif",
            fontSize: "16px",
            fontWeight: 700,
            color: "#D4AF37",
            letterSpacing: "0.1em",
          }}
        >
          RAJNEET
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item, index) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <motion.a
              key={item.href}
              href={item.href}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ translateX: 4 }}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg font-inter transition-all ${
                isActive
                  ? "bg-bg-tertiary border-l-3 border-gold-primary text-gold-primary"
                  : "text-text-secondary hover:text-gold-primary hover:bg-bg-tertiary"
              }`}
              style={isActive ? { borderLeftWidth: "3px" } : {}}
            >
              <Icon size={20} />
              <span className="font-medium">{item.label}</span>
            </motion.a>
          );
        })}
      </nav>

      {/* User Mini Profile */}
      {session?.user && (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="p-4 border-t border-[rgba(212,175,55,0.2)]"
        >
          <div className="flex items-center gap-3">
            <Avatar src={session.user.image} size="md" showBorder />
            <div className="flex-1 min-w-0">
              <p className="text-white font-inter font-medium truncate">
                {session.user.username || session.user.name}
              </p>
              <Badge variant="gold" icon={User} className="text-xs">
                {session.user.subRole || "Citizen"}
              </Badge>
              <p className="text-text-secondary text-xs font-inter">
                {(session.user as any).followerCount || 0} followers
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </motion.aside>
  );
}
