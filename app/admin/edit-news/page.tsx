"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
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

export default function EditNewsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const id = searchParams.get("id");
  const [body, setBody] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

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

  useEffect(() => {
    if (!id) {
      router.push("/admin/manage-news");
      return;
    }

    const fetchNews = async () => {
      try {
        setIsLoading(true);
        // We'll fetch from the API or use window.location to get it
        const res = await fetch(`/api/admin/news-by-id?id=${id}`);
        if (res.ok) {
          const data = await res.json();
          form.reset({
            headline: data.headline,
            summary: data.summary,
            category: data.category,
            geo_level: data.geo_level,
            state: data.state || "",
            district: data.district || "",
            source_url: data.source_url || "",
            status: data.status,
          });
          setBody(data.body || "");
        } else {
          toast.error("Failed to load news article");
          router.push("/admin/manage-news");
        }
      } catch (error) {
        toast.error("Failed to load news article");
        router.push("/admin/manage-news");
      } finally {
        setIsLoading(false);
      }
    };

    fetchNews();
  }, [id, form, router]);

  const onSubmit = async (data: NewsFormValues) => {
    if (!body || body === "<p></p>") {
      toast.error("Full article body is required");
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await fetch("/api/admin/news", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...data, body }),
      });

      if (!res.ok) throw new Error("Failed to update news");

      toast.success("News article updated successfully");
      router.push("/admin/manage-news");
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Loading...</h1>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050A14] p-8 md:p-16">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-4 mb-12">
          <button 
            onClick={() => router.push("/admin/manage-news")}
            className="px-4 py-2 bg-white/5 text-white rounded-lg hover:bg-white/10 transition-colors"
          >
            ← Back
          </button>
          <div>
            <h1 className="text-3xl font-heading font-black text-white uppercase tracking-tight">Edit News Article</h1>
            <p className="text-gray-500 font-medium">Update the article details and content.</p>
          </div>
        </div>
        
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 bg-[#111827] border border-white/5 p-8 rounded-[32px] shadow-xl">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-300">Headline</label>
            <input
              {...form.register("headline")}
              className="w-full px-4 py-3 border border-white/10 bg-white/[0.02] rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:border-accent-blue/50 transition-colors"
              placeholder="Main headline of the news..."
            />
            {form.formState.errors.headline && <p className="text-xs text-red-500">{form.formState.errors.headline.message}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-300">Short Summary (max 300 chars)</label>
            <textarea
              {...form.register("summary")}
              className="w-full px-4 py-3 border border-white/10 bg-white/[0.02] rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:border-accent-blue/50 transition-colors h-24 resize-none"
              placeholder="A brief summary for the feed..."
            />
            {form.formState.errors.summary && <p className="text-xs text-red-500">{form.formState.errors.summary.message}</p>}
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-300">Category</label>
              <select {...form.register("category")} className="w-full px-4 py-3 border border-white/10 bg-white/[0.02] rounded-2xl text-white focus:outline-none focus:border-accent-blue/50 transition-colors">
                <option value="POLITICAL">Politics</option>
                <option value="FINANCE">Finance</option>
                <option value="SPORTS">Sports</option>
                <option value="WORLD">World</option>
                <option value="ENTERTAINMENT">Entertainment</option>
                <option value="CRIMINAL">Criminal</option>
                <option value="INFRASTRUCTURE">Infrastructure</option>
                <option value="ENVIRONMENT">Environment</option>
                <option value="HEALTH">Health</option>
                <option value="TECHNOLOGY">Technology</option>
                <option value="OTHERS">Others</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-300">Geographic Level</label>
              <select {...form.register("geo_level")} className="w-full px-4 py-3 border border-white/10 bg-white/[0.02] rounded-2xl text-white focus:outline-none focus:border-accent-blue/50 transition-colors">
                <option value="NATIONAL">National</option>
                <option value="INTERNATIONAL">International</option>
                <option value="STATE">By State</option>
                <option value="DISTRICT">By District</option>
              </select>
            </div>
          </div>

          {(geoLevel === "STATE" || geoLevel === "DISTRICT") && (
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-300">State</label>
                <select {...form.register("state")} className="w-full px-4 py-3 border border-white/10 bg-white/[0.02] rounded-2xl text-white focus:outline-none focus:border-accent-blue/50 transition-colors">
                  <option value="">Select State</option>
                  {states.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              {geoLevel === "DISTRICT" && (
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-300">District</label>
                  <select {...form.register("district")} className="w-full px-4 py-3 border border-white/10 bg-white/[0.02] rounded-2xl text-white focus:outline-none focus:border-accent-blue/50 transition-colors" disabled={!selectedState}>
                    <option value="">Select District</option>
                    {districts.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
              )}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-300">Source URL (Optional)</label>
            <input
              {...form.register("source_url")}
              className="w-full px-4 py-3 border border-white/10 bg-white/[0.02] rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:border-accent-blue/50 transition-colors"
              placeholder="Link to original source..."
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-300">Full Article Body</label>
            <div className="border border-white/10 rounded-2xl overflow-hidden">
              <TipTapEditor content={body} onChange={setBody} />
            </div>
          </div>

          <div className="flex items-center justify-between pt-6 border-t border-white/5">
            <div className="flex items-center gap-3">
              <label className="text-sm font-semibold text-gray-300">Status:</label>
              <select {...form.register("status")} className="px-3 py-1.5 border border-white/10 bg-white/[0.02] rounded-xl text-xs font-bold text-white focus:outline-none">
                <option value="PUBLISHED">Published</option>
                <option value="DRAFT">Draft</option>
              </select>
            </div>
            
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-8 py-3 bg-accent-blue hover:bg-accent-blue/90 text-white font-bold rounded-xl transition-colors disabled:opacity-50 shadow-lg shadow-accent-blue/20"
            >
              {isSubmitting ? "Updating..." : "Update Article"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
