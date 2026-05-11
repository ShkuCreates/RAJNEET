"use client";

import { useState } from "react";
import { X, Upload } from "lucide-react";

interface SubmitArticleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (articleData: any) => Promise<void>;
}

export function SubmitArticleModal({ isOpen, onClose, onSubmit }: SubmitArticleModalProps) {
  const [title, setTitle] = useState("");
  const [tags, setTags] = useState("");
  const [body, setBody] = useState("");
  const [sources, setSources] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const wordCount = body.split(/\s+/).filter((w) => w.length > 0).length;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const tagsArray = tags.split(",").map((t) => t.trim()).filter((t) => t.length > 0);
      const sourcesArray = sources.split("\n").map((s) => s.trim()).filter((s) => s.length > 0);

      await onSubmit({
        title,
        body,
        tags: tagsArray,
        source_urls: sourcesArray,
      });

      setTitle("");
      setTags("");
      setBody("");
      setSources("");
      onClose();
    } catch (error) {
      console.error("Error submitting article:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[150] bg-black/80 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-[#111827] rounded-2xl border border-white/10 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-[#111827] border-b border-white/10 p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">Submit Article</h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-white">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-semibold text-white mb-2">Article Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="Enter your article title"
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-accent-blue/50"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-semibold text-white mb-2">Tags (comma-separated, max 5) *</label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              required
              placeholder="politics, economy, education"
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-accent-blue/50"
            />
            <p className="text-[10px] text-gray-500 mt-1">Separate tags with commas (e.g., politics, economy, education)</p>
          </div>

          {/* Cover Image */}
          <div>
            <label className="block text-sm font-semibold text-white mb-2">Cover Image (optional)</label>
            <div className="border-2 border-dashed border-white/20 rounded-xl p-8 text-center hover:border-accent-blue/50 transition-colors">
              <Upload className="mx-auto text-gray-500 mb-2" size={32} />
              <p className="text-sm text-gray-400">Click to upload or drag and drop</p>
              <p className="text-[10px] text-gray-600 mt-1">PNG, JPG up to 5MB</p>
            </div>
          </div>

          {/* Body */}
          <div>
            <label className="block text-sm font-semibold text-white mb-2">Article Body * (min 800 words)</label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              required
              rows={15}
              placeholder="Write your article here..."
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-accent-blue/50 font-mono text-sm"
            />
            <div className="flex items-center justify-between mt-2">
              <p className="text-[10px] text-gray-500">Word count: {wordCount} / 800</p>
              {wordCount < 800 && <p className="text-[10px] text-red-500">Minimum 800 words required</p>}
            </div>
          </div>

          {/* Sources */}
          <div>
            <label className="block text-sm font-semibold text-white mb-2">Sources (at least one URL required) *</label>
            <textarea
              value={sources}
              onChange={(e) => setSources(e.target.value)}
              required
              rows={3}
              placeholder="Enter source URLs (one per line)&#10;https://example.com/source1&#10;https://example.com/source2"
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-accent-blue/50 font-mono text-sm"
            />
            <p className="text-[10px] text-gray-500 mt-1">Enter one URL per line</p>
          </div>

          {/* Submit Button */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-white/5 text-white font-semibold rounded-xl hover:bg-white/10 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || wordCount < 800}
              className="flex-1 px-6 py-3 bg-accent-blue text-white font-semibold rounded-xl hover:bg-accent-blue/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Submitting..." : "Submit for Review"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
