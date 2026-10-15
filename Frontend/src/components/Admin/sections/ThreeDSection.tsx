import React from "react";
import {
  Plus,
  Search,
  Filter,
  RefreshCw,
  Play,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import CachedImage from "../../CachedImage";

interface ThreeDSectionProps {
  threeDItems: any[];
  threeDTotal: number;
  threeDPage: number;
  threeDTotalPages: number;
  threeDLimit: number;
  threeDSearch: string;
  threeDCategory: string;
  threeDLoading: boolean;
  setThreeDSearch: (val: string) => void;
  setThreeDCategory: (val: string) => void;
  setThreeDLimit: (val: number) => void;
  onFetchThreeD: (page?: number, limit?: number, search?: string, category?: string) => void;
  onOpenCreate: () => void;
  onOpenEdit: (item: any) => void;
  onDeleteItem: (id: string | number) => void;
}

export const ThreeDSection: React.FC<ThreeDSectionProps> = ({
  threeDItems,
  threeDTotal,
  threeDPage,
  threeDTotalPages,
  threeDLimit,
  threeDSearch,
  threeDCategory,
  threeDLoading,
  setThreeDSearch,
  setThreeDCategory,
  setThreeDLimit,
  onFetchThreeD,
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
            3D Studio ({threeDTotal})
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

      {/* Toolbar */}
      <div className="p-3 sm:p-4 rounded-2xl bg-[#12141c] border border-white/10 flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center justify-between shadow-xl">
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search 3D showcases..."
            value={threeDSearch}
            onChange={(e) => {
              setThreeDSearch(e.target.value);
              onFetchThreeD(1, threeDLimit, e.target.value, threeDCategory);
            }}
            className="w-full bg-black/40 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-purple-500 transition-colors"
          />
        </div>

        <div className="grid grid-cols-2 sm:flex items-center gap-2">
          <div className="flex items-center gap-1 bg-black/40 border border-white/10 rounded-xl px-2.5 py-1.5 min-w-0">
            <Filter className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
            <select
              value={threeDCategory}
              onChange={(e) => {
                setThreeDCategory(e.target.value);
                onFetchThreeD(1, threeDLimit, threeDSearch, e.target.value);
              }}
              className="w-full bg-transparent text-xs font-mono text-neutral-300 focus:outline-none cursor-pointer truncate"
            >
              <option value="All" className="bg-[#12141c]">All Categories</option>
              <option value="Architecture & Interiors" className="bg-[#12141c]">Architecture & Interiors</option>
              <option value="CGI Commercial" className="bg-[#12141c]">CGI Commercial</option>
              <option value="Automotive & Product" className="bg-[#12141c]">Automotive & Product</option>
            </select>
          </div>

          <div className="flex items-center justify-between gap-1 bg-black/40 border border-white/10 rounded-xl px-2.5 py-1.5 text-xs font-mono text-neutral-400">
            <span>Limit:</span>
            <select
              value={threeDLimit}
              onChange={(e) => {
                const newLimit = Number(e.target.value);
                setThreeDLimit(newLimit);
                onFetchThreeD(1, newLimit, threeDSearch, threeDCategory);
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

      {/* Grid */}
      {threeDLoading ? (
        <div className="py-16 text-center text-neutral-500 font-mono text-xs flex flex-col items-center gap-2">
          <RefreshCw className="w-5 h-5 animate-spin text-purple-400" />
          <span>Loading 3D showcases...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {threeDItems.map((t) => (
            <div
              key={t.id}
              className="p-3.5 sm:p-5 rounded-2xl bg-[#12141c] border border-white/10 hover:border-purple-500/30 flex flex-col justify-between gap-3 transition-all group shadow-lg"
            >
              <div className="flex flex-col gap-2">
                {t.videoUrl ? (
                  <div className="w-full h-36 sm:h-40 rounded-xl overflow-hidden bg-black/50 relative flex items-center justify-center border border-white/5">
                    {t.videoUrl.match(/\.(mp4|webm|mov)($|\?)/i) || t.videoUrl.includes("/uploads/") ? (
                      <video
                        src={t.videoUrl.includes("#t=") ? t.videoUrl : `${t.videoUrl}#t=0.001`}
                        muted
                        playsInline
                        preload="metadata"
                        onMouseEnter={(e) => {
                          try {
                            e.currentTarget.play();
                          } catch {}
                        }}
                        onMouseLeave={(e) => {
                          try {
                            e.currentTarget.pause();
                            e.currentTarget.currentTime = 0;
                          } catch {}
                        }}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : t.posterUrl && !t.posterUrl.includes("unsplash.com") ? (
                      <CachedImage
                        src={t.posterUrl}
                        alt={t.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-black/60 text-purple-400 font-mono text-xs">
                        3D Video
                      </div>
                    )}
                    <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/80 backdrop-blur-md text-[10px] font-mono text-white/90 border border-white/10 flex items-center gap-1 pointer-events-none">
                      <Play size={10} className="fill-current text-purple-400" />
                      <span>{t.duration || "4K"}</span>
                    </div>
                  </div>
                ) : t.posterUrl && !t.posterUrl.includes("unsplash.com") ? (
                  <div className="w-full h-36 sm:h-40 rounded-xl overflow-hidden bg-black/40 relative">
                    <CachedImage
                      src={t.posterUrl}
                      alt={t.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/75 backdrop-blur-md text-[10px] font-mono text-purple-400 border border-white/10">
                      {t.category || "3D Studio"}
                    </div>
                  </div>
                ) : (
                  <div className="w-full h-36 sm:h-40 rounded-xl overflow-hidden bg-black/40 relative flex items-center justify-center border border-white/5">
                    <div className="flex flex-col items-center gap-1.5 text-neutral-500 font-mono text-xs">
                      <Play size={16} className="text-purple-400/60" />
                      <span>No Video Media</span>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs text-purple-400 truncate">
                    {t.title}
                  </span>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => onOpenEdit(t)}
                      className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white transition-colors cursor-pointer active:scale-95"
                      title="Edit"
                    >
                      <Edit2 size={13} />
                    </button>
                    <button
                      onClick={() => onDeleteItem(t.id)}
                      className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors cursor-pointer active:scale-95"
                      title="Delete"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {threeDItems.length === 0 && (
            <div className="col-span-full py-16 text-center text-xs font-mono text-neutral-500">
              No 3D showcases match your filters.
            </div>
          )}
        </div>
      )}

      {/* Pagination */}
      <div className="p-3 sm:p-4 rounded-2xl bg-[#12141c] border border-white/10 flex items-center justify-between gap-2 text-xs font-mono shadow-xl">
        <span className="text-neutral-400 text-xs">
          Page <span className="text-white font-bold">{threeDPage}</span> /{" "}
          <span className="text-white font-bold">{threeDTotalPages}</span>
        </span>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onFetchThreeD(threeDPage - 1)}
            disabled={threeDPage <= 1 || threeDLoading}
            className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 disabled:opacity-30 text-white flex items-center gap-1 cursor-pointer active:scale-95"
          >
            <ChevronLeft size={13} />
            <span className="hidden sm:inline">PREV</span>
          </button>

          <div className="flex items-center gap-1">
            {Array.from({ length: threeDTotalPages }, (_, i) => i + 1).map((num) => (
              <button
                key={num}
                onClick={() => onFetchThreeD(num)}
                className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl font-mono text-xs transition-all cursor-pointer ${
                  threeDPage === num
                    ? "bg-[#ff3b30] text-white font-bold shadow-[0_0_10px_rgba(255,59,48,0.4)]"
                    : "bg-white/5 text-neutral-400 hover:text-white hover:bg-white/10"
                }`}
              >
                {num}
              </button>
            ))}
          </div>

          <button
            onClick={() => onFetchThreeD(threeDPage + 1)}
            disabled={threeDPage >= threeDTotalPages || threeDLoading}
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
