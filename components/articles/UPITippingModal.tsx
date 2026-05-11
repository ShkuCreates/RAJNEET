"use client";

import { useState } from "react";
import { X, QrCode, Copy, Check } from "lucide-react";
import { toast } from "sonner";

interface UPITippingModalProps {
  isOpen: boolean;
  onClose: () => void;
  upiId: string;
  authorUsername: string;
}

export function UPITippingModal({ isOpen, onClose, upiId, authorUsername }: UPITippingModalProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyUPI = () => {
    navigator.clipboard.writeText(upiId);
    setCopied(true);
    toast.success("UPI ID copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[150] bg-black/80 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="relative w-full max-w-md bg-[#111827] rounded-2xl border border-white/10 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-[#111827] border-b border-white/10 p-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">Support {authorUsername}</h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="text-center">
            <p className="text-gray-400 text-sm mb-2">Scan QR code or copy UPI ID to send a tip</p>
            <div className="w-48 h-48 mx-auto bg-white rounded-xl flex items-center justify-center">
              <QrCode size={160} className="text-black" />
            </div>
            <p className="text-gray-500 text-xs mt-2">QR Code for UPI payment</p>
          </div>

          <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
            <p className="text-gray-400 text-sm mb-2">UPI ID</p>
            <div className="flex items-center gap-2">
              <code className="flex-1 text-white font-mono text-sm bg-black/30 px-3 py-2 rounded-lg">
                {upiId}
              </code>
              <button
                onClick={handleCopyUPI}
                className="p-2 bg-accent-blue hover:bg-accent-blue/90 text-white rounded-lg transition-colors"
              >
                {copied ? <Check size={18} /> : <Copy size={18} />}
              </button>
            </div>
          </div>

          <div className="p-4 bg-accent-amber/5 border border-accent-amber/10 rounded-xl">
            <p className="text-[10px] text-accent-amber font-semibold text-center">
              This is a peer-to-peer UPI payment. No fees charged by RAJNEET.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
