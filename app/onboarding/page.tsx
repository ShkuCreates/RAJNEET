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
  Shield
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

const onboardingSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  username: z.string()
    .min(3, "Username must be at least 3 characters")
    .max(20, "Username must be at most 20 characters")
    .regex(/^[a-z0-0_]+$/, "Only lowercase letters, numbers, and underscores allowed"),
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
    formState: { errors, isValid }
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

  // Pre-fill name from session
  useEffect(() => {
    if (session?.user?.name && !watchName) {
      setValue("name", session.user.name);
    }
  }, [session, setValue, watchName]);

  // Username check
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

      // Update session locally if possible, then redirect
      await update();
      window.location.href = "/dashboard";
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = watchName.length >= 2 && 
                      usernameStatus === "available" && 
                      watchCategory !== "" && 
                      watchState !== "";

  return (
    <div className="min-h-screen bg-midnight flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-accent-blue/5 rounded-full blur-[120px] pointer-events-none" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl bg-surface border border-white/5 rounded-3xl p-8 md:p-12 shadow-2xl relative z-10"
      >
        <div className="flex flex-col items-center mb-10 text-center">
          <div className="text-2xl font-black text-accent-amber mb-4 tracking-tighter">RAJNEET</div>
          <h1 className="text-3xl font-heading font-bold text-white mb-2">Complete your profile</h1>
          <p className="text-muted-foreground font-body">Takes less than a minute.</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Row 1: Name & Username */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-off-white flex items-center gap-2">
                Full Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input 
                  {...register("name")}
                  placeholder="Your full name"
                  className="w-full bg-midnight/50 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:border-accent-blue focus:ring-1 focus:ring-accent-blue transition-all outline-none"
                />
              </div>
              {errors.name && <p className="text-xs text-red-400 mt-1">{errors.name.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-off-white">
                Username <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">@</span>
                <input 
                  {...register("username")}
                  placeholder="username"
                  className="w-full bg-midnight/50 border border-white/10 rounded-xl py-3 pl-9 pr-10 text-white focus:border-accent-blue focus:ring-1 focus:ring-accent-blue transition-all outline-none"
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                  {usernameStatus === "checking" && <Loader2 size={16} className="animate-spin text-accent-blue" />}
                  {usernameStatus === "available" && <Check size={16} className="text-green-500" />}
                  {usernameStatus === "taken" && <X size={16} className="text-red-500" />}
                </div>
              </div>
              {errors.username && <p className="text-xs text-red-400 mt-1">{errors.username.message}</p>}
              {usernameStatus === "taken" && <p className="text-xs text-red-400 mt-1">This username is already taken</p>}
            </div>
          </div>

          {/* Category Grid */}
          <div className="space-y-4">
            <label className="text-sm font-medium text-off-white">
              Category <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setValue("category", cat.id, { shouldValidate: true })}
                  className={`flex flex-col items-center justify-center p-4 rounded-2xl border transition-all duration-200 group ${
                    watchCategory === cat.id 
                      ? "bg-accent-blue/10 border-accent-blue shadow-[0_0_15px_rgba(59,130,246,0.2)]" 
                      : "bg-midnight/30 border-white/5 hover:border-white/10"
                  }`}
                >
                  <span className="text-2xl mb-2 group-hover:scale-110 transition-transform">{cat.icon}</span>
                  <span className={`text-[10px] font-bold uppercase tracking-wider text-center ${
                    watchCategory === cat.id ? "text-accent-blue" : "text-muted-foreground"
                  }`}>
                    {cat.label}
                  </span>
                </button>
              ))}
            </div>
            {errors.category && <p className="text-xs text-red-400">{errors.category.message}</p>}
          </div>

          {/* Row 2: State & Mobile */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2 relative">
              <label className="text-sm font-medium text-off-white">
                State <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input 
                  type="text"
                  placeholder="Select your state"
                  value={isStateOpen ? stateSearch : watchState}
                  onChange={(e) => {
                    setStateSearch(e.target.value);
                    if (!isStateOpen) setIsStateOpen(true);
                  }}
                  onFocus={() => setIsStateOpen(true)}
                  className="w-full bg-midnight/50 border border-white/10 rounded-xl py-3 pl-12 pr-10 text-white focus:border-accent-blue outline-none"
                />
                <ChevronDown size={18} className={`absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground transition-transform ${isStateOpen ? "rotate-180" : ""}`} />
                
                <AnimatePresence>
                  {isStateOpen && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute bottom-full mb-2 left-0 w-full max-h-60 overflow-y-auto bg-surface border border-white/10 rounded-xl z-[100] shadow-2xl p-2"
                    >
                      {filteredStates.length > 0 ? (
                        filteredStates.map(s => (
                          <button
                            key={s}
                            type="button"
                            onClick={() => {
                              setValue("state", s, { shouldValidate: true });
                              setIsStateOpen(false);
                              setStateSearch("");
                            }}
                            className="w-full text-left px-4 py-2 hover:bg-white/5 rounded-lg text-sm text-off-white"
                          >
                            {s}
                          </button>
                        ))
                      ) : (
                        <p className="p-4 text-center text-sm text-muted-foreground">No states found</p>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              {errors.state && <p className="text-xs text-red-400">{errors.state.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-off-white">
                Mobile Number <span className="text-xs text-muted-foreground ml-1">(Optional)</span>
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2 pr-2 border-r border-white/10 h-1/2">
                  <span className="text-sm text-muted-foreground font-medium">+91</span>
                </div>
                <input 
                  {...register("mobile")}
                  placeholder="10-digit mobile number"
                  maxLength={10}
                  className="w-full bg-midnight/50 border border-white/10 rounded-xl py-3 pl-16 pr-4 text-white focus:border-accent-blue outline-none"
                />
              </div>
              {errors.mobile && <p className="text-xs text-red-400">{errors.mobile.message}</p>}
            </div>
          </div>

          <div className="pt-6 space-y-4">
            <button
              type="submit"
              disabled={!isFormValid || isSubmitting}
              className="w-full h-14 bg-accent-blue hover:bg-accent-blue/90 disabled:bg-white/5 disabled:text-white/20 disabled:cursor-not-allowed text-white font-bold rounded-2xl transition-all flex items-center justify-center gap-2 group"
            >
              {isSubmitting ? (
                <Loader2 className="animate-spin" />
              ) : (
                <>
                  Enter RAJNEET
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
            
            <div className="flex items-center justify-center gap-2 text-[10px] text-muted-foreground uppercase tracking-widest font-bold text-center">
              <Shield size={12} className="text-accent-blue" />
              Your data is protected under DPDP Act 2023. We never sell your information.
            </div>
          </div>
        </form>
      </motion.div>
      
      {/* Click outside to close state dropdown */}
      {isStateOpen && <div className="fixed inset-0 z-[50]" onClick={() => setIsStateOpen(false)} />}
    </div>
  );
}
