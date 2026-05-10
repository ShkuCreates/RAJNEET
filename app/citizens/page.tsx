"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { CitizenCard } from "@/components/citizens/CitizenCard";
import { CITIZEN_ROLES } from "@/lib/constants";
import { Sidebar } from "@/components/layout/Sidebar";

const mockCitizens = [
  {
    username: "rahul_politics",
    name: "Rahul Sharma",
    role: "MP",
    party: "Progressive Party",
    partyColor: "#D4AF37",
    followers: 1247,
    state: "Maharashtra",
  },
  {
    username: "priya_news",
    name: "Priya Patel",
    role: "Journalist",
    party: null,
    followers: 567,
    state: "Delhi",
  },
  {
    username: "amit_activist",
    name: "Amit Verma",
    role: "Activist",
    party: "People's Movement",
    partyColor: "#27AE60",
    followers: 234,
    state: "Uttar Pradesh",
  },
  {
    username: "neeta_law",
    name: "Neeta Gupta",
    role: "Lawyer",
    party: null,
    followers: 189,
    state: "Karnataka",
  },
  {
    username: "vikram_influencer",
    name: "Vikram Singh",
    role: "Influencer",
    party: "Digital India Party",
    partyColor: "#3498DB",
    followers: 892,
    state: "Tamil Nadu",
  },
  {
    username: "sneha_meme",
    name: "Sneha Reddy",
    role: "Meme Creator",
    party: null,
    followers: 445,
    state: "Telangana",
  },
];

export default function CitizensPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [partyFilter, setPartyFilter] = useState("All");
  const [sortBy, setSortBy] = useState("followers");

  const filteredCitizens = mockCitizens.filter((citizen) => {
    const matchesSearch =
      citizen.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      citizen.username.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === "All" || citizen.role === roleFilter;
    const matchesParty = partyFilter === "All" || citizen.party === partyFilter;
    return matchesSearch && matchesRole && matchesParty;
  });

  const sortedCitizens = [...filteredCitizens].sort((a, b) => {
    if (sortBy === "followers") return b.followers - a.followers;
    if (sortBy === "name") return a.name.localeCompare(b.name);
    return 0;
  });

  const uniqueParties = Array.from(
    new Set(mockCitizens.map((c) => c.party).filter((p): p is string => p !== null && p !== undefined))
  );

  return (
    <div className="min-h-screen bg-bg-primary flex">
      <Sidebar />

      <main className="flex-1 p-6 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-6xl mx-auto"
        >
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-cinzel text-gold-gradient mb-2">Citizens Directory</h1>
            <p className="text-text-secondary font-inter">
              Discover and connect with political participants across RAJNEET
            </p>
          </div>

          {/* Search and Filters */}
          <div className="bg-bg-secondary border border-[rgba(212,175,55,0.2)] rounded-lg p-6 mb-8">
            <div className="flex flex-col md:flex-row gap-4 mb-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary" size={20} />
                <Input
                  placeholder="Search by username or name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button variant="secondary" className="flex items-center gap-2">
                <Filter size={20} />
                Filters
              </Button>
            </div>

            <div className="flex flex-wrap gap-4">
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="bg-bg-tertiary border border-[rgba(212,175,55,0.2)] rounded-lg px-4 py-2 text-white focus:border-gold-primary focus:outline-none font-inter"
              >
                <option value="All">All Roles</option>
                {CITIZEN_ROLES.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>

              <select
                value={partyFilter}
                onChange={(e) => setPartyFilter(e.target.value)}
                className="bg-bg-tertiary border border-[rgba(212,175,55,0.2)] rounded-lg px-4 py-2 text-white focus:border-gold-primary focus:outline-none font-inter"
              >
                <option value="All">All Parties</option>
                {uniqueParties.map((party) => (
                  <option key={party} value={party}>
                    {party}
                  </option>
                ))}
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-bg-tertiary border border-[rgba(212,175,55,0.2)] rounded-lg px-4 py-2 text-white focus:border-gold-primary focus:outline-none font-inter"
              >
                <option value="followers">Sort by Followers</option>
                <option value="name">Sort by Name</option>
              </select>
            </div>
          </div>

          {/* Citizens Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedCitizens.map((citizen, index) => (
              <CitizenCard key={citizen.username} {...citizen} />
            ))}
          </div>

          {sortedCitizens.length === 0 && (
            <div className="text-center py-12">
              <p className="text-text-secondary font-inter text-lg">No citizens found matching your criteria.</p>
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
}
