import React from "react";
import { ArrowUpRight } from "lucide-react";
import CachedImage from "./CachedImage";

export interface BlogItem {
  id: string;
  number: string;
  category: string;
  title: string;
  description: string;
  readTime: string;
  date: string;
  image?: string;
  gradient?: string;
  cardHeight?: string;
  cardWidth?: string;
  content?: string[];
  bullets?: string[];
}

interface BlogCardProps {
  blog: BlogItem;
  onClick: (blog: BlogItem) => void;
}

export const BlogCard: React.FC<BlogCardProps> = ({ blog, onClick }) => {
  return (
    <div
      onClick={() => onClick(blog)}
      className="group relative shrink-0 rounded-2xl sm:rounded-3xl overflow-hidden cursor-pointer border border-neutral-800/90 hover:border-neutral-500 transition-all duration-500 bg-[#0c0c0c] flex flex-col justify-between p-5 sm:p-7 md:p-8 select-none shadow-2xl hover:shadow-[0_20px_50px_rgba(255,60,0,0.18)] w-[270px] sm:w-[340px] md:w-[390px] min-h-[340px] sm:h-[400px] md:h-[430px]"
    >
      {/* Optional Background Image or Ambient Glow */}
      {blog.image && (
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <CachedImage
            src={blog.image}
            alt={blog.title}
            className="w-full h-full object-cover object-center opacity-30 group-hover:opacity-50 group-hover:scale-105 transition-all duration-700 ease-out grayscale group-hover:grayscale-0"
            loading="lazy"
            decoding="async"
          />
          {/* Multi-layered dark gradient to ensure text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0c0c0c] via-[#0c0c0c]/90 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0c0c0c]/90 via-transparent to-[#0c0c0c]" />
        </div>
      )}

      {/* Subtle Molten Ambient Glow in corner for pure-dark cards */}
      {!blog.image && (
        <div className="absolute top-0 right-0 w-52 h-52 bg-gradient-to-bl from-orange-600/15 via-red-600/8 to-transparent rounded-bl-full pointer-events-none group-hover:from-orange-600/25 transition-all duration-500" />
      )}

      {/* Top Meta Header: Pill Tag + Red Dot Indicator + Circular Arrow Button */}
      <div className="relative z-10 flex items-center justify-between gap-2 sm:gap-3 shrink-0 mb-2 sm:mb-3">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <span className="w-1.5 sm:w-2 h-1.5 sm:h-2 rounded-full bg-[#ff3b30] shadow-[0_0_8px_#ff3b30] animate-pulse shrink-0" />
          <span className="px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full text-[9px] sm:text-[11px] font-['Space_Grotesk',sans-serif] uppercase tracking-wider bg-neutral-900/90 border border-neutral-800 text-neutral-300 backdrop-blur-md group-hover:border-neutral-600 group-hover:text-white transition-colors truncate max-w-[170px] sm:max-w-none">
            {blog.category}
          </span>
        </div>

        <span className="w-7 sm:w-8 h-7 sm:h-8 rounded-full border border-neutral-800 bg-neutral-900/90 flex items-center justify-center transition-all duration-300 shrink-0 group-hover:bg-white group-hover:border-white shadow-sm">
          <ArrowUpRight className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-neutral-400 group-hover:text-black transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 stroke-[2.2]" />
        </span>
      </div>

      {/* Center / Body Section: Number + Headline + Description */}
      <div className="relative z-10 my-auto py-1 sm:py-2 flex flex-col gap-1.5 sm:gap-2.5">
        <span className="font-['Cormorant_Garamond',serif] italic text-xs sm:text-sm text-neutral-400 tracking-widest block">
          {blog.number}
        </span>

        <h3 className="font-['Syne',sans-serif] font-bold text-base sm:text-lg md:text-xl text-white uppercase tracking-tight leading-snug group-hover:text-neutral-100 transition-colors line-clamp-2">
          {blog.title}
        </h3>

        <p className="font-['Space_Grotesk',sans-serif] text-[11px] sm:text-xs md:text-sm text-neutral-400 leading-relaxed group-hover:text-neutral-300 transition-colors line-clamp-3">
          {blog.description}
        </p>
      </div>

      {/* Bottom Footer Meta: Date + Read Time + Interactive "Read Full" prompt */}
      <div className="relative z-10 pt-2.5 sm:pt-3.5 mt-auto border-t border-neutral-800/80 flex items-center justify-between text-[10px] sm:text-[11px] font-['Space_Grotesk',sans-serif] uppercase tracking-widest text-neutral-400 shrink-0">
        <span>{blog.date}</span>
        <div className="flex items-center gap-1.5 sm:gap-2">
          <span className="hidden sm:inline-block text-[10px] text-orange-400 font-semibold group-hover:text-orange-300 transition-colors">
            Read Full Article →
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-1 h-1 rounded-full bg-neutral-600" />
            {blog.readTime}
          </span>
        </div>
      </div>
    </div>
  );
};

export default BlogCard;
