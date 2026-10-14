import React from "react";
import {
  BookOpen,
  Plus,
  Search,
  Filter,
  Loader2,
  ExternalLink,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import CachedImage from "../../CachedImage";

interface BlogsSectionProps {
  blogsItems: any[];
  blogsTotal: number;
  blogsPage: number;
  blogsTotalPages: number;
  blogsLimit: number;
  blogsSearch: string;
  blogsCategory: string;
  blogsLoading: boolean;
  setBlogsSearch: (val: string) => void;
  setBlogsCategory: (val: string) => void;
  setBlogsLimit: (val: number) => void;
  onFetchBlogs: (page?: number, limit?: number, search?: string, cat?: string, forceRefresh?: boolean) => void;
  onOpenCreate: () => void;
  onOpenEdit: (item: any) => void;
  onDeleteItem: (id: string | number, title?: string) => void;
}

export const BlogsSection: React.FC<BlogsSectionProps> = ({
  blogsItems,
  blogsTotal,
  blogsPage,
  blogsTotalPages,
  blogsLimit,
  blogsSearch,
  blogsCategory,
  blogsLoading,
  setBlogsSearch,
  setBlogsCategory,
  setBlogsLimit,
  onFetchBlogs,
  onOpenCreate,
  onOpenEdit,
  onDeleteItem,
}) => {
  return (
    <div className="flex flex-col gap-3.5 sm:gap-6 animate-in fade-in duration-200">
      {/* Top Controls */}
      <div className="flex items-center justify-between gap-2">
        <div>
          <h2 className="font-['Syne',sans-serif] font-bold text-base sm:text-xl text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-cyan-400" />
            <span>Blogs & Articles ({blogsTotal})</span>
          </h2>
          <p className="font-mono text-[10px] sm:text-xs text-neutral-400">
            Editorial publications, industry knowledge, and thought-leadership articles
          </p>
        </div>
        <button
          onClick={onOpenCreate}
          className="px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-[0_0_20px_rgba(6,182,212,0.35)] shrink-0 active:scale-95 transition-all"
        >
          <Plus size={14} />
          <span>ADD BLOG</span>
        </button>
      </div>

      {/* Toolbar */}
      <div className="p-3 sm:p-4 rounded-2xl bg-[#12141c] border border-white/10 flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center justify-between shadow-xl">
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search articles by title, description, or content..."
            value={blogsSearch}
            onChange={(e) => {
              setBlogsSearch(e.target.value);
              onFetchBlogs(1, blogsLimit, e.target.value, blogsCategory);
            }}
            className="w-full bg-black/40 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-cyan-500 transition-colors"
          />
        </div>

        <div className="grid grid-cols-2 sm:flex items-center gap-2">
          <div className="flex items-center gap-1 bg-black/40 border border-white/10 rounded-xl px-2.5 py-1.5 min-w-0">
            <Filter className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <select
              value={blogsCategory}
              onChange={(e) => {
                setBlogsCategory(e.target.value);
                onFetchBlogs(1, blogsLimit, blogsSearch, e.target.value);
              }}
              className="w-full bg-transparent text-xs font-mono text-neutral-300 focus:outline-none cursor-pointer truncate"
            >
              <option value="All" className="bg-[#12141c]">All Categories</option>
              <option value="Digital Acceleration" className="bg-[#12141c]">Digital Acceleration</option>
              <option value="Tech Era & Culture" className="bg-[#12141c]">Tech Era & Culture</option>
              <option value="SMM & ORM" className="bg-[#12141c]">SMM & ORM</option>
              <option value="Paid Media" className="bg-[#12141c]">Paid Media</option>
              <option value="Lead Systems" className="bg-[#12141c]">Lead Systems</option>
              <option value="Web Engineering" className="bg-[#12141c]">Web Engineering</option>
            </select>
          </div>

          <div className="flex items-center justify-between gap-1 bg-black/40 border border-white/10 rounded-xl px-2.5 py-1.5 text-xs font-mono text-neutral-400">
            <span>Limit:</span>
            <select
              value={blogsLimit}
              onChange={(e) => {
                const newLimit = Number(e.target.value);
                setBlogsLimit(newLimit);
                onFetchBlogs(1, newLimit, blogsSearch, blogsCategory);
              }}
              className="bg-transparent text-white focus:outline-none cursor-pointer"
            >
              <option value="6" className="bg-[#12141c]">6</option>
              <option value="12" className="bg-[#12141c]">12</option>
              <option value="24" className="bg-[#12141c]">24</option>
            </select>
          </div>
        </div>
      </div>

      {/* Blogs Cards Grid */}
      {blogsLoading ? (
        <div className="py-16 flex flex-col items-center justify-center gap-3 text-neutral-400 font-mono text-xs">
          <Loader2 size={24} className="animate-spin text-cyan-400" />
          <span>Loading editorial articles...</span>
        </div>
      ) : blogsItems.length === 0 ? (
        <div className="py-16 flex flex-col items-center justify-center gap-3 p-8 rounded-3xl bg-[#12141c] border border-white/10 text-center">
          <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
            <BookOpen size={28} />
          </div>
          <h3 className="font-['Syne',sans-serif] font-bold text-lg text-white">No Articles Found</h3>
          <p className="font-mono text-xs text-neutral-400 max-w-sm">
            {blogsSearch || blogsCategory !== "All"
              ? "No articles matched your filter criteria."
              : "Publish your first thought-leadership article to showcase in the blog."}
          </p>
          <button
            onClick={onOpenCreate}
            className="mt-2 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-mono text-xs font-bold uppercase cursor-pointer transition-all"
          >
            + Publish First Article
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {blogsItems.map((blog) => {
            const paragraphsCount = Array.isArray(blog.content)
              ? blog.content.length
              : typeof blog.content === "string" && blog.content
                ? (blog.content.match(/<p|<h[1-6]|<li/g) || []).length || 1
                : 0;
            const bulletsCount = Array.isArray(blog.bullets) ? blog.bullets.length : 0;

            return (
              <div
                key={blog.id || blog._id}
                className="group relative rounded-2xl overflow-hidden bg-[#12141c] border border-white/10 hover:border-cyan-500/50 transition-all duration-300 flex flex-col justify-between shadow-xl"
              >
                <div>
                  {/* Image Banner Header */}
                  <div className="relative aspect-[16/9] w-full overflow-hidden bg-black/60 flex items-center justify-center border-b border-white/5">
                    {blog.image ? (
                      <CachedImage
                        src={blog.image}
                        alt={blog.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-cyan-950/40 via-black to-[#12141c]">
                        <BookOpen size={32} className="text-cyan-500/40" />
                        <span className="font-mono text-[10px] text-neutral-500">Text-Based Editorial</span>
                      </div>
                    )}

                    {/* Top Floating Badges */}
                    <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between gap-1.5 z-10">
                      <span className="px-2.5 py-0.5 rounded-full bg-black/80 backdrop-blur-md border border-cyan-500/40 text-[10px] font-mono font-bold text-cyan-300">
                        {blog.category || "Editorial"}
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-md text-[10px] font-mono font-bold text-white">
                        {blog.number || "(01)"}
                      </span>
                    </div>

                    {/* Bottom Floating Read-time & Date */}
                    <div className="absolute bottom-2 left-2.5 right-2.5 flex items-center justify-between text-[10px] font-mono text-neutral-300 bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/10">
                      <span>{blog.date || "AUG 2026"}</span>
                      <span className="text-cyan-300 font-bold">{blog.readTime || "5 MIN READ"}</span>
                    </div>
                  </div>

                  {/* Article Body */}
                  <div className="p-4 sm:p-5 flex flex-col gap-2.5">
                    <h3 className="font-['Syne',sans-serif] font-bold text-base sm:text-lg text-white group-hover:text-cyan-300 transition-colors line-clamp-2 leading-snug">
                      {blog.title}
                    </h3>

                    <p className="font-mono text-xs text-neutral-400 line-clamp-2 leading-relaxed">
                      {blog.description}
                    </p>

                    {/* Structure Indicators */}
                    <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-white/5 text-[10px] font-mono">
                      <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-neutral-300">
                        📝 {paragraphsCount} {paragraphsCount === 1 ? "Paragraph" : "Paragraphs"}
                      </span>
                      {bulletsCount > 0 && (
                        <span className="px-2 py-0.5 rounded-md bg-cyan-500/10 border border-cyan-500/20 text-cyan-300">
                          ⚡ {bulletsCount} {bulletsCount === 1 ? "Bullet" : "Bullets"}
                        </span>
                      )}
                      <span
                        className={`ml-auto px-2 py-0.5 rounded-md text-[9px] font-bold uppercase ${blog.isPublished !== false
                            ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                            : "bg-neutral-500/20 text-neutral-400 border border-neutral-500/30"
                          }`}
                      >
                        {blog.isPublished !== false ? "Published" : "Draft"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Action Footer */}
                <div className="p-3 bg-[#0e1017] border-t border-white/10 flex items-center justify-between">
                  <span className="font-mono text-[10px] text-neutral-500">
                    Slug: {String(blog.id || blog._id || "").slice(0, 16)}...
                  </span>
                  <div className="flex items-center gap-1.5">
                    <a
                      href={`/blogs/${blog.id || blog._id}`}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-neutral-300 hover:text-white transition-colors"
                      title="View on Live Site"
                    >
                      <ExternalLink size={13} />
                    </a>
                    <button
                      onClick={() => onOpenEdit(blog)}
                      className="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-neutral-300 hover:text-white transition-colors cursor-pointer active:scale-95"
                      title="Edit Article"
                    >
                      <Edit2 size={13} />
                    </button>
                    <button
                      onClick={() => onDeleteItem(blog.id || blog._id, blog.title)}
                      className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors cursor-pointer active:scale-95"
                      title="Delete Article"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3.5 sm:p-4 rounded-2xl bg-[#12141c] border border-white/10 mt-2 shadow-xl">
        <span className="text-xs font-mono text-neutral-400">
          Showing Page <strong className="text-white">{blogsPage}</strong> of{" "}
          <strong className="text-white">{blogsTotalPages}</strong> ({blogsTotal} articles)
        </span>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onFetchBlogs(blogsPage - 1, blogsLimit, blogsSearch, blogsCategory)}
            disabled={blogsPage <= 1 || blogsLoading}
            className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 disabled:opacity-30 text-white flex items-center gap-1 cursor-pointer active:scale-95 transition-colors"
          >
            <ChevronLeft size={13} />
            <span className="hidden sm:inline">PREV</span>
          </button>

          <div className="flex items-center gap-1">
            {Array.from({ length: blogsTotalPages }, (_, i) => i + 1).map((num) => (
              <button
                key={num}
                onClick={() => onFetchBlogs(num, blogsLimit, blogsSearch, blogsCategory)}
                className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl font-mono text-xs transition-all cursor-pointer ${blogsPage === num
                    ? "bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-bold shadow-[0_0_10px_rgba(6,182,212,0.5)]"
                    : "bg-white/5 text-neutral-400 hover:text-white hover:bg-white/10"
                  }`}
              >
                {num}
              </button>
            ))}
          </div>

          <button
            onClick={() => onFetchBlogs(blogsPage + 1, blogsLimit, blogsSearch, blogsCategory)}
            disabled={blogsPage >= blogsTotalPages || blogsLoading}
            className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 disabled:opacity-30 text-white flex items-center gap-1 cursor-pointer active:scale-95 transition-colors"
          >
            <span className="hidden sm:inline">NEXT</span>
            <ChevronRight size={13} />
          </button>
        </div>
      </div>
    </div>
  );
};
