"use client";

import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { 
  Check, 
  X, 
  Loader2, 
  Search, 
  ChevronDown,
  User,
  Phone,
  ArrowRight,
  Shield,
  Circle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { states } from "@/lib/data/locations";

const CATEGORIES = [
  { id: "STUDENT", label: "Student", icon: "🎓" },
  { id: "TEACHER", label: "Teacher", icon: "👨‍🏫" },
  { id: "BUSINESS", label: "Businessman", icon: "💼" },
  { id: "FREELANCER", label: "Freelancer", icon: "💻" },
  { id: "DEFENCE", label: "Army / Defence", icon: "🪖" },
  { id: "HEALTHCARE", label: "Doctor / Healthcare", icon: "⚕️" },
  { id: "LEGAL", label: "Legal Professional", icon: "⚖️" },
  { id: "JOURNALIST", label: "Journalist / Media", icon: "📰" },
  { id: "FARMER", label: "Farmer", icon: "👨‍🌾" },
  { id: "GOVERNMENT", label: "Government Employee", icon: "🏛️" },
  { id: "SKILLED_WORKER", label: "Skilled Worker", icon: "🔧" },
  { id: "OTHER", label: "Other", icon: "👤" },
];

const FLOATING_ELEMENTS = [
  { text: "FOR", top: "10%", left: "5%", rotate: -15, size: "text-6xl" },
  { text: "AGAINST", top: "15%", right: "10%", rotate: 12, size: "text-5xl" },
  { text: "NEUTRAL", bottom: "10%", left: "8%", rotate: -8, size: "text-4xl" },
  { text: "लोकतंत्र", bottom: "20%", right: "5%", rotate: 5, size: "text-7xl" },
  { text: "DEBATE", top: "50%", left: "2%", rotate: 90, size: "text-5xl" },
  { text: "VOTE", top: "40%", right: "3%", rotate: -90, size: "text-6xl" },
  { text: "ARTICLE 19", bottom: "5%", left: "40%", rotate: 0, size: "text-5xl" },
  { text: "जनमत", top: "5%", left: "30%", rotate: -5, size: "text-4xl" },
  { text: "PARLIAMENT", top: "60%", right: "15%", rotate: 15, size: "text-3xl" },
];

const onboardingSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  username: z.string()
    .min(3, "Username must be at least 3 characters")
    .max(20, "Username must be at most 20 characters")
    .regex(/^[a-z0-9_]+$/, "Only lowercase letters, numbers, and underscores allowed"),
  category: z.string().min(1, "Please select a category"),
  state: z.string().min(1, "Please select a state"),
  mobile: z.string().optional().refine(val => !val || /^\d{10}$/.test(val), {
    message: "Mobile number must be exactly 10 digits"
  }),
});

type OnboardingValues = z.infer<typeof onboardingSchema>;

