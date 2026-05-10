"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { usePathname } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
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
  Plane,
  MapPin,
} from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { DistrictIdentityCard } from "@/components/dashboard/DistrictIdentityCard";
import { TravelModal } from "@/components/dashboard/TravelModal";
import { useSession } from "next-auth/react";
import React from "react";

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
  const [isTravelModalOpen, setIsTravelModalOpen] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);

  // Fetch user profile for district info
  React.useEffect(() => {
    if (session?.user?.id) {
      fetch("/api/users/me")
        .then((res) => res.json())
        .then((data) => {
          setUserProfile(data);
        })
        .catch(console.error);
    }
  }, [session?.user?.id]);

  return (
    <>
      <motion.aside
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="w-64 bg-bg-secondary border-r border-[rgba(212,175,55,0.2)] min-h-screen flex flex-col sticky top-0 h-screen overflow-y-auto"
      >
        {/* Logo Header */}
        <Link href="/dashboard">
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              padding: "20px 16px 16px",
              borderBottom: "1px solid rgba(212,175,55,0.1)",
              cursor: "pointer",
            }}
          >
            <Image
              src="/images/rajneet-logo.png"
              alt="RAJNEET"
              width={28}
              height={28}
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
        </Link>

        {/* District Identity Card */}
        <div className="px-4 pb-4">
          <DistrictIdentityCard
            state={userProfile?.state}
            district={userProfile?.district}
            rulingParty={userProfile?.party}
            nextElection={undefined} // Will be fetched from district stats
          />
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 space-y-1">
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

        {/* Travel Button */}
        <div className="px-4 pb-4">
          <motion.div
            animate={{
              borderColor: ["rgba(212,175,55,0.4)", "rgba(212,175,55,0.8)", "rgba(212,175,55,0.4)"],
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Button
              variant="secondary"
              className="w-full justify-center gap-2 py-3"
              onClick={() => setIsTravelModalOpen(true)}
              style={{
                background: "linear-gradient(135deg, rgba(212,175,55,0.15), rgba(212,175,55,0.05))",
                border: "1px solid rgba(212,175,55,0.4)",
              }}
            >
              <Plane size={18} />
              <span
                style={{
                  fontFamily: "Cinzel, serif",
                  fontWeight: 600,
                  color: "#D4AF37",
                }}
              >
                TRAVEL
              </span>
            </Button>
          </motion.div>
          <p className="text-text-secondary text-xs font-inter text-center mt-2">
            Explore other districts
          </p>
        </div>

        {/* User Mini Profile */}
        {session?.user && userProfile && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="p-4 border-t border-[rgba(212,175,55,0.2)]"
          >
            <div className="flex items-center gap-3 mb-3">
              <Avatar
                src={session.user.image}
                alt={session.user.username || ""}
                size="md"
                showBorder
              />
              <div className="flex-1 min-w-0">
                <p className="text-white font-inter font-medium truncate">
                  @{session.user.username}
                </p>
                <Badge
                  variant={userProfile.role === "CITIZEN" ? "silver" : "gold"}
                  className="text-xs"
                >
                  {userProfile.subRole}
                </Badge>
              </div>
            </div>
            <div className="flex items-center justify-between text-xs text-text-secondary font-inter">
              <span>👥 {userProfile.followerCount}</span>
              <span className="flex items-center gap-1">
                <MapPin size={10} />
                {userProfile.district || "Not set"}
              </span>
            </div>
            <Link href={`/profile/${session.user.username}`}>
              <Button variant="ghost" size="sm" className="w-full mt-2 text-xs">
                View Profile
              </Button>
            </Link>
          </motion.div>
        )}
      </motion.aside>

      {/* Travel Modal */}
      <TravelModal
        isOpen={isTravelModalOpen}
        onClose={() => setIsTravelModalOpen(false)}
        currentState={userProfile?.state}
        currentDistrict={userProfile?.district}
        onVisitDistrict={(state, district) => {
          // This will be handled by the dashboard component
          console.log("Visiting:", state, district);
          setIsTravelModalOpen(false);
        }}
      />
    </>
  );
}
