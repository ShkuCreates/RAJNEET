"use client";

import { X, Copy, Twitter, MessageCircle, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { toast } from "sonner";

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  url: string;
  title: string;
}

export function ShareModal({ isOpen, onClose, url, title }: ShareModalProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    toast.success("Link copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const shareOptions = [
    { 
      name: "WhatsApp", 
      icon: <MessageCircle size={24} className="text-green-500" />, 
      color: "bg-green-500/10",
      action: () => window.open(`https://wa.me/?text=${encodeURIComponent(title + " " + url)}`)
    },
    { 
      name: "Twitter", 
      icon: <Twitter size={24} className="text-blue-400" />, 
      color: "bg-blue-400/10",
      action: () => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`)
    },
    { 
      name: "Copy Link", 
      icon: copied ? <Check size={24} className="text-accent-blue" /> : <Copy size={24} className="text-accent-blue" />, 
      color: "bg-accent-blue/10",
      action: handleCopy
    }
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-sm bg-[#0D1B3E] border border-white/10 rounded-[32px] shadow-2xl p-8"
          >
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-xl font-heading font-black text-white uppercase tracking-tight">Share Article</h3>
              <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full text-gray-500">
                <X size={20} />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-4">
              {shareOptions.map((opt) => (
                <button
                  key={opt.name}
                  onClick={opt.action}
                  className="flex flex-col items-center gap-3 group"
                >
                  <div className={`w-16 h-16 ${opt.color} rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 group-active:scale-95`}>
                    {opt.icon}
                  </div>
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest group-hover:text-white transition-colors">{opt.name}</span>
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
