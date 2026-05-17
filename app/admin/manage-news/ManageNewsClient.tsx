"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, RefreshCw, ExternalLink, Trash2, Pin, PinOff, Edit, CheckSquare, Square } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

export default function ManageNewsClient({ initialNews }: { initialNews: any[] }) {
  const router = useRouter();
  const [news, setNews] = useState(initialNews);
  const [isRefreshing, setIsRefreshing] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isBulkProcessing, setIsBulkProcessing] = useState(false);

  const filteredNews = news.filter(item => 
    item.headline.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (item.slug && item.slug.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredNews.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredNews.map(n => n.id));
    }
  };

  const getScoreBadge = (score: number) => {
    if (score >= 80) return <span className="px-3 py-1 bg-green-500/10 text-green-500 text-[10px] font-black uppercase rounded-full border border-green-500/20">Strong ({score})</span>;
    if (score >= 60) return <span className="px-3 py-1 bg-accent-amber/10 text-accent-amber text-[10px] font-black uppercase rounded-full border border-accent-amber/20">Good ({score})</span>;
    return <span className="px-3 py-1 bg-red-500/10 text-red-500 text-[10px] font-black uppercase rounded-full border border-red-500/20">Weak ({score})</span>;
  };

  const handleReRunSEO = async (id: string) => {
    try {
      setIsRefreshing(id);
      const res = await fetch(`/api/admin/rerun-seo?id=${id}`);
      const data = await res.json();
      
      if (data.success) {
        toast.success("SEO Optimization updated!");
        setNews(prev => prev.map(n => n.id === id ? { ...n, ...data.article } : n));
      } else {
        throw new Error(data.error);
      }
    } catch (e: any) {
      toast.error("Failed to re-run SEO: " + e.message);
    } finally {
      setIsRefreshing(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this news article?")) return;
    
    try {
      const res = await fetch(`/api/admin/news?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      
      if (data.success) {
        toast.success("News deleted successfully!");
        setNews(prev => prev.filter(n => n.id !== id));
      } else {
        throw new Error(data.error);
      }
    } catch (e: any) {
      toast.error("Failed to delete news: " + e.message);
    }
  };

  const handlePin = async (id: string, isPinned: boolean) => {
    try {
      const res = await fetch(`/api/admin/news`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, is_pinned: !isPinned })
      });
      const data = await res.json();
      
      if (data.success) {
        toast.success(isPinned ? "News unpinned!" : "News pinned!");
        setNews(prev => prev.map(n => n.id === id ? { ...n, is_pinned: !isPinned } : n));
      } else {
        throw new Error(data.error);
      }
    } catch (e: any) {
      toast.error("Failed to update pin status: " + e.message);
    }
  };

  const handleBulkPin = async () => {
    if (selectedIds.length === 0) return;
    if (!confirm(`Pin ${selectedIds.length} selected articles?`)) return;
    
    try {
      setIsBulkProcessing(true);
      await Promise.all(
        selectedIds.map(id => 
          fetch(`/api/admin/news`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id, is_pinned: true })
          })
        )
      );
      
      setNews(prev => prev.map(n => 
        selectedIds.includes(n.id) ? { ...n, is_pinned: true } : n
      ));
      
      toast.success(`Pinned ${selectedIds.length} articles!`);
      setSelectedIds([]);
    } catch (e: any) {
      toast.error("Failed to bulk pin: " + e.message);
    } finally {
      setIsBulkProcessing(false);
    }
  };

  const handleBulkUnpin = async () => {
    if (selectedIds.length === 0) return;
    if (!confirm(`Unpin ${selectedIds.length} selected articles?`)) return;
    
    try {
      setIsBulkProcessing(true);
      await Promise.all(
        selectedIds.map(id => 
          fetch(`/api/admin/news`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id, is_pinned: false })
          })
        )
      );
      
      setNews(prev => prev.map(n => 
        selectedIds.includes(n.id) ? { ...n, is_pinned: false } : n
      ));
      
      toast.success(`Unpinned ${selectedIds.length} articles!`);
      setSelectedIds([]);
    } catch (e: any) {
      toast.error("Failed to bulk unpin: " + e.message);
    } finally {
      setIsBulkProcessing(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!confirm(`Delete ${selectedIds.length} selected articles? This cannot be undone!`)) return;
    
    try {
      setIsBulkProcessing(true);
      await Promise.all(
        selectedIds.map(id => 
          fetch(`/api/admin/news?id=${id}`, { method: "DELETE" })
        )
      );
      
      setNews(prev => prev.filter(n => !selectedIds.includes(n.id)));
      
      toast.success(`Deleted ${selectedIds.length} articles!`);
      setSelectedIds([]);
    } catch (e: any) {
      toast.error("Failed to bulk delete: " + e.message);
    } finally {
      setIsBulkProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
        <input 
          type="text" 
          placeholder="Search articles by headline or keyword..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-[#111827] border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-accent-blue/50 transition-colors"
        />
      </div>

      {selectedIds.length > 0 && (
        <div className="bg-accent-blue/10 border border-accent-blue/20 rounded-2xl p-4 flex items-center justify-between">
          <div className="text-accent-blue font-bold">
            {selectedIds.length} article{selectedIds.length !== 1 ? 's' : ''} selected
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleBulkPin}
              disabled={isBulkProcessing}
              className="px-4 py-2 bg-accent-amber/20 text-accent-amber rounded-xl font-bold text-sm hover:bg-accent-amber/30 transition-colors disabled:opacity-50"
            >
              Bulk Pin
            </button>
            <button
              onClick={handleBulkUnpin}
              disabled={isBulkProcessing}
              className="px-4 py-2 bg-gray-500/20 text-gray-400 rounded-xl font-bold text-sm hover:bg-gray-500/30 transition-colors disabled:opacity-50"
            >
              Bulk Unpin
            </button>
            <button
              onClick={handleBulkDelete}
              disabled={isBulkProcessing}
              className="px-4 py-2 bg-red-500/20 text-red-400 rounded-xl font-bold text-sm hover:bg-red-500/30 transition-colors disabled:opacity-50"
            >
              Bulk Delete
            </button>
            <button
              onClick={() => setSelectedIds([])}
              className="px-4 py-2 bg-white/5 text-gray-400 rounded-xl font-bold text-sm hover:bg-white/10 transition-colors"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      <div className="bg-[#111827] border border-white/5 rounded-[32px] overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-white/[0.02] border-b border-white/5">
            <tr>
              <th className="p-6 w-12">
                <button 
                  onClick={toggleSelectAll}
                  className="text-gray-500 hover:text-white transition-colors"
                >
                  {selectedIds.length === filteredNews.length && filteredNews.length > 0 
                    ? <CheckSquare size={18} /> 
                    : <Square size={18} />}
                </button>
              </th>
              <th className="p-6 text-[10px] font-black text-gray-500 uppercase tracking-widest">Article</th>
              <th className="p-6 text-[10px] font-black text-gray-500 uppercase tracking-widest text-center">SEO Score</th>
              <th className="p-6 text-[10px] font-black text-gray-500 uppercase tracking-widest text-center">Status</th>
              <th className="p-6 text-[10px] font-black text-gray-500 uppercase tracking-widest text-center">Pinned</th>
              <th className="p-6 text-[10px] font-black text-gray-500 uppercase tracking-widest text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filteredNews.map((item) => (
              <tr key={item.id} className={`hover:bg-white/[0.01] transition-colors ${item.is_pinned ? 'bg-accent-amber/5' : ''} ${selectedIds.includes(item.id) ? 'bg-accent-blue/5' : ''}`}>
                <td className="p-6">
                  <button 
                    onClick={() => toggleSelect(item.id)}
                    className="text-gray-500 hover:text-white transition-colors"
                  >
                    {selectedIds.includes(item.id) 
                      ? <CheckSquare size={18} /> 
                      : <Square size={18} />}
                  </button>
                </td>
                <td className="p-6">
                  {item.is_pinned && <span className="inline-flex items-center gap-1 text-accent-amber text-[10px] font-bold mb-1">📌 Pinned</span>}
                  <h4 className="text-sm font-bold text-white mb-1 line-clamp-1">{item.headline}</h4>
                  <p className="text-[10px] text-gray-500 font-mono">{format(new Date(item.created_at), "MMM dd, yyyy HH:mm")}</p>
                </td>
                <td className="p-6 text-center">
                  {getScoreBadge(item.seo_score || 0)}
                </td>
                <td className="p-6 text-center">
                  <span className={`px-2 py-1 rounded text-[9px] font-black uppercase tracking-widest ${
                    item.status === "PUBLISHED" ? "bg-green-500/10 text-green-500" : "bg-gray-500/10 text-gray-500"
                  }`}>
                    {item.status}
                  </span>
                </td>
                <td className="p-6 text-center">
                  <button 
                    onClick={() => handlePin(item.id, item.is_pinned)}
                    className={`p-2 rounded-lg transition-all ${
                      item.is_pinned 
                        ? 'bg-accent-amber/20 text-accent-amber' 
                        : 'hover:bg-white/5 text-gray-500 hover:text-white'
                    }`}
                    title={item.is_pinned ? "Unpin" : "Pin"}
                  >
                    {item.is_pinned ? <Pin size={16} /> : <PinOff size={16} />}
                  </button>
                </td>
                <td className="p-6 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button 
                      onClick={() => handleReRunSEO(item.id)}
                      disabled={isRefreshing === item.id}
                      className="p-2 hover:bg-accent-blue/10 text-gray-500 hover:text-accent-blue rounded-lg transition-all disabled:opacity-50"
                      title="Re-run SEO Optimization"
                    >
                      <RefreshCw size={16} className={isRefreshing === item.id ? "animate-spin" : ""} />
                    </button>
                    <button 
                      onClick={() => router.push(`/admin/edit-news?id=${item.id}`)}
                      className="p-2 hover:bg-accent-amber/10 text-gray-500 hover:text-accent-amber rounded-lg transition-all"
                      title="Edit"
                    >
                      <Edit size={16} />
                    </button>
                    <a 
                      href={`/news/${item.slug}`} 
                      target="_blank" 
                      className="p-2 hover:bg-white/5 text-gray-500 hover:text-white rounded-lg transition-all"
                      title="View Article"
                    >
                      <ExternalLink size={16} />
                    </a>
                    <button 
                      onClick={() => handleDelete(item.id)}
                      className="p-2 hover:bg-red-500/10 text-gray-500 hover:text-red-500 rounded-lg transition-all"
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
