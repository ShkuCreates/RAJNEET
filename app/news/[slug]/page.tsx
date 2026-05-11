import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { formatDistanceToNow } from "date-fns";
import { MapPin, Share2, MessageSquare, ArrowLeft } from "lucide-react";
import Link from "next/link";
import DebateSection from "@/components/news/DebateSection";

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const article = await prisma.news.findUnique({
    where: { slug: params.slug }
  });

  if (!article) return {};

  const title = article.seo_title || article.headline;
  const description = article.meta_description || article.summary;
  const url = `https://rajneet.in/news/${article.slug}`;

  return {
    title,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description,
      url,
      siteName: "RAJNEET",
      images: article.cover_image_url ? [{ url: article.cover_image_url }] : [],
      type: "article",
      publishedTime: article.created_at.toISOString(),
      section: article.category,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: article.cover_image_url ? [article.cover_image_url] : [],
    }
  };
}

export default async function ArticlePage({ params }: { params: { slug: string } }) {
  const article = await prisma.news.findUnique({
    where: { slug: params.slug },
    include: {
      author: {
        select: { name: true, avatar_url: true, role: true }
      }
    }
  });

  if (!article) notFound();

  return (
    <main className="min-h-screen bg-[#050A14] text-white">
      {/* Schema Markup */}
      {article.schema_markup && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: article.schema_markup }}
        />
      )}

      <div className="max-w-4xl mx-auto px-6 py-12">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-gray-500 hover:text-white transition-colors mb-8 group">
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          Back to Dashboard
        </Link>

        <article>
          <header className="mb-10">
            <div className="flex items-center gap-3 mb-6">
              <span className="px-3 py-1 bg-accent-blue/10 text-accent-blue text-[10px] font-black rounded-full uppercase tracking-widest border border-accent-blue/20">
                {article.category}
              </span>
              <div className="flex items-center gap-1 text-xs text-gray-500 font-medium">
                <MapPin size={14} />
                {article.state || "National"}
              </div>
              <span className="text-xs text-gray-500">
                {formatDistanceToNow(new Date(article.created_at), { addSuffix: true })}
              </span>
            </div>

            <h1 className="text-4xl md:text-5xl font-heading font-black leading-tight mb-8">
              {article.seo_title || article.headline}
            </h1>

            <div className="flex items-center justify-between py-6 border-y border-white/5">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-accent-blue/10 border border-white/10 overflow-hidden">
                  {article.author?.avatar_url ? (
                    <img src={article.author.avatar_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-accent-blue font-bold">
                      {article.author?.name?.charAt(0) || "A"}
                    </div>
                  )}
                </div>
                <div>
                  <p className="font-bold">{article.author?.name || "RAJNEET Editorial"}</p>
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest font-black">{article.author?.role || "STAFF"}</p>
                </div>
              </div>
              <div className="flex gap-4">
                <button className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl transition-all">
                  <Share2 size={20} className="text-gray-400" />
                </button>
              </div>
            </div>
          </header>

          {article.cover_image_url && (
            <div className="aspect-video rounded-[32px] overflow-hidden mb-12 border border-white/5 shadow-2xl">
              <img src={article.cover_image_url} alt="" className="w-full h-full object-cover" />
            </div>
          )}

          <div className="prose prose-invert max-w-none prose-p:text-gray-300 prose-p:leading-relaxed prose-p:text-xl mb-20">
            <div dangerouslySetInnerHTML={{ __html: article.seo_body || article.body }} />
          </div>

          <section className="pt-20 border-t border-white/5">
            <div className="flex items-center gap-3 mb-10">
              <MessageSquare size={28} className="text-accent-blue" />
              <h2 className="text-3xl font-heading font-black uppercase tracking-tight">Public Debate</h2>
            </div>
            <DebateSection newsId={article.id} currentUser={null} />
          </section>
        </article>
      </div>
    </main>
  );
}