export default function OnboardingPage() {
  const { data: session, update } = useSession();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [usernameStatus, setUsernameStatus] = useState<"idle" | "checking" | "available" | "taken">("idle");
  const [stateSearch, setStateSearch] = useState("");
  const [isStateOpen, setIsStateOpen] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors }
  } = useForm<OnboardingValues>({
    resolver: zodResolver(onboardingSchema),
    mode: "onChange",
    defaultValues: {
      name: session?.user?.name || "",
      username: "",
      category: "",
      state: "",
      mobile: ""
    }
  });

  const watchUsername = watch("username");
  const watchCategory = watch("category");
  const watchState = watch("state");
  const watchName = watch("name");

  useEffect(() => {
    if (session?.user?.name && !watchName) {
      setValue("name", session.user.name);
    }
  }, [session, setValue, watchName]);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (watchUsername && watchUsername.length >= 3) {
        setUsernameStatus("checking");
        try {
          const res = await fetch(`/api/user/check-username?username=${watchUsername}`);
          const data = await res.json();
          setUsernameStatus(data.available ? "available" : "taken");
        } catch (error) {
          setUsernameStatus("idle");
        }
      } else {
        setUsernameStatus("idle");
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [watchUsername]);

  const filteredStates = states.filter(s => 
    s.toLowerCase().includes(stateSearch.toLowerCase())
  );

  const onSubmit = async (data: OnboardingValues) => {
    if (usernameStatus !== "available") return;
    try {
      setIsSubmitting(true);
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to save profile");
      await update();
      window.location.href = "/dashboard";
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = (watchName?.length || 0) >= 2 && 
                      usernameStatus === "available" && 
                      watchCategory !== "" && 
                      watchState !== "";

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5, ease: "easeOut", staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-[#050A14] flex items-center justify-center p-4 md:p-6 relative overflow-hidden font-body">
      {/* LAYER 1: Base Gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_#0D1B3E_0%,_#050A14_100%)] z-0" />
      
      {/* LAYER 2: Newspaper Texture Overlay */}
      <div 
        className="absolute inset-0 opacity-[0.04] pointer-events-none z-[1]"
        style={{ 
          backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 1px, rgba(255,255,255,0.1) 1px, rgba(255,255,255,0.1) 2px),
                            repeating-linear-gradient(90deg, transparent, transparent 100px, rgba(255,255,255,0.05) 100px, rgba(255,255,255,0.05) 101px)`
        }}
      />

      {/* LAYER 3: Floating Debate Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-[2]">
        {FLOATING_ELEMENTS.map((el, i) => (
          <div 
            key={i}
            className={`absolute ${el.size} font-heading font-black text-white opacity-[0.06] blur-[3px] select-none`}
            style={{ 
              top: el.top, 
              left: el.left, 
              right: el.right, 
              bottom: el.bottom, 
              transform: `rotate(${el.rotate}deg)` 
            }}
          >
            {el.text}
          </div>
        ))}
      </div>

      {/* MAIN ONBOARDING CARD */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-2xl bg-[#0D1B3E]/75 backdrop-blur-[20px] saturate-[180%] border border-white/10 rounded-[20px] shadow-[0_25px_80px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.05)] relative z-10"
      >
        {/* Card Accent Line */}
        <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-accent-blue to-transparent" />

        <div className="p-8 md:p-12">
          {/* Header Section */}
          <motion.div variants={itemVariants} className="flex flex-col items-center mb-10 text-center">
            <img 
              src="/images/rajneet-logo.png" 
              alt="RAJNEET Logo" 
              className="h-10 w-auto mb-4 drop-shadow-[0_0_8px_rgba(245,158,11,0.4)]"
            />
            <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-accent-blue/40 to-transparent mb-6" />
            <h1 className="text-3xl md:text-4xl font-heading font-bold text-white mb-2 tracking-tight">
              Complete your profile
            </h1>
            <div className="flex items-center justify-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-accent-blue animate-pulse" />
              <p className="text-sm text-white/80 font-medium">Takes less than a minute</p>
            </div>
          </motion.div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-10">
            {/* Row 1: Name & Username */}
            <motion.div variants={itemVariants} className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2.5">
                <label className="text-sm font-semibold text-white/90 flex items-center gap-2">
                  Full Name <span className="text-red-500/80">*</span>
                </label>
                <div className="relative group">
                  <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-accent-blue group-focus-within:text-white transition-colors" />
                  <input 
                    {...register("name")}
                    placeholder="Your full name"
                    className="w-full bg-white/[0.04] border border-white/[0.08] rounded-[10px] py-3.5 pl-12 pr-4 text-white placeholder:text-gray-500 focus:border-accent-blue focus:ring-[3px] focus:ring-accent-blue/15 transition-all outline-none"
                  />
                </div>
                {errors.name && <p className="text-xs text-red-400 font-medium ml-1">{errors.name.message}</p>}
              </div>

              <div className="space-y-2.5">
                <label className="text-sm font-semibold text-white/90">
                  Username <span className="text-red-500/80">*</span>
                </label>
                <div className="relative group">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-accent-blue group-focus-within:text-white font-bold transition-colors">@</span>
                  <input 
                    {...register("username")}
                    placeholder="username"
                    className="w-full bg-white/[0.04] border border-white/[0.08] rounded-[10px] py-3.5 pl-10 pr-10 text-white placeholder:text-gray-500 focus:border-accent-blue focus:ring-[3px] focus:ring-accent-blue/15 transition-all outline-none"
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2">
                    {usernameStatus === "checking" && <Loader2 size={16} className="animate-spin text-accent-blue" />}
                    {usernameStatus === "available" && <Check size={18} className="text-green-400 drop-shadow-[0_0_5px_rgba(74,222,128,0.5)]" />}
                    {usernameStatus === "taken" && <X size={18} className="text-red-400 drop-shadow-[0_0_5px_rgba(248,113,113,0.5)]" />}
                  </div>
                </div>
                {errors.username && <p className="text-xs text-red-400 font-medium ml-1">{errors.username.message}</p>}
                {usernameStatus === "taken" && <p className="text-xs text-red-400 font-medium ml-1">This username is already taken</p>}
              </div>
            </motion.div>

            {/* Category Grid */}
            <motion.div variants={itemVariants} className="space-y-5">
              <label className="text-sm font-semibold text-white/90">
                Category <span className="text-red-500/80">*</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5">
                {CATEGORIES.map((cat, idx) => (
                  <motion.button
                    key={cat.id}
                    type="button"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 + idx * 0.04 }}
                    whileHover={{ scale: 1.02 }}
                    onClick={() => setValue("category", cat.id, { shouldValidate: true })}
                    className={`flex flex-col items-center justify-center p-4 rounded-[12px] border transition-all duration-200 relative group ${
                      watchCategory === cat.id 
                        ? "bg-accent-blue/15 border-accent-blue shadow-[0_0_20px_rgba(59,130,246,0.15)]" 
                        : "bg-white/[0.03] border-white/[0.07] hover:border-white/20 hover:bg-white/[0.06]"
                    }`}
                  >
                    {watchCategory === cat.id && (
                      <div className="absolute top-2 right-2 w-4 h-4 bg-accent-blue rounded-full flex items-center justify-center shadow-lg">
                        <Check size={10} className="text-white" />
                      </div>
                    )}
                    <span className={`text-2xl mb-2 transition-all ${watchCategory === cat.id ? "scale-110 grayscale-0" : "grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100"}`}>
                      {cat.icon}
                    </span>
                    <span className={`text-[10px] font-bold uppercase tracking-widest text-center transition-colors ${
                      watchCategory === cat.id ? "text-white" : "text-white/40"
                    }`}>
                      {cat.label}
                    </span>
                  </motion.button>
                ))}
              </div>
              {errors.category && <p className="text-xs text-red-400 font-medium ml-1">{errors.category.message}</p>}
            </motion.div>

            {/* Row 2: State & Mobile */}
            <motion.div variants={itemVariants} className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2.5 relative">
                <label className="text-sm font-semibold text-white/90">
                  State <span className="text-red-500/80">*</span>
                </label>
                <div className="relative group">
                  <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-accent-blue group-focus-within:text-white transition-colors" />
                  <input 
                    type="text"
                    placeholder="Select your state"
                    value={isStateOpen ? stateSearch : watchState}
                    onChange={(e) => {
                      setStateSearch(e.target.value);
                      if (!isStateOpen) setIsStateOpen(true);
                    }}
                    onFocus={() => setIsStateOpen(true)}
                    className="w-full bg-white/[0.04] border border-white/[0.08] rounded-[10px] py-3.5 pl-12 pr-10 text-white placeholder:text-gray-500 focus:border-accent-blue focus:ring-[3px] focus:ring-accent-blue/15 transition-all outline-none"
                  />
                  <ChevronDown size={18} className={`absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 transition-transform ${isStateOpen ? "rotate-180" : ""}`} />
                  
                  <AnimatePresence>
                    {isStateOpen && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute top-full mt-2 left-0 w-full max-h-60 overflow-y-auto bg-[#0D1B3E] backdrop-blur-2xl border border-white/10 rounded-[15px] z-[100] shadow-2xl p-2 custom-scrollbar"
                      >
                        {filteredStates.length > 0 ? (
                          filteredStates.map(s => (
                            <button
                              key={s}
                              type="button"
                              onMouseDown={(e) => {
                                e.preventDefault();
                                setValue("state", s, { shouldValidate: true });
                                setIsStateOpen(false);
                                setStateSearch("");
                              }}
                              className="w-full text-left px-4 py-2.5 hover:bg-accent-blue/10 rounded-[8px] text-sm text-gray-300 hover:text-white flex items-center justify-between group transition-colors cursor-pointer"
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-1 h-0 bg-accent-blue group-hover:h-4 transition-all duration-200" />
                                {s}
                              </div>
                              {watchState === s && <Check size={14} className="text-accent-blue" />}
                            </button>
                          ))
                        ) : (
                          <p className="p-4 text-center text-sm text-gray-500">No states found</p>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                {errors.state && <p className="text-xs text-red-400 font-medium ml-1">{errors.state.message}</p>}
              </div>

              <div className="space-y-2.5">
                <label className="text-sm font-semibold text-white/90">
                  Mobile Number <span className="text-xs text-white/40 ml-1 font-normal">(Optional)</span>
                </label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2 pr-3 border-r border-white/10 h-1/2">
                    <Phone size={14} className="text-accent-blue" />
                    <span className="text-sm text-gray-400 font-bold tracking-tighter">+91</span>
                  </div>
                  <input 
                    {...register("mobile")}
                    placeholder="10-digit mobile number"
                    maxLength={10}
                    className="w-full bg-white/[0.04] border border-white/[0.08] rounded-[10px] py-3.5 pl-20 pr-4 text-white placeholder:text-gray-500 focus:border-accent-blue focus:ring-[3px] focus:ring-accent-blue/15 transition-all outline-none"
                  />
                </div>
                {errors.mobile && <p className="text-xs text-red-400 font-medium ml-1">{errors.mobile.message}</p>}
              </div>
            </motion.div>

            {/* Submission Button */}
            <motion.div variants={itemVariants} className="pt-6 space-y-6">
              <button
                type="submit"
                disabled={!isFormValid || isSubmitting}
                className={`w-full h-14 rounded-[10px] text-white font-bold transition-all flex items-center justify-center gap-2 relative overflow-hidden group shadow-lg ${
                  isFormValid && !isSubmitting 
                    ? "bg-gradient-to-r from-[#2563EB] to-[#3B82F6] hover:brightness-110 hover:-translate-y-0.5 active:translate-y-0 shadow-accent-blue/20" 
                    : "bg-white/[0.05] text-gray-500 cursor-not-allowed"
                }`}
              >
                {/* Shimmer Effect */}
                {isFormValid && !isSubmitting && (
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-shimmer" />
                )}
                
                {isSubmitting ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  <>
                    Enter RAJNEET
                    <ArrowRight size={20} className="transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </button>
              
              <div className="flex items-center justify-center">
                <div className="flex items-center gap-2.5 px-6 py-2.5 bg-accent-blue/[0.06] border border-accent-blue/20 rounded-full text-[11px] text-white/90 uppercase tracking-[0.05em] font-bold">
                  <Shield size={14} className="text-accent-blue" />
                  Your data is protected under DPDP Act 2023. We never sell your information.
                </div>
              </div>
            </motion.div>
          </form>
        </div>
      </motion.div>
      
      {/* Click outside to close state dropdown */}
      {isStateOpen && <div className="fixed inset-0 z-[50]" onClick={() => setIsStateOpen(false)} />}
    </div>
  );
}
