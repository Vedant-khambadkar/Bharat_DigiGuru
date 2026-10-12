import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { X, Clock, Calendar, CheckCircle2 } from "lucide-react";
import BlogCard from "../components/BlogCard";
import type { BlogItem } from "../components/BlogCard";
import CachedImage from "../components/CachedImage";
import LensText from "../components/LensText";
import { userService } from "../services/service/userService";
import { onSocketEvent } from "../utils/socket";
import { getApiCache } from "../utils/apiCache";

gsap.registerPlugin(ScrollTrigger);

export const Blogs: React.FC = () => {
  const [blogs, setBlogs] = useState<BlogItem[]>(() => {
    const cached = getApiCache<BlogItem[]>("blogs_items");
    return Array.isArray(cached) && cached.length > 0 ? cached : [];
  });
  const [isLoading, setIsLoading] = useState<boolean>(() => blogs.length === 0);
  const sectionRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [activeBlog, setActiveBlog] = useState<BlogItem | null>(null);

  // Load and refresh blogs purely from backend API + WebSocket synchronization
  useEffect(() => {
    let isMounted = true;

    const loadBlogs = async (forceRefresh = false) => {
      try {
        if (blogs.length === 0) setIsLoading(true);
        const data = await userService.getBlogs(forceRefresh);
        if (!isMounted || !data) return;
        const items = Array.isArray(data) ? data : data.items || [];
        if (Array.isArray(items)) {
          setBlogs(items);
        }
      } catch (err) {
        console.warn("Could not fetch blogs from API:", err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadBlogs();

    const unsubCreated = onSocketEvent("blog:created", (newBlog: any) => {
      setBlogs((prev) => {
        const exists = prev.some((b) => b.id === newBlog.id);
        if (exists) return prev.map((b) => (b.id === newBlog.id ? newBlog : b));
        return [newBlog, ...prev];
      });
      loadBlogs(true);
    });

    const unsubUpdated = onSocketEvent("blog:updated", (updatedBlog: any) => {
      setBlogs((prev) => prev.map((b) => (b.id === updatedBlog.id ? { ...b, ...updatedBlog } : b)));
      loadBlogs(true);
    });

    const unsubDeleted = onSocketEvent("blog:deleted", (deletedId: string) => {
      setBlogs((prev) => prev.filter((b) => b.id !== deletedId));
      setActiveBlog((current) => (current && current.id === deletedId ? null : current));
      loadBlogs(true);
    });

    return () => {
      isMounted = false;
      unsubCreated();
      unsubUpdated();
      unsubDeleted();
    };
  }, []);

  // Deep-linking: auto-open blog if URL matches /blogs/:id or hash
  useEffect(() => {
    const checkDeepLink = () => {
      const path = window.location.pathname;
      const match = path.match(/^\/blogs\/([^/]+)/);
      const blogId = match ? decodeURIComponent(match[1]) : "";
      if (blogId) {
        const found = blogs.find(
          (b) => String(b.id) === blogId || (b as any)._id === blogId
        );
        if (found) {
          setActiveBlog(found);
        }
      }
    };

    checkDeepLink();
    window.addEventListener("popstate", checkDeepLink);
    return () => window.removeEventListener("popstate", checkDeepLink);
  }, [blogs]);

  // Keep activeBlog in sync if blogs array is updated while viewing
  useEffect(() => {
    if (activeBlog) {
      const refreshed = blogs.find(
        (b) => String(b.id) === String(activeBlog.id) || (b as any)._id === (activeBlog as any)._id
      );
      if (
        refreshed &&
        (refreshed.title !== activeBlog.title ||
          refreshed.image !== activeBlog.image ||
          refreshed.description !== activeBlog.description ||
          refreshed.bullets?.length !== activeBlog.bullets?.length ||
          refreshed.content?.length !== activeBlog.content?.length)
      ) {
        setActiveBlog(refreshed);
      }
    }
  }, [blogs, activeBlog]);

  // Keyboard accessibility: ESC closes modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && activeBlog) {
        setActiveBlog(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeBlog]);

  // Dynamic GSAP Horizontal Scroll Engine that adapts seamlessly to any number of stories from Admin Panel
  useEffect(() => {
    const track = trackRef.current;
    const section = sectionRef.current;
    if (!track || !section) return;

    const mm = gsap.matchMedia();

    // Desktop Layout (>= 1024px): Dynamic Pinned Horizontal Glide
    mm.add("(min-width: 1024px)", () => {
      const getScrollAmount = () => {
        if (!track) return 0;
        const totalTrackWidth = track.scrollWidth;
        const viewportWidth = window.innerWidth;
        // Calculate exact horizontal delta with right-side comfortable margin
        const delta = totalTrackWidth - viewportWidth + 120;
        return delta > 0 ? delta : 0;
      };

      const scrollDistance = getScrollAmount();

      // Only create pinned horizontal scroll if content overflows the viewport
      if (scrollDistance > 0) {
        gsap.to(track, {
          x: () => -getScrollAmount(),
          ease: "none",
          scrollTrigger: {
            id: "stories-horizontal-scroll",
            trigger: section,
            start: "top top",
            end: () => `+=${Math.max(window.innerHeight * 0.9, getScrollAmount() * 1.15)}`,
            pin: true,
            pinSpacing: true,
            scrub: 0.5,
            fastScrollEnd: true,
            invalidateOnRefresh: true,
          },
        });
      } else {
        // Reset transform if all cards fit comfortably on large wide screens
        gsap.set(track, { clearProps: "transform,x" });
      }
    });

    // Mobile / Tablet (< 1024px): Reset horizontal transform for fluid native touch scroll
    mm.add("(max-width: 1023px)", () => {
      gsap.set(track, { clearProps: "transform,x" });
    });

    // Auto-refresh ScrollTrigger whenever track dimensions change (e.g. dynamic admin cards added/removed)
    const resizeObserver = new ResizeObserver(() => {
      ScrollTrigger.refresh();
    });
    resizeObserver.observe(track);

    // Initial tick to refresh after layout render
    const timeoutId = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 150);

    return () => {
      clearTimeout(timeoutId);
      resizeObserver.disconnect();
      mm.revert();
    };
  }, [blogs]);

  return (
    <section
      id="stories-section"
      ref={sectionRef}
      className="relative z-10 bg-transparent text-white w-full overflow-hidden py-10 sm:py-16 lg:py-0"
    >
      {/* Anchor for backwards compatibility */}
      <div id="blogs-section" className="absolute -top-10 left-0 pointer-events-none" />
      {/* Ambient background glows */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-1/3 left-1/4 w-[600px] h-[600px] bg-red-600/[0.03] blur-[150px] rounded-full" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-orange-500/[0.025] blur-[140px] rounded-full" />
      </div>

      {/* Giant Kinetic Watermark Typography across the background */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 w-full select-none pointer-events-none z-0 overflow-hidden opacity-[0.035] leading-none whitespace-nowrap">
        <span className="font-['Syne',sans-serif] font-black text-[22vw] uppercase tracking-tighter text-transparent [-webkit-text-stroke:2px_#ffffff]">
          Bharat DigiGuru
        </span>
      </div>

      {/* Main Container */}
      <div className="relative z-10 min-h-screen lg:h-screen w-full max-w-8xl mx-auto flex flex-col justify-between py-6 sm:py-8 md:py-10 px-4 sm:px-8 md:px-12 lg:px-16">
        {/* =========================================================================
            HEADER SECTION
           ========================================================================= */}
        <div className="flex flex-col gap-2 shrink-0 max-w-5xl mt-16">
          {/* Studio Emblem + Tagline */}
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#ff3b30] shadow-[0_0_10px_#ff3b30] animate-pulse" />
            <span className="font-['Space_Grotesk',sans-serif] text-[10px] sm:text-xs uppercase tracking-widest text-neutral-400 font-semibold flex items-center gap-1.5">
              Bharat DigiGuru Editorial & Insights
              <span className="text-orange-500">✦</span>
            </span>
          </div>

          {/* Main Title with LensText */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-3">
            <div>
              <h2 className="font-neuropol font-normal text-3xl sm:text-4xl lg:text-5xl uppercase tracking-wider text-white leading-tight select-none">
                <LensText text="REDEFINE DIGITAL STORIES" strokeWidth="1.5px" strokeColor="#ffffff" />
              </h2>

              {/* Sub-statement with Molten Capsule Pills */}
              <div className="mt-2 font-['Space_Grotesk',sans-serif] text-xs sm:text-sm text-neutral-400 tracking-wide uppercase leading-normal max-w-2xl flex flex-wrap items-center gap-y-1.5 py-0.5">
                <span>Bharat DigiGuru — is an editorial agency of bold</span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-gradient-to-r from-red-600 via-orange-500 to-amber-400 shadow-[0_0_12px_rgba(255,69,0,0.6)] text-white text-[9px] sm:text-[10px] font-bold uppercase tracking-wider mx-1.5 align-middle shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-white mr-1.5 animate-ping" />
                  Creators
                </span>
                <span>that delivers the power of media with</span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-gradient-to-r from-orange-500 to-red-600 shadow-[0_0_12px_rgba(255,80,0,0.6)] text-white text-[9px] sm:text-[10px] font-bold uppercase tracking-wider mx-1.5 align-middle shrink-0">
                  Cutting-Edge
                </span>
                <span>strategy.</span>
              </div>
            </div>

            {/* Quick Horizontal Scroll Badge */}
            <div className="hidden lg:flex items-center gap-3 shrink-0 pb-1">
              <span className="font-['Space_Grotesk',sans-serif] text-xs uppercase tracking-widest text-neutral-500">
                Scroll to Explore Full Cards
              </span>
              <span className="w-2 h-2 rounded-full bg-orange-500/80 animate-ping" />
            </div>
          </div>
        </div>

        {/* =========================================================================
            HORIZONTAL CAROUSEL TRACK (Fluid scroll on mobile, Pinned on desktop)
           ========================================================================= */}
        <div
          ref={containerRef}
          className="my-auto overflow-x-auto lg:overflow-visible py-4 sm:py-6 lg:py-8 scrollbar-none snap-x snap-mandatory lg:snap-none"
        >
          <div
            ref={trackRef}
            className="flex gap-4 sm:gap-6 lg:gap-8 items-center will-change-transform pl-1 sm:pl-4 lg:pl-6 pr-6 lg:pr-32 select-none"
            style={{ width: "max-content" }}
          >
            {isLoading && blogs.length === 0 ? (
              [1, 2, 3].map((n) => (
                <div
                  key={`skeleton-${n}`}
                  className="w-[280px] sm:w-[340px] md:w-[380px] h-[480px] rounded-2xl bg-white/[0.03] border border-white/10 p-6 flex flex-col justify-between animate-pulse shrink-0"
                >
                  <div className="space-y-4">
                    <div className="w-20 h-4 rounded bg-white/10" />
                    <div className="w-full h-8 rounded bg-white/10" />
                    <div className="w-3/4 h-8 rounded bg-white/10" />
                  </div>
                  <div className="w-full h-44 rounded-xl bg-white/5" />
                  <div className="w-1/2 h-4 rounded bg-white/10" />
                </div>
              ))
            ) : blogs.length === 0 ? (
              <div className="py-16 px-8 text-neutral-400 font-['Space_Grotesk',sans-serif] text-sm tracking-wider uppercase border border-white/10 rounded-2xl bg-white/[0.02]">
                No articles published yet. Publications from the Admin Dashboard will appear here.
              </div>
            ) : (
              blogs.map((blog) => (
                <div key={blog.id} className="snap-start shrink-0">
                  <BlogCard
                    blog={blog}
                    onClick={(selected) => setActiveBlog(selected)}
                  />
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* =========================================================================
          DETAILED BLOG ARTICLE READER MODAL (Displays Full Editorial Breakdown)
         ========================================================================= */}
      {activeBlog && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 md:p-10 bg-black/90 backdrop-blur-2xl"
          onClick={() => setActiveBlog(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            data-lenis-prevent="true"
            className="relative w-full max-w-4xl max-h-[88vh] overflow-y-auto rounded-2xl bg-[#0d0d0d] border border-neutral-800 p-5 sm:p-8 md:p-10 shadow-2xl flex flex-col gap-5 sm:gap-6 text-neutral-200 animate-in fade-in zoom-in-95 duration-300"
          >
            {/* Modal Top Navigation */}
            <div className="flex items-center justify-between border-b border-neutral-800 pb-4 sticky top-0 bg-[#0d0d0d]/95 backdrop-blur-md z-20">
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#ff3b30] shadow-[0_0_8px_#ff3b30]" />
                <span className="px-3 py-1 rounded-full text-xs font-['Space_Grotesk',sans-serif] uppercase tracking-wider bg-neutral-900 border border-neutral-800 text-neutral-300">
                  {activeBlog.category}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setActiveBlog(null)}
                aria-label="Close article modal"
                className="w-8 h-8 rounded-full border border-neutral-800 flex items-center justify-center text-neutral-400 hover:text-white hover:border-neutral-600 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Article Cover Image (Cached & Responsive) */}
            {activeBlog.image && (
              <div className="w-full aspect-[21/9] rounded-xl overflow-hidden bg-neutral-900 border border-neutral-800 shadow-xl">
                <CachedImage
                  src={activeBlog.image}
                  alt={activeBlog.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Title & Metadata */}
            <div className="flex flex-col gap-2.5 sm:gap-3">
              <span className="font-['Cormorant_Garamond',serif] italic text-xs sm:text-sm text-neutral-400">
                {activeBlog.number} · Bharat DigiGuru Official Editorial
              </span>
              <h2 className="font-['Syne',sans-serif] font-bold text-xl sm:text-2xl md:text-3xl lg:text-4xl uppercase tracking-tight text-white leading-tight">
                {activeBlog.title}
              </h2>
              <div className="flex items-center gap-4 text-[11px] sm:text-xs font-['Space_Grotesk',sans-serif] uppercase tracking-wider text-neutral-400 pt-1">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  {activeBlog.date}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  {activeBlog.readTime}
                </span>
              </div>
            </div>

            {/* Short Summary / Executive Overview (if available) */}
            {activeBlog.description && (
              <div className="p-3.5 sm:p-4 rounded-xl bg-neutral-900/80 border border-neutral-800/90 text-neutral-300 text-xs sm:text-sm font-['Space_Grotesk',sans-serif] leading-relaxed border-l-2 border-l-orange-500 shadow-sm">
                <span className="block font-bold text-[10px] sm:text-[11px] uppercase tracking-wider text-orange-400 mb-1">
                  Executive Summary:
                </span>
                <p className="italic text-neutral-300">{activeBlog.description}</p>
              </div>
            )}

            {/* Editorial Body Content */}
            <div className="flex flex-col gap-4 sm:gap-5 text-xs sm:text-sm md:text-base text-neutral-300 leading-relaxed font-['Space_Grotesk',sans-serif] pt-2 border-t border-neutral-800/80">
              {activeBlog.content?.map((paragraph, idx) => (
                <p key={idx} className="leading-relaxed sm:leading-loose">
                  {paragraph}
                </p>
              ))}
            </div>

            {/* Bullet Points Checklist (Key Strategic Highlights & Solutions) */}
            {activeBlog.bullets && activeBlog.bullets.length > 0 && (
              <div className="flex flex-col gap-3 pt-4 border-t border-neutral-800/80">
                <h3 className="font-['Syne',sans-serif] text-xs sm:text-sm md:text-base font-bold uppercase tracking-wider text-white flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#ff3b30]" />
                  Key Strategic Highlights & Solutions ({activeBlog.bullets.length}):
                </h3>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-2.5 pt-2">
                  {activeBlog.bullets.map((bullet, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2.5 sm:gap-3 text-xs sm:text-sm text-neutral-300 bg-neutral-900/60 p-2.5 sm:p-3 rounded-lg border border-neutral-800/80 font-['Space_Grotesk',sans-serif]"
                    >
                      <CheckCircle2 className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Modal Footer CTA */}
            <div className="pt-4 sm:pt-6 border-t border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
              <span className="text-[11px] sm:text-xs text-neutral-400 font-['Space_Grotesk',sans-serif] uppercase tracking-wider text-center sm:text-left">
                Published by Bharat DigiGuru Digital Media Company
              </span>
              <button
                type="button"
                onClick={() => setActiveBlog(null)}
                className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-white text-black text-xs font-['Space_Grotesk',sans-serif] font-semibold uppercase tracking-wider hover:bg-neutral-200 transition-colors cursor-pointer"
              >
                Close Article
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default Blogs;
