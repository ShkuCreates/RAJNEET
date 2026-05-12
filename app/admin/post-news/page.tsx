"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import TipTapEditor from "@/components/admin/TipTapEditor";
import { statesAndDistricts, states } from "@/lib/data/locations";

const newsSchema = z.object({
  headline: z.string().min(1, "Headline is required"),
  summary: z.string().max(300, "Summary must be less than 300 characters").min(1, "Summary is required"),
  category: z.string().min(1, "Category is required"),
  geo_level: z.string().min(1, "Geographic level is required"),
  state: z.string().nullable(),
  district: z.string().nullable(),
  source_url: z.string().nullable(),
  status: z.enum(["DRAFT", "PUBLISHED"]),
});

type NewsFormValues = z.infer<typeof newsSchema>;

export default function PostNewsPage() {
  const [body, setBody] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<NewsFormValues>({
    resolver: zodResolver(newsSchema),
    defaultValues: {
      headline: "",
      summary: "",
      category: "POLITICAL",
      geo_level: "NATIONAL",
      state: "",
      district: "",
      source_url: "",
      status: "PUBLISHED",
    },
  });

  const selectedState = form.watch("state");
  const districts = selectedState ? statesAndDistricts[selectedState] || [] : [];
  const geoLevel = form.watch("geo_level");

  const onSubmit = async (data: NewsFormValues) => {
    if (!body || body === "<p></p>") {
      toast.error("Full article body is required");
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await fetch("/api/admin/news", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, body }),
      });

      if (!res.ok) throw new Error("Failed to post news");

      toast.success("News article published successfully");
      form.reset();
      setBody("");
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Post New News Article</h1>
      
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 bg-card border border-border p-6 rounded-xl shadow-sm">

        <div className="space-y-2">
          <label className="text-sm font-semibold">Headline</label>
          <input
            {...form.register("headline")}
            className="w-full p-2 border border-input bg-background rounded-md focus:ring-1 focus:ring-primary"
            placeholder="Main headline of the news..."
          />
          {form.formState.errors.headline && <p className="text-xs text-red-500">{form.formState.errors.headline.message}</p>}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold">Short Summary (max 300 chars)</label>
          <textarea
            {...form.register("summary")}
            className="w-full p-2 border border-input bg-background rounded-md focus:ring-1 focus:ring-primary h-20 resize-none"
            placeholder="A brief summary for the feed..."
          />
          {form.formState.errors.summary && <p className="text-xs text-red-500">{form.formState.errors.summary.message}</p>}
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-semibold">Category</label>
            <select {...form.register("category")} className="w-full p-2 border border-input bg-background rounded-md">
              <option value="Politics">Politics</option>
              <option value="Finance">Finance</option>
              <option value="Sports">Sports</option>
              <option value="World">World</option>
              <option value="Entertainment">Entertainment</option>
              <option value="Others">Others</option>
            </select>

          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold">Geographic Level</label>
            <select {...form.register("geo_level")} className="w-full p-2 border border-input bg-background rounded-md">
              <option value="NATIONAL">National</option>
              <option value="INTERNATIONAL">International</option>
              <option value="STATE">By State</option>
              <option value="DISTRICT">By District</option>
            </select>
          </div>
        </div>

        {(geoLevel === "STATE" || geoLevel === "DISTRICT") && (
          <div className="grid md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2">
            <div className="space-y-2">
              <label className="text-sm font-semibold">State</label>
              <select {...form.register("state")} className="w-full p-2 border border-input bg-background rounded-md">
                <option value="">Select State</option>
                {states.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            {geoLevel === "DISTRICT" && (
              <div className="space-y-2">
                <label className="text-sm font-semibold">District</label>
                <select {...form.register("district")} className="w-full p-2 border border-input bg-background rounded-md" disabled={!selectedState}>
                  <option value="">Select District</option>
                  {districts.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
            )}
          </div>
        )}

        <div className="space-y-2">
          <label className="text-sm font-semibold">Source URL (Optional)</label>
          <input
            {...form.register("source_url")}
            className="w-full p-2 border border-input bg-background rounded-md focus:ring-1 focus:ring-primary"
            placeholder="Link to original source..."
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold">Full Article Body</label>
          <TipTapEditor content={body} onChange={setBody} />
        </div>

        <div className="flex items-center justify-between pt-4">
          <div className="flex items-center gap-2">
            <label className="text-sm font-semibold">Status:</label>
            <select {...form.register("status")} className="p-1.5 border border-input bg-background rounded-md text-xs font-bold">
              <option value="PUBLISHED">Published</option>
              <option value="DRAFT">Draft</option>
            </select>
          </div>
          
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-primary text-primary-foreground px-8 py-2 rounded-md font-bold hover:bg-primary/90 disabled:opacity-50 shadow-lg shadow-primary/20"
          >
            {isSubmitting ? "Publishing..." : "Publish Article"}
          </button>
        </div>
      </form>
    </div>
  );
}
