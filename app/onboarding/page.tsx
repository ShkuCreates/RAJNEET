"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { statesAndDistricts, states } from "@/lib/data/locations";
import { toast } from "sonner";

const onboardingSchema = z.object({
  role: z.enum(["CITIZEN", "LAWYER", "JOURNALIST", "ACTIVIST"]),
  state: z.string().min(1, "State is required"),
  district: z.string().min(1, "District is required"),
  username: z.string().optional(),
  bio: z.string().optional(),
});

type OnboardingFormValues = z.infer<typeof onboardingSchema>;

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<OnboardingFormValues>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      role: "CITIZEN",
      state: "",
      district: "",
      username: "",
      bio: "",
    },
  });

  const selectedState = form.watch("state");
  const districts = selectedState ? statesAndDistricts[selectedState] || [] : [];

  const handleNext = () => setStep((s) => s + 1);
  const handlePrev = () => setStep((s) => s - 1);

  const onSubmit = async (data: OnboardingFormValues) => {
    try {
      setIsSubmitting(true);
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error("Failed to save profile");

      toast.success("Profile created successfully!");
      // Force reload to update session state in middleware
      window.location.href = "/dashboard";
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-lg border border-border bg-card text-card-foreground rounded-xl shadow-lg overflow-hidden">
        <div className="bg-secondary p-6 border-b border-border">
          <h1 className="text-2xl font-bold text-secondary-foreground">Welcome to RAJNEET</h1>
          <p className="text-secondary-foreground/80 mt-1">Setup your civic profile</p>
          <div className="flex gap-2 mt-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className={`h-2 flex-1 rounded-full ${
                  step >= i ? "bg-primary" : "bg-primary/20"
                }`}
              />
            ))}
          </div>
        </div>

        <div className="p-6">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {step === 1 && (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                <h2 className="text-xl font-semibold">1. Choose your role</h2>
                <div className="grid gap-3">
                  {[
                    { id: "CITIZEN", label: "Citizen", desc: "Participate and vote" },
                    { id: "LAWYER", label: "Lawyer", desc: "Flag facts and verify claims" },
                    { id: "JOURNALIST", label: "Journalist / Media", desc: "Report news and shape narrative" },
                    { id: "ACTIVIST", label: "Political Worker / Activist", desc: "Lead debates and gather support" },
                  ].map((role) => (
                    <label
                      key={role.id}
                      className={`flex flex-col p-4 border rounded-lg cursor-pointer transition-colors ${
                        form.watch("role") === role.id
                          ? "border-primary bg-primary/5"
                          : "border-border hover:bg-muted"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          value={role.id}
                          className="text-primary focus:ring-primary"
                          {...form.register("role")}
                        />
                        <span className="font-medium">{role.label}</span>
                      </div>
                      <span className="text-sm text-muted-foreground ml-7 mt-1">{role.desc}</span>
                    </label>
                  ))}
                </div>
                <div className="flex justify-end pt-4">
                  <button
                    type="button"
                    onClick={handleNext}
                    className="bg-primary text-primary-foreground px-6 py-2 rounded hover:bg-primary/90"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                <h2 className="text-xl font-semibold">2. Where are you located?</h2>
                <p className="text-sm text-muted-foreground">This determines your district for elections and MP connectivity.</p>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">State / UT</label>
                  <select
                    className="w-full p-2 bg-background border border-input rounded text-foreground focus:ring-2 focus:ring-primary"
                    {...form.register("state")}
                  >
                    <option value="">Select State</option>
                    {states.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                  {form.formState.errors.state && (
                    <p className="text-sm text-destructive">{form.formState.errors.state.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">District</label>
                  <select
                    className="w-full p-2 bg-background border border-input rounded text-foreground focus:ring-2 focus:ring-primary"
                    {...form.register("district")}
                    disabled={!selectedState}
                  >
                    <option value="">Select District</option>
                    {districts.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                  {form.formState.errors.district && (
                    <p className="text-sm text-destructive">{form.formState.errors.district.message}</p>
                  )}
                </div>

                <div className="flex justify-between pt-4">
                  <button type="button" onClick={handlePrev} className="px-4 py-2 border border-border rounded hover:bg-muted">Back</button>
                  <button
                    type="button"
                    onClick={() => {
                      if (form.getValues("state") && form.getValues("district")) handleNext();
                      else form.trigger(["state", "district"]);
                    }}
                    className="bg-primary text-primary-foreground px-6 py-2 rounded hover:bg-primary/90"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                <h2 className="text-xl font-semibold">3. Personalize your profile (Optional)</h2>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Username</label>
                  <input
                    type="text"
                    placeholder="@username"
                    className="w-full p-2 bg-background border border-input rounded text-foreground focus:ring-2 focus:ring-primary"
                    {...form.register("username")}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Bio</label>
                  <textarea
                    placeholder="Tell your fellow citizens about yourself..."
                    className="w-full p-2 bg-background border border-input rounded text-foreground focus:ring-2 focus:ring-primary h-24 resize-none"
                    {...form.register("bio")}
                  />
                </div>

                <div className="flex justify-between pt-4">
                  <button type="button" onClick={handlePrev} className="px-4 py-2 border border-border rounded hover:bg-muted">Back</button>
                  <button type="button" onClick={handleNext} className="bg-primary text-primary-foreground px-6 py-2 rounded hover:bg-primary/90">Next</button>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-4 text-center animate-in fade-in zoom-in-95">
                <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="text-2xl font-semibold">You&apos;re all set!</h2>
                <p className="text-muted-foreground">Your civic profile is ready. Join the debate and make your voice heard.</p>
                
                <div className="flex justify-between pt-6">
                  <button type="button" onClick={handlePrev} className="px-4 py-2 border border-border rounded hover:bg-muted">Back</button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-primary text-primary-foreground px-8 py-2 rounded hover:bg-primary/90 disabled:opacity-50"
                  >
                    {isSubmitting ? "Entering..." : "Enter the Arena"}
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
