import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function MyArticlesPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  const articles = await prisma.article.findMany({
    where: { author_id: session.user.id },
    orderBy: { created_at: "desc" },
  });

  return (
    <div className="min-h-screen bg-[#050A14] py-12 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">My Articles</h1>
          <p className="text-gray-400">Manage and track your submitted articles</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="p-6 bg-white/[0.03] border border-white/10 rounded-xl">
            <p className="text-gray-400 text-sm mb-1">Total Articles</p>
            <p className="text-3xl font-bold text-white">{articles.length}</p>
          </div>
          <div className="p-6 bg-white/[0.03] border border-white/10 rounded-xl">
            <p className="text-gray-400 text-sm mb-1">Total Views</p>
            <p className="text-3xl font-bold text-white">
              {articles.reduce((sum, a) => sum + a.view_count, 0).toLocaleString()}
            </p>
          </div>
          <div className="p-6 bg-white/[0.03] border border-white/10 rounded-xl">
            <p className="text-gray-400 text-sm mb-1">Total Upvotes</p>
            <p className="text-3xl font-bold text-white">
              {articles.reduce((sum, a) => sum + a.upvote_count, 0).toLocaleString()}
            </p>
          </div>
          <div className="p-6 bg-accent-amber/5 border border-accent-amber/10 rounded-xl">
            <p className="text-accent-amber text-sm mb-1">Estimated Earnings</p>
            <p className="text-3xl font-bold text-accent-amber">₹0</p>
          </div>
        </div>

        {/* Articles Table */}
        <div className="bg-white/[0.03] border border-white/10 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead className="bg-white/[0.05]">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">Title</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">Status</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">Views</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">Upvotes</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">Date</th>
              </tr>
            </thead>
            <tbody>
              {articles.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    No articles submitted yet
                  </td>
                </tr>
              ) : (
                articles.map((article) => (
                  <tr key={article.id} className="border-t border-white/5 hover:bg-white/[0.02]">
                    <td className="px-6 py-4">
                      <a
                        href={`/articles/${article.slug || article.id}`}
                        className="text-white font-semibold hover:text-accent-blue transition-colors"
                      >
                        {article.title}
                      </a>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        article.status === "approved"
                          ? "bg-green-500/20 text-green-500"
                          : article.status === "pending_review"
                          ? "bg-yellow-500/20 text-yellow-500"
                          : article.status === "rejected"
                          ? "bg-red-500/20 text-red-500"
                          : "bg-gray-500/20 text-gray-400"
                      }`}>
                        {article.status === "pending_review" && "Pending"}
                        {article.status === "approved" && "Published"}
                        {article.status === "rejected" && "Rejected"}
                      </span>
                      {article.is_featured && (
                        <span className="ml-2 px-2 py-1 rounded-full text-[10px] font-bold bg-accent-amber/20 text-accent-amber">
                          Featured
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-gray-400">{article.view_count.toLocaleString()}</td>
                    <td className="px-6 py-4 text-gray-400">{article.upvote_count.toLocaleString()}</td>
                    <td className="px-6 py-4 text-gray-400">
                      {new Date(article.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
