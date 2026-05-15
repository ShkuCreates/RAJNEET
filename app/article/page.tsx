"use client";

import ArticleFeed from "@/components/articles/ArticleFeed";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

export default function ArticlePage() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [articles, setArticles] = useState<any[]>([]);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const res = await fetch("/api/articles");
        if (res.ok) {
          const data = await res.json();
          setArticles(data.articles || []);
        }
      } catch (e) {
        console.error("Failed to fetch articles:", e);
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, []);

  return (
    <div className="mx-auto w-full max-w-[1400px] px-6 py-8">
      {loading ? (
        <div className="flex min-h-[320px] items-center justify-center rounded-[32px] border border-white/10 bg-[#111827]">
          <div className="flex items-center gap-3 text-sm text-gray-400">
            <Loader2 size={18} className="animate-spin" />
            Loading articles...
          </div>
        </div>
      ) : (
        <ArticleFeed initialArticles={articles} currentUser={session?.user} />
      )}
    </div>
  );
}
