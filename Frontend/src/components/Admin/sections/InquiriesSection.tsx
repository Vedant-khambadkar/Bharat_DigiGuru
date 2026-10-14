import React from "react";
import {
  Search,
  RefreshCw,
  Mail,
  Phone,
  Eye,
  Check,
  Archive,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface InquiriesSectionProps {
  inquiriesList: any[];
  inquiriesTotal: number;
  inquiriesPage: number;
  inquiriesTotalPages: number;
  inquiriesLimit: number;
  inquiriesSearch: string;
  inquiriesStatusFilter: string;
  inquiriesLoading: boolean;
  setInquiriesSearch: (val: string) => void;
  setInquiriesStatusFilter: (val: string) => void;
  setInquiriesLimit: (val: number) => void;
  onFetchInquiries: (page?: number, limit?: number, search?: string, status?: string, forceRefresh?: boolean) => void;
  onViewInquiry: (inquiry: any) => void;
  onUpdateInquiryStatus: (id: string, status: "NEW" | "CONTACTED" | "ARCHIVED") => void;
  onDeleteInquiry: (id: string) => void;
}

export const InquiriesSection: React.FC<InquiriesSectionProps> = ({
  inquiriesList,
  inquiriesTotal,
  inquiriesPage,
  inquiriesTotalPages,
  inquiriesLimit,
  inquiriesSearch,
  inquiriesStatusFilter,
  inquiriesLoading,
  setInquiriesSearch,
  setInquiriesStatusFilter,
  setInquiriesLimit,
  onFetchInquiries,
  onViewInquiry,
  onUpdateInquiryStatus,
  onDeleteInquiry,
}) => {
  return (
    <div className="flex flex-col gap-3.5 sm:gap-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <div>
          <h2 className="font-['Syne',sans-serif] font-bold text-base sm:text-xl text-white">
            Inquiries ({inquiriesTotal})
          </h2>
        </div>
      </div>

      {/* Status Filter Pills & Search */}
      <div className="p-3 sm:p-4 rounded-2xl bg-[#12141c] border border-white/10 flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center justify-between shadow-xl">
        <div className="grid grid-cols-4 sm:flex items-center gap-1 sm:gap-1.5">
          {(["ALL", "NEW", "CONTACTED", "ARCHIVED"] as const).map((st) => (
            <button
              key={st}
              onClick={() => {
                setInquiriesStatusFilter(st);
                onFetchInquiries(1, inquiriesLimit, inquiriesSearch, st, true);
              }}
              className={`px-2 sm:px-3 py-1.5 rounded-xl text-[10px] sm:text-xs font-mono transition-all cursor-pointer text-center truncate ${
                inquiriesStatusFilter === st
                  ? "bg-[#ff3b30] text-white font-bold shadow-[0_0_10px_rgba(255,59,48,0.3)]"
                  : "bg-black/40 text-neutral-400 hover:text-white border border-white/5"
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search inquiries..."
              value={inquiriesSearch}
              onChange={(e) => {
                setInquiriesSearch(e.target.value);
                onFetchInquiries(1, inquiriesLimit, e.target.value, inquiriesStatusFilter, true);
              }}
              className="w-full bg-black/40 border border-white/10 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500 transition-colors"
            />
          </div>

          <div className="flex items-center gap-1 bg-black/40 border border-white/10 rounded-xl px-2 py-1 text-xs font-mono text-neutral-400 shrink-0">
            <span>Limit:</span>
            <select
              value={inquiriesLimit}
              onChange={(e) => {
                const newLimit = Number(e.target.value);
                setInquiriesLimit(newLimit);
                onFetchInquiries(1, newLimit, inquiriesSearch, inquiriesStatusFilter, true);
              }}
              className="bg-transparent text-xs font-mono text-white focus:outline-none cursor-pointer"
            >
              <option value="6" className="bg-[#12141c]">6</option>
              <option value="12" className="bg-[#12141c]">12</option>
              <option value="24" className="bg-[#12141c]">24</option>
            </select>
          </div>
        </div>
      </div>

      {/* Cards List */}
      {inquiriesLoading ? (
        <div className="py-16 text-center text-neutral-500 font-mono text-xs flex flex-col items-center gap-2">
          <RefreshCw className="w-5 h-5 animate-spin text-amber-400" />
          <span>Loading inquiries...</span>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {inquiriesList.map((inq) => (
            <div
              key={inq.id || inq._id}
              className="p-3.5 sm:p-5 rounded-2xl bg-[#12141c] border border-white/10 hover:border-white/20 flex flex-col gap-2.5 sm:gap-3 transition-all shadow-md"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex flex-col gap-0.5 min-w-0">
                  <span className="font-bold text-white text-sm sm:text-base truncate">
                    {inq.name || inq.fullName}
                  </span>
                  <div className="flex items-center gap-2 flex-wrap">
                    <a
                      href={`mailto:${inq.email}`}
                      className="font-mono text-xs text-neutral-400 hover:text-blue-400 flex items-center gap-1 truncate"
                    >
                      <Mail size={11} /> {inq.email}
                    </a>
                    {inq.phone && inq.phone !== "Not Provided" && (
                      <a
                        href={`tel:${inq.phone}`}
                        className="font-mono text-xs text-neutral-400 hover:text-emerald-400 flex items-center gap-1"
                      >
                        <Phone size={11} /> {inq.phone}
                      </a>
                    )}
                  </div>
                </div>

                <span
                  className={`px-2 py-0.5 rounded text-[9px] sm:text-[10px] font-mono font-bold uppercase shrink-0 ${
                    inq.status === "NEW"
                      ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                      : inq.status === "CONTACTED"
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                      : "bg-neutral-500/20 text-neutral-400 border border-white/10"
                  }`}
                >
                  {inq.status}
                </span>
              </div>

              <div className="text-xs sm:text-sm text-neutral-300 p-2.5 sm:p-3 rounded-xl bg-black/40 border border-white/5 leading-relaxed">
                "{inq.message}"
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono text-neutral-400 pt-2 border-t border-white/5">
                <div className="flex items-center gap-2.5 flex-wrap text-[11px]">
                  {inq.company && (
                    <div>Company: <span className="text-white">{inq.company}</span></div>
                  )}
                  {inq.budget && (
                    <div>Budget: <span className="text-emerald-400">{inq.budget}</span></div>
                  )}
                </div>

                <div className="flex items-center gap-1.5 flex-wrap">
                  <button
                    onClick={() => onViewInquiry(inq)}
                    className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-300 text-xs font-mono flex items-center gap-1 cursor-pointer active:scale-95"
                  >
                    <Eye size={12} />
                    <span>DETAILS</span>
                  </button>

                  {inq.status === "NEW" && (
                    <button
                      onClick={() => onUpdateInquiryStatus(inq.id || inq._id, "CONTACTED")}
                      className="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-xs font-mono flex items-center gap-1 cursor-pointer transition-colors active:scale-95"
                    >
                      <Check size={12} />
                      <span>CONTACTED</span>
                    </button>
                  )}

                  {inq.status !== "ARCHIVED" && (
                    <button
                      onClick={() => onUpdateInquiryStatus(inq.id || inq._id, "ARCHIVED")}
                      className="px-2 py-1 rounded-lg bg-neutral-500/10 hover:bg-neutral-500/20 text-neutral-400 text-xs font-mono flex items-center gap-1 cursor-pointer transition-colors active:scale-95"
                    >
                      <Archive size={12} />
                    </button>
                  )}

                  <button
                    onClick={() => onDeleteInquiry(inq.id || inq._id)}
                    className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors cursor-pointer active:scale-95"
                    title="Delete"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {inquiriesList.length === 0 && (
            <div className="py-16 text-center text-xs font-mono text-neutral-500 bg-[#12141c] rounded-2xl border border-white/10">
              No client inquiries match the current filter.
            </div>
          )}
        </div>
      )}

      {/* Pagination Footer */}
      <div className="p-3 sm:p-4 rounded-2xl bg-[#12141c] border border-white/10 flex items-center justify-between gap-2 text-xs font-mono shadow-xl">
        <span className="text-neutral-400 text-xs">
          Page <span className="text-white font-bold">{inquiriesPage}</span> /{" "}
          <span className="text-white font-bold">{inquiriesTotalPages}</span>
        </span>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onFetchInquiries(inquiriesPage - 1)}
            disabled={inquiriesPage <= 1 || inquiriesLoading}
            className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 disabled:opacity-30 text-white flex items-center gap-1 cursor-pointer active:scale-95"
          >
            <ChevronLeft size={13} />
            <span className="hidden sm:inline">PREV</span>
          </button>

          <div className="flex items-center gap-1">
            {Array.from({ length: inquiriesTotalPages }, (_, i) => i + 1).map((num) => (
              <button
                key={num}
                onClick={() => onFetchInquiries(num)}
                className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl font-mono text-xs transition-all cursor-pointer ${
                  inquiriesPage === num
                    ? "bg-[#ff3b30] text-white font-bold shadow-[0_0_10px_rgba(255,59,48,0.4)]"
                    : "bg-white/5 text-neutral-400 hover:text-white hover:bg-white/10"
                }`}
              >
                {num}
              </button>
            ))}
          </div>

          <button
            onClick={() => onFetchInquiries(inquiriesPage + 1)}
            disabled={inquiriesPage >= inquiriesTotalPages || inquiriesLoading}
            className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 disabled:opacity-30 text-white flex items-center gap-1 cursor-pointer active:scale-95"
          >
            <span className="hidden sm:inline">NEXT</span>
            <ChevronRight size={13} />
          </button>
        </div>
      </div>
    </div>
  );
};
