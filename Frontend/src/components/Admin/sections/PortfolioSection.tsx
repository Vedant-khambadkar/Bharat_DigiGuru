import React from "react";
import {
  Plus,
  Search,
  Filter,
  RefreshCw,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import CachedImage from "../../CachedImage";

interface PortfolioSectionProps {
  portfolioItems: any[];
  portfolioTotal: number;
  portfolioPage: number;
  portfolioTotalPages: number;
  portfolioLimit: number;
  portfolioSearch: string;
  portfolioCategory: string;
  portfolioLoading: boolean;
  setPortfolioSearch: (val: string) => void;
  setPortfolioCategory: (val: string) => void;
  setPortfolioLimit: (val: number) => void;
  onFetchPortfolio: (page?: number, limit?: number, search?: string, category?: string) => void;
  onOpenCreate: () => void;
  onOpenEdit: (item: any) => void;
  onDeleteItem: (id: string | number) => void;
}

export const PortfolioSection: React.FC<PortfolioSectionProps> = ({
  portfolioItems,
  portfolioTotal,
  portfolioPage,
  portfolioTotalPages,
  portfolioLimit,
  portfolioSearch,
  portfolioCategory,
  portfolioLoading,
  setPortfolioSearch,
  setPortfolioCategory,
  setPortfolioLimit,
  onFetchPortfolio,
  onOpenCreate,
  onOpenEdit,
  onDeleteItem,
}) => {
  return (
    <div className="flex flex-col gap-3.5 sm:gap-6 animate-in fade-in duration-200">
      {/* Top Controls */}
      <div className="flex items-center justify-between gap-2">
        <div>
          <h2 className="font-['Syne',sans-serif] font-bold text-base sm:text-xl text-white">
            Portfolio ({portfolioTotal})
          </h2>
        </div>
        <button
          onClick={onOpenCreate}
          className="px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-white hover:bg-neutral-200 text-black font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-lg shrink-0 active:scale-95 transition-all"
        >
          <Plus size={14} />
          <span>ADD</span>
        </button>
      </div>

      {/* Filters & Search Toolbar - Mobile Optimized */}
      <div className="p-3 sm:p-4 rounded-2xl bg-[#12141c] border border-white/10 flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center justify-between shadow-xl">
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search projects..."
            value={portfolioSearch}
            onChange={(e) => {
              setPortfolioSearch(e.target.value);
              onFetchPortfolio(1, portfolioLimit, e.target.value, portfolioCategory);
            }}
            className="w-full bg-black/40 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>

        <div className="grid grid-cols-2 sm:flex items-center gap-2">
          <div className="flex items-center gap-1 bg-black/40 border border-white/10 rounded-xl px-2.5 py-1.5 min-w-0">
            <Filter className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
            <select
              value={portfolioCategory}
              onChange={(e) => {
                setPortfolioCategory(e.target.value);
                onFetchPortfolio(1, portfolioLimit, portfolioSearch, e.target.value);
              }}
              className="w-full bg-transparent text-xs font-mono text-neutral-300 focus:outline-none cursor-pointer truncate"
            >
              <option value="All" className="bg-[#12141c]">All Categories</option>
              <option value="AI & Automation" className="bg-[#12141c]">AI & Automation</option>
              <option value="Branding & Web" className="bg-[#12141c]">Branding & Web</option>
              <option value="Social & Campaign" className="bg-[#12141c]">Social & Campaign</option>
              <option value="Enterprise Portal" className="bg-[#12141c]">Enterprise Portal</option>
            </select>
          </div>

          <div className="flex items-center justify-between gap-1 bg-black/40 border border-white/10 rounded-xl px-2.5 py-1.5 text-xs font-mono text-neutral-400">
            <span>Limit:</span>
            <select
              value={portfolioLimit}
              onChange={(e) => {
                const newLimit = Number(e.target.value);
                setPortfolioLimit(newLimit);
                onFetchPortfolio(1, newLimit, portfolioSearch, portfolioCategory);
              }}
              className="bg-transparent text-xs font-mono text-white focus:outline-none cursor-pointer"
            >
              <option value="4" className="bg-[#12141c]">4</option>
              <option value="6" className="bg-[#12141c]">6</option>
              <option value="12" className="bg-[#12141c]">12</option>
            </select>
          </div>
        </div>
      </div>

      {/* Items Grid */}
      {portfolioLoading ? (
        <div className="py-16 text-center text-neutral-500 font-mono text-xs flex flex-col items-center gap-2">
          <RefreshCw className="w-5 h-5 animate-spin text-blue-400" />
          <span>Loading portfolio...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {portfolioItems.map((p) => (
            <div
              key={p.id}
              className="p-3.5 sm:p-5 rounded-2xl bg-[#12141c] border border-white/10 hover:border-white/20 flex flex-col justify-between gap-3 transition-all group"
            >
              <div className="flex flex-col gap-2">
                {p.image && (
                  <div className="w-full h-36 sm:h-40 rounded-xl overflow-hidden bg-black/40 relative">
                    <CachedImage
                      src={p.image}
                      alt={p.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/75 backdrop-blur-md text-[10px] font-mono text-blue-400 border border-white/10">
                      {p.category || "General"}
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs text-blue-400 truncate">
                    {p.client} // {p.year}
                  </span>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => onOpenEdit(p)}
                      className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white transition-colors cursor-pointer active:scale-95"
                      title="Edit"
                    >
                      <Edit2 size={13} />
                    </button>
                    <button
                      onClick={() => onDeleteItem(p.id)}
                      className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors cursor-pointer active:scale-95"
                      title="Delete"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                <h3 className="font-['Syne',sans-serif] font-bold text-sm sm:text-base text-white line-clamp-1">
                  {p.title}
                </h3>
                <p className="font-mono text-xs text-neutral-400">{p.subtitle}</p>
                <p className="text-xs text-neutral-400 line-clamp-2">{p.description}</p>
              </div>

              {p.tags && p.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 pt-2 border-t border-white/5">
                  {p.tags.slice(0, 3).map((tag: string, idx: number) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded-md bg-white/5 text-[10px] font-mono text-neutral-400"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}

          {portfolioItems.length === 0 && (
            <div className="col-span-full py-16 text-center text-xs font-mono text-neutral-500">
              No portfolio projects match your filters.
            </div>
          )}
        </div>
      )}

      {/* Server-Side Pagination Footer - Responsive */}
      <div className="p-3 sm:p-4 rounded-2xl bg-[#12141c] border border-white/10 flex items-center justify-between gap-2 text-xs font-mono shadow-xl">
        <span className="text-neutral-400 text-xs">
          Page <span className="text-white font-bold">{portfolioPage}</span> /{" "}
          <span className="text-white font-bold">{portfolioTotalPages}</span>
        </span>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onFetchPortfolio(portfolioPage - 1, portfolioLimit, portfolioSearch, portfolioCategory)}
            disabled={portfolioPage <= 1 || portfolioLoading}
            className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 disabled:opacity-30 text-white flex items-center gap-1 cursor-pointer active:scale-95"
          >
            <ChevronLeft size={13} />
            <span className="hidden sm:inline">PREV</span>
          </button>

          <div className="flex items-center gap-1">
            {Array.from({ length: portfolioTotalPages }, (_, i) => i + 1).map((num) => (
              <button
                key={num}
                onClick={() => onFetchPortfolio(num, portfolioLimit, portfolioSearch, portfolioCategory)}
                className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl font-mono text-xs transition-all cursor-pointer ${
                  portfolioPage === num
                    ? "bg-[#ff3b30] text-white font-bold shadow-[0_0_10px_rgba(255,59,48,0.4)]"
                    : "bg-white/5 text-neutral-400 hover:text-white hover:bg-white/10"
                }`}
              >
                {num}
              </button>
            ))}
          </div>

          <button
            onClick={() => onFetchPortfolio(portfolioPage + 1, portfolioLimit, portfolioSearch, portfolioCategory)}
            disabled={portfolioPage >= portfolioTotalPages || portfolioLoading}
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
