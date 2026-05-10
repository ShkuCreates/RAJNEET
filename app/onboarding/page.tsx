"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { StepUsername } from "@/components/onboarding/StepUsername";
import { StepState } from "@/components/onboarding/StepState";
import { StepRole } from "@/components/onboarding/StepRole";
import { StepParty } from "@/components/onboarding/StepParty";
import { StepWelcome } from "@/components/onboarding/StepWelcome";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { prisma } from "@/lib/prisma";

const steps = ["Setup", "State", "Role", "Party", "Welcome"];

type OnboardingData = {
  username?: string;
  state?: string;
  role?: string;
  partyAction?: "join" | "create" | "skip";
  partyId?: string;
  partyName?: string;
  partyColor?: string;
  partyLogo?: string;
};

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [data, setData] = useState<OnboardingData>({});
  const { data: session } = useSession();
  const router = useRouter();

  const handleUsername = (username: string) => {
    setData({ ...data, username });
    setCurrentStep(1);
  };

  const handleState = (state: string) => {
    setData({ ...data, state });
    setCurrentStep(2);
  };

  const handleRole = (role: string) => {
    setData({ ...data, role });
    setCurrentStep(3);
  };

  const handleParty = async (partyData: {
    action: "join" | "create" | "skip";
    partyId?: string;
    partyName?: string;
    partyColor?: string;
    partyLogo?: string;
  }) => {
    setData({ ...data, ...partyData });
    
    // Create party if needed
    if (partyData.action === "create" && partyData.partyName && session?.user?.id) {
      try {
        const response = await fetch("/api/parties", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: partyData.partyName,
            tagline: "",
            color: partyData.partyColor,
            logo: partyData.partyLogo,
            leaderId: session.user.id,
          }),
        });
        if (response.ok) {
          const party = await response.json();
          setData(prev => ({ ...prev, partyId: party.id }));
        }
      } catch (error) {
        console.error("Error creating party:", error);
      }
    }
    
    setCurrentStep(4);
  };

  const handleComplete = async () => {
    if (!session?.user?.id) return;

    try {
      const response = await fetch("/api/users/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        router.push("/dashboard");
      }
    } catch (error) {
      console.error("Error completing onboarding:", error);
    }
  };

  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Logo Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-center mb-6"
        >
          <Image
            src="/images/rajneet-logo.png"
            alt="RAJNEET"
            width={48}
            height={48}
            priority
          />
        </motion.div>

        {/* Progress Bar */}
        {currentStep < 4 && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <ProgressBar progress={((currentStep + 1) / 5) * 100} showLabel label="Onboarding Progress" />
            <div className="flex justify-between mt-2">
              {steps.map((step, index) => (
                <span
                  key={step}
                  className={`text-xs font-inter ${
                    index <= currentStep ? "text-gold-primary" : "text-text-secondary"
                  }`}
                >
                  {step}
                </span>
              ))}
            </div>
          </motion.div>
        )}

        {/* Step Content */}
        <motion.div
          className="bg-bg-secondary border border-[rgba(212,175,55,0.2)] rounded-12 p-8"
          style={{ borderRadius: "12px" }}
        >
          <AnimatePresence mode="wait">
            {currentStep === 0 && (
              <StepUsername key="username" onNext={handleUsername} />
            )}
            {currentStep === 1 && (
              <StepState key="state" onNext={handleState} />
            )}
            {currentStep === 2 && (
              <StepRole key="role" onNext={handleRole} />
            )}
            {currentStep === 3 && (
              <StepParty key="party" onNext={handleParty} />
            )}
            {currentStep === 4 && (
              <StepWelcome key="welcome" username={data.username || ""} onNext={handleComplete} />
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
