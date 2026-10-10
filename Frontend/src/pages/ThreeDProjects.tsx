import React, { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import {
  Play,
  Pause,
  Maximize2,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { userService } from "../services/service/userService";
import { onSocketEvent } from "../utils/socket";
import { getApiCache, setApiCache } from "../utils/apiCache";
import { preloadMediaList, useCachedMedia } from "../utils/mediaCache";

gsap.registerPlugin(ScrollTrigger);

interface ThreeDProject {
  id: string;
  title?: string;
  category?: string;
  videoUrl: string;
  posterUrl?: string;
  duration?: string;
  [key: string]: any;
}

interface ThreeDCardProps {
  project: ThreeDProject;
  isPlaying: boolean;
  isMuted: boolean;
  onTogglePlay: (e: React.MouseEvent) => void;
  onToggleMute: (e: React.MouseEvent) => void;
  onOpenTheater: () => void;
  setVideoRef: (el: HTMLVideoElement | null) => void;
}

const ThreeDCard: React.FC<ThreeDCardProps> = ({
  project,
  isPlaying,
  isMuted,
  onTogglePlay,
  onToggleMute,
  onOpenTheater,
  setVideoRef,
}) => {
  const [isInView, setIsInView] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        setIsInView(entry.isIntersecting);
      },
      { threshold: 0.1, rootMargin: "300px 0px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={cardRef}
      className="group relative bg-[#0c0c0c] border border-neutral-800/90 hover:border-neutral-500 rounded-3xl overflow-hidden shadow-[0_20px_45px_rgba(0,0,0,0.6)] hover:shadow-[0_25px_60px_-15px_rgba(255,59,48,0.22)] transition-all duration-500 ease-out hover:-translate-y-2 flex flex-col text-white cursor-pointer"
      onClick={onOpenTheater}
    >
      {/* Full-Card Video Player View */}
      <div className="relative aspect-[16/10] w-full bg-neutral-950 overflow-hidden">
        <video
          ref={setVideoRef}
          src={isInView ? project.videoUrl : undefined}
          poster={project.posterUrl}
          autoPlay={isInView}
          loop
          muted={isMuted}
          playsInline
          preload="none"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40 pointer-events-none transition-opacity duration-300 group-hover:opacity-60" />

        {/* Top Bar: Playback Controls & Expand */}
        <div className="absolute top-3 inset-x-3 flex items-center justify-between pointer-events-auto">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/80 backdrop-blur-md text-[10px] font-mono uppercase tracking-wider text-white border border-white/15 shadow-md">
            <span className="w-1.5 h-1.5 rounded-full bg-[#ff3b30] shadow-[0_0_6px_#ff3b30] animate-pulse" />
            <span>4K REEL</span>
          </div>

          <div className="flex items-center gap-1 bg-black/80 backdrop-blur-md border border-white/15 rounded-full p-0.5 shadow-lg">
            {/* Play / Pause */}
            <button
              type="button"
              onClick={onTogglePlay}
              className="w-7 h-7 rounded-full flex items-center justify-center text-white/80 hover:text-white hover:bg-white/20 active:scale-90 transition-all cursor-pointer"
              title={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
            </button>

            {/* Mute / Unmute */}
            <button
              type="button"
              onClick={onToggleMute}
              className="w-7 h-7 rounded-full flex items-center justify-center text-white/80 hover:text-white hover:bg-white/20 active:scale-90 transition-all cursor-pointer"
              title={isMuted ? "Unmute" : "Mute"}
            >
              {isMuted ? (
                <VolumeX className="w-3.5 h-3.5" />
              ) : (
                <Volume2 className="w-3.5 h-3.5" />
              )}
            </button>

            {/* Fullscreen Expand */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onOpenTheater();
              }}
              className="w-7 h-7 rounded-full flex items-center justify-center text-white/80 hover:text-white hover:bg-white/20 active:scale-90 transition-all cursor-pointer"
              title="Fullscreen Theater View"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Center Hover Play Icon */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="relative flex items-center justify-center">
            <span className="absolute w-14 h-14 rounded-full bg-[#ff3b30]/30 animate-ping" />
            <div className="relative w-12 h-12 rounded-full bg-white text-black flex items-center justify-center shadow-2xl backdrop-blur-md scale-90 group-hover:scale-110 transition-transform duration-300">
              <Play className="w-5 h-5 fill-current translate-x-0.5 text-[#ff3b30]" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const DEFAULT_THREED_PROJECTS: ThreeDProject[] = [
  {
    id: "hyperion-villa",
    title: "Hyperion Ultra-Luxury Villa Walkthrough",
    category: "Architecture & Interiors",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    posterUrl: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=900&auto=format&fit=crop&fm=webp",
    duration: "0:15 // 4K",
  },
  {
    id: "chronos-watch-cgi",
    title: "Chronos Tourbillon 3D Product Film",
    category: "Product Visualization",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
    posterUrl: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=900&auto=format&fit=crop&fm=webp",
    duration: "0:12 // 4K",
  },
  {
    id: "lumina-car-reel",
    title: "Aether EV Cinematic Launch Reel",
    category: "Automotive CGI",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    posterUrl: "https://images.unsplash.com/photo-1617788138017-80ad40651399?q=80&w=900&auto=format&fit=crop&fm=webp",
    duration: "0:18 // 4K",
  },
];

export const ThreeDProjects: React.FC = () => {
  const [projects, setProjects] = useState<ThreeDProject[]>(() => {
    const cached = getApiCache<ThreeDProject[]>("threed_projects");
    return cached && cached.length > 0 ? cached : DEFAULT_THREED_PROJECTS;
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [activeTheaterProject, setActiveTheaterProject] = useState<ThreeDProject | null>(null);
  const [playingStates, setPlayingStates] = useState<{ [key: string]: boolean }>({});
  const [mutedStates, setMutedStates] = useState<{ [key: string]: boolean }>({});
  const videoRefs = useRef<{ [key: string]: HTMLVideoElement | null }>({});

  // Initial fetch from API / Database only if not cached, + Socket.IO listener for real-time synchronization
  useEffect(() => {
    const fetchThreeD = async () => {
      try {
        const res = await userService.getThreeD();
        const items = Array.isArray(res)
          ? res
          : Array.isArray((res as any)?.items)
          ? (res as any).items
          : Array.isArray((res as any)?.data)
          ? (res as any).data
          : [];
        if (items.length > 0) {
          setProjects(items);
          setApiCache("threed_projects", items);
        }
      } catch (err) {
        console.warn("Could not load 3D projects from database, using defaults:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchThreeD();

    const unsubscribeUpdate = onSocketEvent("threed:updated", (updatedProject: any) => {
      if (!updatedProject) return;
      setProjects((prev) => {
        const updated = prev.map((p) => (String(p.id) === String(updatedProject.id || updatedProject._id) ? { ...p, ...updatedProject } : p));
        setApiCache("threed_projects", updated);
        if (updatedProject.posterUrl) preloadMediaList([updatedProject.posterUrl], { priority: "low" });
        return updated;
      });
    });

    const unsubscribeCreate = onSocketEvent("threed:created", (newProject: any) => {
      if (!newProject) return;
      setProjects((prev) => {
        const exists = prev.some((p) => String(p.id) === String(newProject.id || newProject._id));
        if (exists) return prev;
        const updated = [newProject, ...prev];
        setApiCache("threed_projects", updated);
        if (newProject.posterUrl) preloadMediaList([newProject.posterUrl], { priority: "low" });
        return updated;
      });
    });

    const unsubscribeDelete = onSocketEvent("threed:deleted", (deletedId: string) => {
      setProjects((prev) => {
        const updated = prev.filter((p) => String(p.id) !== String(deletedId));
        setApiCache("threed_projects", updated);
        return updated;
      });
    });

    return () => {
      unsubscribeUpdate();
      unsubscribeCreate();
      unsubscribeDelete();
    };
  }, []);

  // Lock body scroll when theater modal is open
  useEffect(() => {
    if (activeTheaterProject) {
      document.body.classList.add("modal-open");
      (window as any).lenis?.stop();
    } else {
      document.body.classList.remove("modal-open");
      (window as any).lenis?.start();
    }

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setActiveTheaterProject(null);
      }
    };
    window.addEventListener("keydown", handleEscape);
    return () => {
      window.removeEventListener("keydown", handleEscape);
      document.body.classList.remove("modal-open");
    };
  }, [activeTheaterProject]);

  const toggleInlinePlay = useCallback((id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const vid = videoRefs.current[id];
    if (!vid) return;

    if (vid.paused) {
      vid.play().catch(() => {});
      setPlayingStates((prev) => ({ ...prev, [id]: true }));
    } else {
      vid.pause();
      setPlayingStates((prev) => ({ ...prev, [id]: false }));
    }
  }, []);

  const toggleInlineMute = useCallback((id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const vid = videoRefs.current[id];
    if (!vid) return;

    vid.muted = !vid.muted;
    setMutedStates((prev) => ({ ...prev, [id]: vid.muted }));
  }, []);

  const handleCloseTheater = useCallback(() => {
    setActiveTheaterProject(null);
  }, []);

  const sectionRef = useRef<HTMLElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // GSAP ScrollTrigger: Section scales up to normal size & cards animate up from bottom with 3D rotation
  useEffect(() => {
    const section = sectionRef.current;
    const container = containerRef.current;
    if (!section || !container) return;

    const ctx = gsap.context(() => {
      const isMobile = window.innerWidth < 768;
      const startY = isMobile ? 85 : 140;
      const startRotX = isMobile ? 15 : 22;

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: isMobile ? "top 88%" : "top 80%",
          toggleActions: "play none none reverse",
          invalidateOnRefresh: true,
        },
      });

      // 1. Expand section from scale down to normal
      tl.fromTo(
        container,
        {
          scale: 0.88,
          opacity: 0.45,
          transformOrigin: "center top",
        },
        {
          scale: 1,
          opacity: 1,
          duration: 0.9,
          ease: "power3.out",
        }
      );

      // 2. Group of cards animate from bottom to original position with 3D rotation
      tl.fromTo(
        ".threed-card-item",
        {
          y: startY,
          rotationX: startRotX,
          rotationZ: (i) => (i % 2 === 0 ? -4 : 4),
          rotationY: (i) => (i % 3 === 0 ? -3 : i % 3 === 2 ? 3 : 0),
          scale: 0.92,
          opacity: 0,
          transformOrigin: "center bottom",
        },
        {
          y: 0,
          rotationX: 0,
          rotationZ: 0,
          rotationY: 0,
          scale: 1,
          opacity: 1,
          duration: 0.95,
          stagger: 0.12,
          ease: "power3.out",
          clearProps: "transform",
        },
        "-=0.6"
      );
    }, section);

    return () => ctx.revert();
  }, [projects.length]);

  return (
    <section
      ref={sectionRef}
      id="threed-section"
      className="relative z-10 w-full px-6 sm:px-10 md:px-12 lg:px-16 pt-6 sm:pt-10 pb-16 sm:pb-24 bg-transparent text-[#121110] font-['Plus_Jakarta_Sans',sans-serif]"
    >
      <div
        ref={containerRef}
        className="w-full max-w-8xl mx-auto flex flex-col gap-10 sm:gap-14 origin-top will-change-transform"
      >
        {/* 3D Pure Videos Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 [perspective:1200px]">
          {isLoading ? (
            <div className="col-span-full py-20 flex flex-col items-center justify-center gap-3">
              <div className="w-8 h-8 rounded-full border-2 border-red-500/30 border-t-red-500 animate-spin" />
              <span className="text-xs font-mono uppercase tracking-widest text-neutral-500">Loading 3D Showcases...</span>
            </div>
          ) : projects.length === 0 ? (
            <div className="col-span-full py-20 flex flex-col items-center justify-center text-center">
              <div className="text-stone-400 text-sm font-mono uppercase tracking-widest">
                No 3D showcase videos available in the database.
              </div>
            </div>
          ) : (
            projects.map((project, index) => {
              const isPlaying = playingStates[project.id] ?? true;
              const isMuted = mutedStates[project.id] ?? true;

              return (
                <div
                  key={project.id || index}
                  className="threed-card-item will-change-transform [transform-style:preserve-3d]"
                >
                  <ThreeDCard
                    project={project}
                    isPlaying={isPlaying}
                    isMuted={isMuted}
                    onTogglePlay={(e) => toggleInlinePlay(project.id, e)}
                    onToggleMute={(e) => toggleInlineMute(project.id, e)}
                    onOpenTheater={() => setActiveTheaterProject(project)}
                    setVideoRef={(el) => {
                      videoRefs.current[project.id] = el;
                    }}
                  />
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* FULLSCREEN 3D CINEMA THEATER MODAL */}
      {activeTheaterProject && (
        <TheaterModal
          project={activeTheaterProject}
          onClose={handleCloseTheater}
        />
      )}
    </section>
  );
};

const TheaterModal: React.FC<{
  project: ThreeDProject;
  onClose: () => void;
}> = ({ project, onClose }) => {
  const theaterPoster = useCachedMedia(project.posterUrl);

  return createPortal(
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-[9999999] bg-black/85 backdrop-blur-xl flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-300 pointer-events-auto cursor-pointer"
    >
      <div className="relative w-full max-w-5xl max-h-[92vh] bg-[#0c0c0c] border border-neutral-800 rounded-3xl overflow-hidden shadow-[0_30px_90px_rgba(0,0,0,0.9)] flex flex-col my-auto animate-in zoom-in-95 duration-300 text-white cursor-default">
        {/* Top Modal Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-neutral-800/90 bg-neutral-950 shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#ff3b30] animate-pulse shadow-[0_0_8px_#ff3b30]" />
            <span className="font-mono text-xs uppercase tracking-widest text-neutral-300">
              4K Ultra-HD 3D Showcase Video
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Fullscreen Video Player */}
        <div className="relative w-full aspect-video max-h-[75vh] bg-black flex items-center justify-center overflow-hidden">
          <video
            src={project.videoUrl}
            poster={theaterPoster || project.posterUrl}
            autoPlay
            controls
            playsInline
            className="w-full h-full object-contain"
          />
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ThreeDProjects;
