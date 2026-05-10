"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, MapPin, Users, Building, Crown } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

interface State {
  name: string;
  citizenCount: number;
  districtCount: number;
}

interface District {
  id: string;
  name: string;
  citizenCount: number;
  rulingParty?: {
    name: string;
    color: string;
  };
  approvalRating: number;
}

interface TravelModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentState?: string;
  currentDistrict?: string;
  onVisitDistrict: (state: string, district: string) => void;
}

export function TravelModal({
  isOpen,
  onClose,
  currentState,
  currentDistrict,
  onVisitDistrict,
}: TravelModalProps) {
  const [states, setStates] = useState<State[]>([]);
  const [expandedState, setExpandedState] = useState<string | null>(null);
  const [districts, setDistricts] = useState<Record<string, District[]>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchStates();
    }
  }, [isOpen]);

  const fetchStates = async () => {
    try {
      const response = await fetch("/api/states");
      if (response.ok) {
        const data = await response.json();
        setStates(data);
      }
    } catch (error) {
      console.error("Error fetching states:", error);
    }
  };

  const fetchDistricts = async (stateName: string) => {
    if (districts[stateName]) {
      // Already fetched
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/states/${encodeURIComponent(stateName)}/districts`);
      if (response.ok) {
        const data = await response.json();
        setDistricts(prev => ({ ...prev, [stateName]: data }));
      }
    } catch (error) {
      console.error("Error fetching districts:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStateClick = (stateName: string) => {
    if (expandedState === stateName) {
      setExpandedState(null);
    } else {
      setExpandedState(stateName);
      fetchDistricts(stateName);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="large">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-cinzel text-gold-gradient mb-2">
              TRAVEL — Explore the Arena
            </h2>
            {currentState && currentDistrict && (
              <p className="text-text-secondary text-sm font-inter">
                You are currently in {currentDistrict}, {currentState}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-text-secondary hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* States Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {states.map((state) => {
            const isCurrentState = state.name === currentState;
            const isExpanded = expandedState === state.name;
            const stateDistricts = districts[state.name] || [];

            return (
              <div key={state.name} className="space-y-2">
                <motion.div
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Card
                    hover
                    className={`p-4 cursor-pointer transition-all ${
                      isCurrentState
                        ? "border-gold-primary shadow-[0_0_15px_rgba(212,175,55,0.3)]"
                        : ""
                    }`}
                    onClick={() => handleStateClick(state.name)}
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="text-white font-cinzel text-lg">
                          {state.name}
                        </h3>
                        {isCurrentState && (
                          <span className="px-2 py-1 text-xs font-inter font-semibold rounded-full bg-gold-primary text-black">
                            YOU ARE HERE
                          </span>
                        )}
                      </div>

                      <div
                        className="h-px"
                        style={{
                          background: "linear-gradient(90deg, transparent, rgba(212,175,55,0.3), transparent)",
                        }}
                      />

                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-text-secondary text-sm font-inter">
                          <Users size={14} />
                          <span>{state.citizenCount.toLocaleString()} Citizens</span>
                        </div>
                        <div className="flex items-center gap-2 text-text-secondary text-sm font-inter">
                          <Building size={14} />
                          <span>{state.districtCount} Districts</span>
                        </div>
                        {stateDistricts.length > 0 && (
                          <div className="flex items-center gap-2 text-text-secondary text-sm font-inter">
                            <Crown size={14} />
                            <span>Ruling: {stateDistricts[0]?.rulingParty?.name || "No Election"}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                </motion.div>

                {/* Expanded Districts */}
                <AnimatePresence>
                  {isExpanded && stateDistricts.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-2 pl-2"
                    >
                      {stateDistricts.map((district) => {
                        const isCurrentDistrict = district.name === currentDistrict;
                        
                        return (
                          <Card
                            key={district.id}
                            hover
                            className={`p-3 ${
                              isCurrentDistrict ? "opacity-50" : ""
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <h4 className="text-white font-inter text-sm font-medium mb-1">
                                  {district.name}
                                </h4>
                                <div className="flex items-center gap-3 text-xs text-text-secondary">
                                  <span>{district.citizenCount} citizens</span>
                                  <span>{district.approvalRating.toFixed(1)}% approval</span>
                                </div>
                              </div>
                              {!isCurrentDistrict && (
                                <Button
                                  variant="secondary"
                                  size="sm"
                                  onClick={() => onVisitDistrict(state.name, district.name)}
                                >
                                  Visit
                                </Button>
                              )}
                            </div>
                          </Card>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

        {loading && (
          <div className="text-center text-text-secondary text-sm font-inter">
            Loading districts...
          </div>
        )}
      </div>
    </Modal>
  );
}
