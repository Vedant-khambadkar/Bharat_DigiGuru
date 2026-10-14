import React from "react";
import {
  Layers,
  Plus,
  RefreshCw,
  Search,
  Edit2,
  Trash2,
  Play,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import CachedImage from "../../CachedImage";

interface ServicesSectionProps {
  servicesItems: any[];
  servicesTotal: number;
  servicesPage: number;
  servicesTotalPages: number;
  servicesLimit: number;
  servicesSearch: string;
  servicesLoading: boolean;
  setServicesSearch: (val: string) => void;
  setServicesLimit: (val: number) => void;
  onFetchServices: (page?: number, limit?: number, search?: string, forceRefresh?: boolean) => void;
  onOpenCreate: () => void;
  onOpenEdit: (item: any) => void;
  onDeleteItem: (id: string | number, title?: string) => void;
}

export const ServicesSection: React.FC<ServicesSectionProps> = ({
  servicesItems,
  servicesTotal,
  servicesPage,
  servicesTotalPages,
  servicesLimit,
  servicesSearch,
  servicesLoading,
  setServicesSearch,
  setServicesLimit,
  onFetchServices,
  onOpenCreate,
  onOpenEdit,
  onDeleteItem,
}) => {
  return (
    <div className="flex flex-col gap-3.5 sm:gap-6 animate-in fade-in duration-200">
      {/* Top Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 bg-[#11131b]/80 backdrop-blur-md p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-white/10 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1.5">
              <Layers size={12} /> Capabilities & Deliverables
            </span>
          </div>
          <h2 className="font-['Syne',sans-serif] font-bold text-xl sm:text-2xl text-white">
            Services Management ({servicesTotal})
          </h2>
          <p className="font-mono text-xs text-neutral-400 mt-0.5">
            Configure service offerings, deliverables, timelines, and interactive showcase works.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => onFetchServices(servicesPage, servicesLimit, servicesSearch, true)}
            disabled={servicesLoading}
            className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-neutral-300 hover:text-white transition-colors cursor-pointer"
            title="Refresh services list"
          >
            <RefreshCw size={15} className={servicesLoading ? "animate-spin text-[#ff3b30]" : ""} />
          </button>

          <button
            onClick={onOpenCreate}
            className="px-4 py-2.5 rounded-xl bg-[#ff3b30] hover:bg-[#ff3b30]/90 text-white font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-[0_0_20px_rgba(255,59,48,0.35)] transition-all cursor-pointer active:scale-95"
          >
            <Plus size={15} />
            <span>Add Service</span>
          </button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 p-3 sm:p-4 rounded-2xl bg-[#12141c] border border-white/10 shadow-xl">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            value={servicesSearch}
            onChange={(e) => {
              setServicesSearch(e.target.value);
              onFetchServices(1, servicesLimit, e.target.value);
            }}
            placeholder="Search by title, number, tag, or deliverables..."
            className="w-full bg-[#181a24] border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs font-mono text-white placeholder:text-neutral-500 focus:outline-none focus:border-[#ff3b30] transition-colors"
          />
        </div>

        <div className="flex items-center gap-2 justify-between sm:justify-end">
          <span className="text-[10px] font-mono text-neutral-400">Page size:</span>
          <select
            value={servicesLimit}
            onChange={(e) => {
              const newLim = Number(e.target.value);
              setServicesLimit(newLim);
              onFetchServices(1, newLim, servicesSearch);
            }}
            className="bg-[#181a24] border border-white/10 rounded-xl px-2.5 py-1.5 text-xs font-mono text-white focus:outline-none cursor-pointer"
          >
            <option value="4">4</option>
            <option value="6">6</option>
            <option value="12">12</option>
          </select>
        </div>
      </div>

      {/* Services Cards Grid */}
      {servicesLoading && servicesItems.length === 0 ? (
        <div className="py-16 text-center text-neutral-500 font-mono text-xs flex flex-col items-center gap-2">
          <RefreshCw className="w-5 h-5 animate-spin text-[#ff3b30]" />
          <span>Loading services...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {servicesItems.map((s) => (
            <div
              key={s.id || s._id}
              className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-[#13151f] to-[#0d0e15] border border-white/10 hover:border-white/20 flex flex-col justify-between gap-4 transition-all group shadow-lg"
            >
              <div className="flex flex-col gap-3">
                {/* Header: Number, Title, Action buttons */}
                <div className="flex items-start justify-between gap-2 border-b border-white/5 pb-2.5">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="font-mono font-bold text-xs px-2 py-0.5 rounded-lg bg-[#ff3b30]/15 text-[#ff3b30] border border-[#ff3b30]/30 shrink-0">
                      {s.number || "(00)"}
                    </span>
                    <div className="flex flex-col min-w-0">
                      <h3 className="font-['Syne',sans-serif] font-bold text-sm sm:text-base text-white truncate">
                        {s.title}
                      </h3>
                      {s.tag && (
                        <span className="font-mono text-[10px] text-neutral-400 truncate">
                          {s.tag}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => onOpenEdit(s)}
                      className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white transition-colors cursor-pointer active:scale-95"
                      title="Edit Service"
                    >
                      <Edit2 size={13} />
                    </button>
                    <button
                      onClick={() => onDeleteItem(s.id || s._id, s.title)}
                      className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors cursor-pointer active:scale-95"
                      title="Delete Service"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                {/* Image Preview & Scope Overview */}
                <div className="flex gap-3 items-start">
                  {s.image ? (
                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden bg-black/40 relative shrink-0 border border-white/10">
                      <CachedImage
                        src={s.image}
                        alt={s.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  ) : (
                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 text-neutral-500">
                      <Layers size={20} />
                    </div>
                  )}

                  <div className="flex flex-col gap-1 min-w-0 flex-1">
                    {s.subtitle && (
                      <p className="font-mono text-[11px] text-neutral-300 font-semibold truncate">
                        {s.subtitle}
                      </p>
                    )}
                    <p className="text-[11px] text-neutral-400 line-clamp-2 leading-relaxed">
                      {s.details?.description || "No scope description specified."}
                    </p>
                    <span className="font-mono text-[10px] text-emerald-400 mt-0.5">
                      ⏱ {s.details?.timeline || "Sprint Based"}
                    </span>
                  </div>
                </div>

                {/* Deliverables snippet */}
                {s.details?.deliverables && s.details.deliverables.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-1">
                    {s.details.deliverables.slice(0, 3).map((del: string, dIdx: number) => (
                      <span
                        key={dIdx}
                        className="px-2 py-0.5 rounded-md bg-white/5 text-[10px] font-mono text-neutral-300 border border-white/5"
                      >
                        ✓ {del}
                      </span>
                    ))}
                    {s.details.deliverables.length > 3 && (
                      <span className="px-1.5 py-0.5 rounded-md bg-white/5 text-[10px] font-mono text-neutral-500">
                        +{s.details.deliverables.length - 3} more
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Showcase Works Mini Carousel */}
              <div className="pt-2.5 border-t border-white/5 flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-[10px] font-mono text-neutral-400">
                  <span>SHOWCASE WORKS ({s.works?.length || 0})</span>
                  <span className="text-neutral-500">First item shown on hover</span>
                </div>

                {s.works && s.works.length > 0 ? (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5">
                    {s.works.map((w: any, wIdx: number) => (
                      <div
                        key={w.id || wIdx}
                        className="relative rounded-lg overflow-hidden border border-white/10 bg-black/60 h-14 group/work flex items-center justify-center"
                        title={`${w.title} (${w.tag || w.type})`}
                      >
                        {w.thumbnail || w.url ? (
                          <img
                            src={w.thumbnail || w.url}
                            alt={w.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-[9px] font-mono text-neutral-500">Work {wIdx + 1}</span>
                        )}
                        <div className="absolute inset-0 bg-black/40 group-hover/work:bg-black/10 transition-colors flex items-center justify-center">
                          {w.type === "youtube" ? (
                            <span className="px-1 py-0.2 rounded bg-red-600 text-white text-[8px] font-mono font-bold">YT</span>
                          ) : w.type === "video" ? (
                            <Play size={10} className="text-white fill-white" />
                          ) : null}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-2 text-center text-[10px] font-mono text-neutral-500 bg-white/[0.02] rounded-lg border border-white/5">
                    No showcase works configured.
                  </div>
                )}
              </div>
            </div>
          ))}

          {servicesItems.length === 0 && (
            <div className="col-span-full py-16 text-center text-xs font-mono text-neutral-500">
              No services match your filters. Click "Add Service" to create one.
            </div>
          )}
        </div>
      )}

      {/* Pagination Footer */}
      <div className="p-3 sm:p-4 rounded-2xl bg-[#12141c] border border-white/10 flex items-center justify-between gap-2 text-xs font-mono shadow-xl">
        <span className="text-neutral-400 text-xs">
          Page <span className="text-white font-bold">{servicesPage}</span> /{" "}
          <span className="text-white font-bold">{servicesTotalPages}</span>
        </span>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onFetchServices(servicesPage - 1, servicesLimit, servicesSearch)}
            disabled={servicesPage <= 1 || servicesLoading}
            className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 disabled:opacity-30 text-white flex items-center gap-1 cursor-pointer active:scale-95"
          >
            <ChevronLeft size={13} />
            <span className="hidden sm:inline">PREV</span>
          </button>

          <div className="flex items-center gap-1">
            {Array.from({ length: servicesTotalPages }, (_, i) => i + 1).map((num) => (
              <button
                key={num}
                onClick={() => onFetchServices(num, servicesLimit, servicesSearch)}
                className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl font-mono text-xs transition-all cursor-pointer ${
                  servicesPage === num
                    ? "bg-[#ff3b30] text-white font-bold shadow-[0_0_10px_rgba(255,59,48,0.4)]"
                    : "bg-white/5 text-neutral-400 hover:text-white hover:bg-white/10"
                }`}
              >
                {num}
              </button>
            ))}
          </div>

          <button
            onClick={() => onFetchServices(servicesPage + 1, servicesLimit, servicesSearch)}
            disabled={servicesPage >= servicesTotalPages || servicesLoading}
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
