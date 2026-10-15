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
import { useResponsiveTier } from "../hooks/useResponsiveTier";

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
  canPlay: boolean;
  priority?: boolean;
  onTogglePlay: (e: React.MouseEvent) => void;
  onToggleMute: (e: React.MouseEvent) => void;
  onOpenTheater: () => void;
  setVideoRef: (el: HTMLVideoElement | null) => void;
  onVisibilityChange: (id: string, ratio: number) => void;
}

const ThreeDCard: React.FC<ThreeDCardProps> = ({
  project,
  isPlaying,
  isMuted,
  canPlay,
  priority = false,
  onTogglePlay,
  onToggleMute,
  onOpenTheater,
  setVideoRef,
  onVisibilityChange,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const [isVideoReady, setIsVideoReady] = useState(false);

  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        onVisibilityChange(project.id, entry.isIntersecting ? entry.intersectionRatio : 0);
      },
      { threshold: [0, 0.25, 0.5, 0.75, 1], rootMargin: "80px 0px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [project.id, onVisibilityChange]);

  // Synchronize playback with canPlay policy
  useEffect(() => {
    const vid = localVideoRef.current;
    if (!vid) return;

    if (canPlay && isPlaying) {
      const playPromise = vid.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // Auto-play was prevented by browser policy
        });
      }
    } else {
      vid.pause();
    }
  }, [canPlay, isPlaying]);

  // Sanitize poster - never display default Unsplash or stock photos
  const cleanPoster =
    project.posterUrl &&
    !project.posterUrl.includes("unsplash.com") &&
    !project.posterUrl.includes("placeholder")
      ? project.posterUrl
      : undefined;

  // Append #t=0.001 to instruct modern browsers to immediately render the first frame of the video
  const videoSrc = project.videoUrl
    ? project.videoUrl.includes("#t=")
      ? project.videoUrl
      : `${project.videoUrl}#t=0.001`
    : "";

  return (
    <div
      ref={cardRef}
      className="group relative bg-[#0c0c0c] border border-neutral-800/90 hover:border-neutral-500 rounded-3xl overflow-hidden shadow-[0_20px_45px_rgba(0,0,0,0.6)] hover:shadow-[0_25px_60px_-15px_rgba(255,59,48,0.22)] transition-all duration-300 ease-out flex flex-col text-white cursor-pointer"
      onClick={onOpenTheater}
    >
      {/* Full-Card Video Player View */}
      <div className="relative aspect-[16/10] w-full bg-neutral-950 overflow-hidden">
        {/* Loading Shimmer / Frame placeholder */}
        {!isVideoReady && !cleanPoster && (
          <div className="absolute inset-0 bg-[#0e0e10] flex items-center justify-center pointer-events-none">
            <div className="flex flex-col items-center gap-2">
              <span className="w-5 h-5 rounded-full border-2 border-white/10 border-t-[#ff3b30] animate-spin" />
              <span className="text-[10px] font-mono tracking-widest uppercase text-neutral-500">Loading 4K Reel</span>
            </div>
          </div>
        )}

        {/* Video Player (Always mounted in DOM for instantaneous first-frame decode) */}
        {videoSrc ? (
          <video
            ref={(el) => {
              localVideoRef.current = el;
              setVideoRef(el);
            }}
            src={videoSrc}
            poster={cleanPoster}
            loop
            muted={isMuted}
            playsInline
            preload={priority ? "auto" : "metadata"}
            onLoadedData={() => setIsVideoReady(true)}
            onCanPlay={() => setIsVideoReady(true)}
            className={`w-full h-full object-cover transition-all duration-500 ease-out ${
              isVideoReady || cleanPoster ? "opacity-100" : "opacity-0"
            }`}
          />
        ) : null}

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40 pointer-events-none transition-opacity duration-300 group-hover:opacity-60" />

        {/* Top Bar: Playback Controls & Expand */}
        <div className="absolute top-3 inset-x-3 flex items-center justify-between pointer-events-auto">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/80 text-[10px] font-mono uppercase tracking-wider text-white border border-white/15 shadow-md">
            <span className="w-1.5 h-1.5 rounded-full bg-[#ff3b30] shadow-[0_0_6px_#ff3b30] animate-pulse" />
            <span>4K REEL</span>
          </div>

          <div className="flex items-center gap-1 bg-black/80 border border-white/15 rounded-full p-0.5 shadow-lg">
            {/* Play / Pause */}
            <button
              type="button"
              onClick={onTogglePlay}
              className="w-7 h-7 rounded-full flex items-center justify-center text-white/80 hover:text-white hover:bg-white/20 active:scale-90 transition-all cursor-pointer"
              title={isPlaying && canPlay ? "Pause" : "Play"}
            >
              {isPlaying && canPlay ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
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
        {(!canPlay || !isPlaying) && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none transition-opacity duration-300">
            <div className="relative flex items-center justify-center">
              <span className="absolute w-12 h-12 rounded-full bg-[#ff3b30]/30 animate-ping" />
              <div className="relative w-10 h-10 rounded-full bg-white text-black flex items-center justify-center shadow-2xl scale-95 group-hover:scale-105 transition-transform duration-300">
                <Play className="w-4 h-4 fill-current translate-x-0.5 text-[#ff3b30]" />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export const ThreeDProjects: React.FC = () => {
  const [projects, setProjects] = useState<ThreeDProject[]>(() => {
    const cached = getApiCache<ThreeDProject[]>("threed_projects");
    if (cached && cached.length > 0) {
      return cached.map((p) => ({
        ...p,
        posterUrl:
          p.posterUrl &&
          (p.posterUrl.includes("unsplash.com") || p.posterUrl.includes("placeholder"))
            ? ""
            : p.posterUrl,
      }));
    }
    return [];
  });
  const [isLoading, setIsLoading] = useState<boolean>(() => projects.length === 0);
  const [activeTheaterProject, setActiveTheaterProject] = useState<ThreeDProject | null>(null);
  const [playingStates, setPlayingStates] = useState<{ [key: string]: boolean }>({});
  const [mutedStates, setMutedStates] = useState<{ [key: string]: boolean }>({});
  const [visibleRatios, setVisibleRatios] = useState<{ [key: string]: number }>({});
  const videoRefs = useRef<{ [key: string]: HTMLVideoElement | null }>({});

  const { isMobile, maxSimultaneousVideos } = useResponsiveTier();

  // Centralized Visibility Tracker
  const handleCardVisibilityChange = useCallback((id: string, ratio: number) => {
    setVisibleRatios((prev) => {
      if (prev[id] === ratio) return prev;
      return { ...prev, [id]: ratio };
    });
  }, []);

  // Compute allowed playing video IDs based on capability tier policy
  const allowedPlayIds = React.useMemo(() => {
    if (activeTheaterProject) {
      return new Set<string>(); // Pause all background videos when theater is open
    }

    // Sort visible projects by intersection ratio (highest visibility first)
    const sorted = Object.entries(visibleRatios)
      .filter(([_, ratio]) => ratio > 0.2)
      .sort((a, b) => b[1] - a[1])
      .map(([id]) => id);

    // Limit active playing videos to maximum simultaneous decoders
    const limit = Math.max(1, maxSimultaneousVideos || (isMobile ? 1 : 3));
    return new Set(sorted.slice(0, limit));
  }, [visibleRatios, maxSimultaneousVideos, isMobile, activeTheaterProject]);

  // Initial fetch from API / Database only if not cached, + Socket.IO listener for real-time synchronization
  useEffect(() => {
    const fetchThreeD = async () => {
      try {
        const res = await userService.getThreeD();
        const rawItems = Array.isArray(res)
          ? res
          : Array.isArray((res as any)?.items)
          ? (res as any).items
          : Array.isArray((res as any)?.data)
          ? (res as any).data
          : [];
        const items = rawItems.map((p: any) => ({
          ...p,
          posterUrl:
            p.posterUrl &&
            (p.posterUrl.includes("unsplash.com") || p.posterUrl.includes("placeholder"))
              ? ""
              : p.posterUrl,
        }));
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
      const cleanProject = {
        ...updatedProject,
        posterUrl:
          updatedProject.posterUrl &&
          (updatedProject.posterUrl.includes("unsplash.com") || updatedProject.posterUrl.includes("placeholder"))
            ? ""
            : updatedProject.posterUrl,
      };
      setProjects((prev) => {
        const updated = prev.map((p) => (String(p.id) === String(cleanProject.id || cleanProject._id) ? { ...p, ...cleanProject } : p));
        setApiCache("threed_projects", updated);
        return updated;
      });
    });

    const unsubscribeCreate = onSocketEvent("threed:created", (newProject: any) => {
      if (!newProject) return;
      const cleanProject = {
        ...newProject,
        posterUrl:
          newProject.posterUrl &&
          (newProject.posterUrl.includes("unsplash.com") || newProject.posterUrl.includes("placeholder"))
            ? ""
            : newProject.posterUrl,
      };
      setProjects((prev) => {
        const exists = prev.some((p) => String(p.id) === String(cleanProject.id || cleanProject._id));
        if (exists) return prev;
        const updated = [cleanProject, ...prev];
        setApiCache("threed_projects", updated);
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

  // Pause all playing videos when browser tab is backgrounded
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        Object.values(videoRefs.current).forEach((vid) => {
          if (vid && !vid.paused) vid.pause();
        });
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
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

  // GSAP ScrollTrigger: Section entrance animation optimized for device capability
  useEffect(() => {
    const section = sectionRef.current;
    const container = containerRef.current;
    if (!section || !container) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: isMobile ? "top 90%" : "top 80%",
          toggleActions: "play none none reverse",
          invalidateOnRefresh: true,
        },
      });

      // 1. Expand section smoothly
      tl.fromTo(
        container,
        {
          opacity: 0.5,
          scale: isMobile ? 0.98 : 0.92,
        },
        {
          opacity: 1,
          scale: 1,
          duration: 0.6,
          ease: "power2.out",
        }
      );

      // 2. Staggered card entrance: Simple Y on mobile, full 3D rotation on desktop
      if (isMobile) {
        tl.fromTo(
          ".threed-card-item",
          {
            y: 40,
            opacity: 0,
          },
          {
            y: 0,
            opacity: 1,
            duration: 0.5,
            stagger: 0.08,
            ease: "power2.out",
            clearProps: "transform",
          },
          "-=0.4"
        );
      } else {
        tl.fromTo(
          ".threed-card-item",
          {
            y: 120,
            rotationX: 18,
            rotationZ: (i) => (i % 2 === 0 ? -3 : 3),
            scale: 0.94,
            opacity: 0,
            transformOrigin: "center bottom",
          },
          {
            y: 0,
            rotationX: 0,
            rotationZ: 0,
            scale: 1,
            opacity: 1,
            duration: 0.85,
            stagger: 0.1,
            ease: "power3.out",
            clearProps: "transform",
          },
          "-=0.4"
        );
      }
    }, section);

    return () => ctx.revert();
  }, [projects.length, isMobile]);

  return (
    <section
      ref={sectionRef}
      id="threed-section"
      className="relative z-10 w-full px-4 sm:px-8 md:px-12 lg:px-16 pt-6 sm:pt-10 pb-16 sm:pb-24 bg-[#050505] text-white font-['Plus_Jakarta_Sans',sans-serif]"
    >
      <div
        ref={containerRef}
        className="w-full max-w-8xl mx-auto flex flex-col gap-8 sm:gap-12"
      >
        {/* 3D Pure Videos Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
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
              const canPlay = allowedPlayIds.has(project.id);

              return (
                <div
                  key={project.id || index}
                  className="threed-card-item will-change-transform"
                >
                  <ThreeDCard
                    project={project}
                    isPlaying={isPlaying}
                    isMuted={isMuted}
                    canPlay={canPlay}
                    priority={index < (isMobile ? 2 : 3)}
                    onTogglePlay={(e) => toggleInlinePlay(project.id, e)}
                    onToggleMute={(e) => toggleInlineMute(project.id, e)}
                    onOpenTheater={() => setActiveTheaterProject(project)}
                    setVideoRef={(el) => {
                      videoRefs.current[project.id] = el;
                    }}
                    onVisibilityChange={handleCardVisibilityChange}
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
          isMobile={isMobile}
        />
      )}
    </section>
  );
};

const TheaterModal: React.FC<{
  project: ThreeDProject;
  onClose: () => void;
  isMobile: boolean;
}> = ({ project, onClose, isMobile }) => {
  const cleanPoster =
    project.posterUrl &&
    !project.posterUrl.includes("unsplash.com") &&
    !project.posterUrl.includes("placeholder")
      ? project.posterUrl
      : undefined;

  const videoSrc = project.videoUrl
    ? project.videoUrl.includes("#t=")
      ? project.videoUrl
      : `${project.videoUrl}#t=0.001`
    : "";

  return createPortal(
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className={`fixed inset-0 z-[9999999] ${
        isMobile ? "bg-black/95" : "bg-black/85 backdrop-blur-md"
      } flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200 pointer-events-auto cursor-pointer`}
    >
      <div className="relative w-full max-w-5xl max-h-[92vh] bg-[#0c0c0c] border border-neutral-800 rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl flex flex-col my-auto text-white cursor-default">
        {/* Top Modal Header */}
        <div className="flex items-center justify-between px-4 sm:px-5 py-3 border-b border-neutral-800 bg-neutral-950 shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#ff3b30] animate-pulse" />
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
            src={videoSrc}
            poster={cleanPoster}
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
