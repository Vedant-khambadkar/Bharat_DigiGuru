import React from "react";
import { X } from "lucide-react";

export interface InquiryItem {
  id: string;
  name?: string;
  fullName?: string;
  email: string;
  phone?: string;
  company?: string;
  budget?: string;
  timeline?: string;
  services?: string[] | string;
  message?: string;
  status: "NEW" | "CONTACTED" | "ARCHIVED" | string;
  createdAt?: string;
}

interface InquiryDetailModalProps {
  inquiry: InquiryItem | null;
  onClose: () => void;
  onUpdateStatus: (id: string, status: "NEW" | "CONTACTED" | "ARCHIVED") => void;
}

export const InquiryDetailModal: React.FC<InquiryDetailModalProps> = ({
  inquiry,
  onClose,
  onUpdateStatus,
}) => {
  if (!inquiry) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-[#11131b] border border-white/15 rounded-2xl sm:rounded-3xl p-4 sm:p-7 shadow-2xl flex flex-col gap-3.5 max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
          <div>
            <h3 className="font-['Syne',sans-serif] font-bold text-base sm:text-xl text-white">
              Client Inquiry
            </h3>
            <p className="font-mono text-[10px] text-neutral-400">
              Submitted via Web Contact Form
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs font-mono">
          <div className="p-2.5 rounded-xl bg-black/40 border border-white/5">
            <span className="text-neutral-500 block text-[9px] mb-0.5">CLIENT NAME</span>
            <span className="text-white font-bold text-xs sm:text-sm truncate block">
              {inquiry.name || inquiry.fullName}
            </span>
          </div>
          <div className="p-2.5 rounded-xl bg-black/40 border border-white/5">
            <span className="text-neutral-500 block text-[9px] mb-0.5">EMAIL</span>
            <a
              href={`mailto:${inquiry.email}`}
              className="text-blue-400 hover:underline font-bold text-xs sm:text-sm truncate block"
            >
              {inquiry.email}
            </a>
          </div>
          <div className="p-2.5 rounded-xl bg-black/40 border border-white/5">
            <span className="text-neutral-500 block text-[9px] mb-0.5">PHONE</span>
            <a
              href={`tel:${inquiry.phone}`}
              className="text-white hover:text-emerald-400 text-xs truncate block"
            >
              {inquiry.phone || "Not Provided"}
            </a>
          </div>
          <div className="p-2.5 rounded-xl bg-black/40 border border-white/5">
            <span className="text-neutral-500 block text-[9px] mb-0.5">COMPANY</span>
            <span className="text-white text-xs truncate block">
              {inquiry.company || "Not Specified"}
            </span>
          </div>
          <div className="p-2.5 rounded-xl bg-black/40 border border-white/5">
            <span className="text-neutral-500 block text-[9px] mb-0.5">BUDGET</span>
            <span className="text-emerald-400 font-bold text-xs">
              {inquiry.budget || "Custom"}
            </span>
          </div>
          <div className="p-2.5 rounded-xl bg-black/40 border border-white/5">
            <span className="text-neutral-500 block text-[9px] mb-0.5">TIMELINE</span>
            <span className="text-purple-400 text-xs">
              {inquiry.timeline || "Flexible"}
            </span>
          </div>
        </div>

        {inquiry.services &&
          (Array.isArray(inquiry.services) ? inquiry.services.length > 0 : Boolean(inquiry.services)) && (
            <div className="flex flex-col gap-1 text-xs font-mono">
              <span className="text-neutral-500 text-[10px]">REQUESTED SERVICES</span>
              <div className="flex flex-wrap gap-1">
                {(Array.isArray(inquiry.services)
                  ? inquiry.services
                  : [inquiry.services]
                ).map((s: string, idx: number) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 rounded-lg bg-white/10 text-white border border-white/10 text-[10px]"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}

        <div className="flex flex-col gap-1 text-xs">
          <span className="font-mono text-neutral-500 text-[10px]">MESSAGE</span>
          <div className="p-3 rounded-xl bg-black/50 border border-white/10 text-neutral-200 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap max-h-36 overflow-y-auto">
            {inquiry.message}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pt-2.5 border-t border-white/10">
          <div className="grid grid-cols-3 sm:flex items-center gap-1.5">
            <button
              onClick={() => onUpdateStatus(inquiry.id, "NEW")}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-mono cursor-pointer text-center ${
                inquiry.status === "NEW"
                  ? "bg-amber-500 text-black font-bold"
                  : "bg-white/5 text-neutral-400 hover:text-white"
              }`}
            >
              NEW
            </button>
            <button
              onClick={() => onUpdateStatus(inquiry.id, "CONTACTED")}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-mono cursor-pointer text-center ${
                inquiry.status === "CONTACTED"
                  ? "bg-emerald-500 text-black font-bold"
                  : "bg-white/5 text-neutral-400 hover:text-white"
              }`}
            >
              CONTACTED
            </button>
            <button
              onClick={() => onUpdateStatus(inquiry.id, "ARCHIVED")}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-mono cursor-pointer text-center ${
                inquiry.status === "ARCHIVED"
                  ? "bg-neutral-500 text-white font-bold"
                  : "bg-white/5 text-neutral-400 hover:text-white"
              }`}
            >
              ARCHIVED
            </button>
          </div>

          <button
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2 rounded-xl bg-white text-black font-mono text-xs font-bold cursor-pointer"
          >
            CLOSE
          </button>
        </div>
      </div>
    </div>
  );
};
