import { prisma } from "@/lib/prisma";
import ManageNewsClient from "./ManageNewsClient";

export const dynamic = "force-dynamic";

export default async function ManageNewsPage() {
  const news = await prisma.news.findMany({
    orderBy: [
      { is_pinned: "desc" },
      { created_at: "desc" }
    ],
    include: {
      author: { select: { name: true } }
    }
  });

  return (
    <div className="min-h-screen bg-[#050A14] p-8 md:p-16">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h1 className="text-3xl font-heading font-black text-white uppercase tracking-tight">Manage News</h1>
            <p className="text-gray-500 font-medium">Review articles, SEO scores, and publishing status.</p>
          </div>
        </div>

        <ManageNewsClient initialNews={news} />
      </div>
    </div>
  );
}
