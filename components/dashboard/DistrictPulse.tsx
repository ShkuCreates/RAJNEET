"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Users, Zap, Crown, Coins, TrendingUp, AlertTriangle, User, Calendar } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

interface DistrictStats {
  totalCitizens: number;
  activeUsers: number;
  treasury: number;
  approvalRating: number;
  corruptionScore: number;
  rulingParty?: {
    id: string;
    name: string;
    color: string;
    logo?: string;
  };
  mla?: {
    id: string;
    username: string;
    name: string;
    image?: string;
  };
  nextElection?: Date;
  recentActivity: number;
}

interface DistrictPulseProps {
  district: string;
  isLive?: boolean;
}

export function DistrictPulse({ district, isLive = true }: DistrictPulseProps) {
  const [stats, setStats] = useState<DistrictStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStats = async () => {
    try {
      const response = await fetch(`/api/districts/${encodeURIComponent(district)}/stats`);
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error("Error fetching district stats:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (district) {
      fetchStats();
    }

    // Auto-refresh every 60 seconds if live
    if (isLive) {
      const interval = setInterval(fetchStats, 60000);
      return () => clearInterval(interval);
    }
  }, [district, isLive]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchStats();
  };

  const getApprovalColor = (rating: number) => {
    if (rating > 60) return "#10B981";
    if (rating >= 40) return "#F59E0B";
    return "#EF4444";
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getTimeUntilElection = (date: Date) => {
    const now = new Date();
    const diff = date.getTime() - now.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    return `${days.toString().padStart(2, "0")}:${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-cinzel text-gold-gradient">DISTRICT PULSE</h3>
          <div className="w-2 h-2 bg-gray-500 rounded-full" />
        </div>
        <div className="space-y-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-bg-secondary rounded-lg p-4 animate-pulse">
              <div className="h-4 bg-gray-700 rounded w-1/3 mb-2" />
              <div className="h-6 bg-gray-700 rounded w-1/2" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-8">
        <p className="text-text-secondary">Unable to load district stats</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-cinzel text-gold-gradient">DISTRICT PULSE</h3>
        <div className="flex items-center gap-2">
          {isLive && (
            <motion.div
              animate={{ opacity: [1, 0.5, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-2 h-2 bg-green-500 rounded-full"
            />
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
            className="text-text-secondary hover:text-white"
          >
            <motion.div
              animate={refreshing ? { rotate: 360 } : {}}
              transition={{ duration: 1, repeat: refreshing ? Infinity : 0, ease: "linear" }}
            >
              ↻
            </motion.div>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="space-y-3">
        {/* Total Citizens */}
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <Users className="text-gold-primary" size={20} />
            <div className="flex-1">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="text-white text-xl font-bold font-inter"
              >
                {stats.totalCitizens.toLocaleString()}
              </motion.div>
              <div className="text-text-secondary text-sm font-inter">Total Citizens</div>
            </div>
          </div>
        </Card>

        {/* Active Users */}
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <Zap className="text-green-500" size={20} />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <motion.div
                  animate={{ opacity: [1, 0.5, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-2 h-2 bg-green-500 rounded-full"
                />
                <span className="text-white text-xl font-bold font-inter">
                  {stats.activeUsers.toLocaleString()}
                </span>
              </div>
              <div className="text-text-secondary text-sm font-inter">Active Now</div>
            </div>
          </div>
        </Card>

        {/* Ruling Party */}
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <Crown className="text-gold-primary" size={20} />
            <div className="flex-1">
              {stats.rulingParty ? (
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: stats.rulingParty.color }}
                  />
                  <span className="text-white font-inter font-medium">
                    {stats.rulingParty.name}
                  </span>
                </div>
              ) : (
                <span className="text-text-secondary font-inter">No Election Held Yet</span>
              )}
              <div className="text-text-secondary text-sm font-inter">Ruling Party</div>
            </div>
          </div>
        </Card>

        {/* Treasury */}
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <Coins className="text-gold-primary" size={20} />
            <div className="flex-1">
              <div className={`text-lg font-bold font-inter ${
                stats.treasury === 0 ? "text-red-400" : "text-white"
              }`}>
                {stats.treasury === 0 ? "₹0 — Empty Treasury" : formatCurrency(stats.treasury)}
              </div>
              <div className="text-text-secondary text-sm font-inter">Treasury</div>
            </div>
          </div>
        </Card>

        {/* Approval Rating */}
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <TrendingUp className="text-gold-primary" size={20} />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span
                  className="text-lg font-bold font-inter"
                  style={{ color: getApprovalColor(stats.approvalRating) }}
                >
                  {stats.approvalRating.toFixed(1)}%
                </span>
              </div>
              <div className="text-text-secondary text-sm font-inter mb-2">Approval Rating</div>
              <div className="h-2 bg-bg-tertiary rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${stats.approvalRating}%` }}
                  transition={{ duration: 0.6 }}
                  className="h-full rounded-full"
                  style={{ backgroundColor: getApprovalColor(stats.approvalRating) }}
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Corruption Score */}
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="text-red-500" size={20} />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg font-bold font-inter text-red-400">
                  {stats.corruptionScore.toFixed(1)}%
                </span>
                {stats.corruptionScore === 0 && (
                  <span className="px-2 py-0.5 text-xs font-inter bg-green-500/20 text-green-400 rounded">
                    Clean
                  </span>
                )}
              </div>
              <div className="text-text-secondary text-sm font-inter mb-2">Corruption Score</div>
              <div className="h-2 bg-bg-tertiary rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${stats.corruptionScore}%` }}
                  transition={{ duration: 0.6 }}
                  className="h-full rounded-full bg-red-500"
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Current MLA */}
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <User className="text-gold-primary" size={20} />
            <div className="flex-1">
              {stats.mla ? (
                <div className="flex items-center gap-2">
                  <span className="text-white font-inter font-medium">
                    {stats.mla.name || stats.mla.username}
                  </span>
                  <span className="px-2 py-0.5 text-xs font-inter bg-gold-primary/20 text-gold-primary rounded">
                    MLA
                  </span>
                </div>
              ) : (
                <span className="text-text-secondary font-inter">No MLA Elected</span>
              )}
              <div className="text-text-secondary text-sm font-inter">Current MLA</div>
            </div>
          </div>
        </Card>

        {/* Election Countdown */}
        {stats.nextElection && (
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <Calendar className="text-gold-primary" size={20} />
              <div className="flex-1">
                <div
                  className="text-lg font-bold font-cinzel tracking-wider"
                  style={{ color: "#D4AF37" }}
                >
                  {getTimeUntilElection(stats.nextElection)}
                </div>
                <div className="text-text-secondary text-sm font-inter">Next Election (DD:HH:MM)</div>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
