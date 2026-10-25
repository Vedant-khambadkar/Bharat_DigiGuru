import { useEffect, useLayoutEffect, useRef, useState, useCallback, lazy, Suspense } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import Home from "./pages/Home";
import Services from "./pages/Services";
import BrandCollaborations from "./components/BrandCollaborations";
import Navbar from "./components/Navbar";
import TopHeader from "./components/TopHeader";
import Preloader3D from "./components/Preloader/Preloader3D";

import OurTeam from "./pages/OurTeam";
import PlatformsWeManage from "./pages/PlatformsWeManage";
import Portfolio from "./pages/Portfolio";
import ThreeDProjects from "./pages/ThreeDProjects";
import ToolsAndTechnology from "./pages/ToolsAndTechnology";
import Process from "./pages/Process";
import About from "./pages/About";
import MissionVision from "./pages/MissionVision";
import MilestoneShowcase from "./components/MilestoneShowcase";
import WorkWithUs from "./pages/WhyWorkWithUs";
import Blogs from "./pages/Blogs";
import Contact from "./pages/Contact";
import Footer from "./components/Footer";
import { userService } from "./services/service/userService";
import { onSocketEvent } from "./utils/socket";
import { getApiCache, setApiCache } from "./utils/apiCache";
import { getSectionIdFromPath, getNavTabFromPath, scrollToSection } from "./utils/routes";

// Lazy-load Admin routes & modals so they don't bloat the main landing page bundle
const AdminAuthModal = lazy(() => import("./components/Admin/AdminAuthModal"));
const AdminDashboardModal = lazy(() => import("./components/Admin/AdminDashboardModal"));
const AdminLoginPage = lazy(() => import("./pages/AdminLoginPage"));
const AdminDashboardPage = lazy(() => import("./pages/AdminDashboardPage"));

gsap.registerPlugin(ScrollTrigger);

// Prevent mobile viewport address-bar expansion/collapse from triggering ScrollTrigger layout recalculation
ScrollTrigger.config({
  ignoreMobileResize: true,
});

const MainLandingPage = () => {
  const boxRef = useRef<HTMLDivElement>(null);
  const mainContentRef = useRef<HTMLDivElement>(null);

  // Check if initial request is deep linking directly to a section (/services, /about, /portfolio, etc.)
  const initialSectionId = useRef<string | null>(getSectionIdFromPath(window.location.pathname));
  const isDeepLink = Boolean(initialSectionId.current && initialSectionId.current !== "home-section");

  // Bypass 3D preloader immediately when directly landing on an interior section
  const [isLoading, setIsLoading] = useState(!isDeepLink);
  const [macReady, setMacReady] = useState(false);
  const [businessmanReady, setBusinessmanReady] = useState(false);
  const [macFailed, setMacFailed] = useState(false);

  // Synchronous pre-paint jump on direct URL entry (/services, /about, etc.)
  useLayoutEffect(() => {
    if (!isDeepLink || !initialSectionId.current) return;
    const targetEl = document.getElementById(initialSectionId.current);
    if (targetEl) {
      targetEl.scrollIntoView({ behavior: "instant" });
    }
  }, [isDeepLink]);

  // Ensure hero title elements are primed so if the user scrolls up to Home, it is fully visible
  useEffect(() => {
    if (isDeepLink) {
      window.dispatchEvent(new CustomEvent("start-hero-letters"));
      const homeSection = document.getElementById("home-section");
      if (homeSection) {
        homeSection.style.opacity = "1";
      }
    }
  }, [isDeepLink]);

  // Team & Founder Section Visibility State (Persisted in DB & synced in real-time)
  const [teamSectionVisible, setTeamSectionVisible] = useState<boolean>(() => {
    const cached = getApiCache<any>("site_settings");
    return cached?.teamSectionVisible !== false;
  });

  useEffect(() => {
    userService
      .getSettings()
      .then((res: any) => {
        if (res && typeof res.teamSectionVisible === "boolean") {
          setTeamSectionVisible(res.teamSectionVisible);
        }
      })
      .catch((err) => {
        console.error("Failed to fetch public site settings:", err);
      });

    const unsubSettings = onSocketEvent("settings:updated", (settings: any) => {
      if (settings && typeof settings.teamSectionVisible === "boolean") {
        setTeamSectionVisible(settings.teamSectionVisible);
        setApiCache("site_settings", settings);
      }
    });

    const unsubTeamVisibility = onSocketEvent("team:visibility:updated", (payload: any) => {
      if (payload && typeof payload.teamSectionVisible === "boolean") {
        setTeamSectionVisible(payload.teamSectionVisible);
      }
    });

    return () => {
      unsubSettings();
      unsubTeamVisibility();
    };
  }, []);

  const hero3DReady = macReady || macFailed;

  const handleMacReady = useCallback(() => {
    setMacReady(true);
    if (typeof window !== "undefined" && (window as any).__BDG_PERF__) {
      (window as any).__BDG_PERF__.metrics.heroMacReadyTime = performance.now();
    }
  }, []);

  const handleMacError = useCallback((error: Error) => {
    console.error("[HERO] MacBook model failed:", error);
    setMacFailed(true);
  }, []);

  const handleBusinessmanReady = useCallback(() => {
    setBusinessmanReady(true);
    if (typeof window !== "undefined" && (window as any).__BDG_PERF__) {
      (window as any).__BDG_PERF__.metrics.businessmanReadyTime = performance.now();
    }
  }, []);

  const handleBusinessmanError = useCallback((error: Error) => {
    console.error("[TEAM] Businessman model failed:", error);
  }, []);


  const handleStartPageReveal = useCallback(() => {
    (window as any).lenis?.start();
    window.dispatchEvent(new CustomEvent("start-hero-letters"));
    const homeSection = document.getElementById("home-section");
    if (homeSection) {
      gsap.fromTo(
        homeSection,
        { opacity: 0.4 },
        {
          opacity: 1,
          duration: 1.2,
          ease: "power3.out",
          onComplete: () => {
            requestAnimationFrame(() => {
              ScrollTrigger.refresh();
            });
          },
        }
      );
    }
  }, []);

  const handlePreloaderComplete = useCallback(() => {
    setIsLoading(false);
    window.dispatchEvent(new CustomEvent("start-hero-letters"));
    (window as any).lenis?.scrollTo(0, { immediate: true });
    window.scrollTo(0, 0);
    requestAnimationFrame(() => {
      ScrollTrigger.refresh();
    });
  }, []);

  // Admin Portal State (for modal fallback if triggered from main site)
  const [isAdminAuthOpen, setIsAdminAuthOpen] = useState(false);
  const [isAdminDashboardOpen, setIsAdminDashboardOpen] = useState(false);

  const handleOpenAdminPortal = useCallback(() => {
    const token =
      localStorage.getItem("accessToken") ||
      sessionStorage.getItem("accessToken");
    if (token) {
      setIsAdminDashboardOpen(true);
    } else {
      setIsAdminAuthOpen(true);
    }
  }, []);

  const handleAdminLoginSuccess = useCallback(() => {
    setIsAdminAuthOpen(false);
    setIsAdminDashboardOpen(true);
  }, []);

  const handleAdminLogout = useCallback(() => {
    localStorage.removeItem("accessToken");
    sessionStorage.removeItem("accessToken");
    setIsAdminDashboardOpen(false);
  }, []);

  // Keyboard shortcut Ctrl+Shift+A, Custom Event, and URL (#admin or /admin) listener for Admin Access
  useEffect(() => {
    const checkAdminRoute = () => {
      if (window.location.pathname === "/admin") {
        handleOpenAdminPortal();
      }
    };

    checkAdminRoute();

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.code === "KeyA") {
        e.preventDefault();
        handleOpenAdminPortal();
      }
    };

    const handleOpenEvent = () => {
      handleOpenAdminPortal();
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("open-admin-portal", handleOpenEvent);
    window.addEventListener("hashchange", checkAdminRoute);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("open-admin-portal", handleOpenEvent);
      window.removeEventListener("hashchange", checkAdminRoute);
    };
  }, [handleOpenAdminPortal]);



  // Global Lenis Smooth Momentum Scrolling synchronized with GSAP ScrollTrigger
  useEffect(() => {
    if ("scrollRestoration" in history) {
      history.scrollRestoration = "manual";
    }
    if (!isDeepLink) {
      window.scrollTo(0, 0);
    }

    const isTouchDevice =
      typeof window !== "undefined" &&
      (window.innerWidth < 768 || window.matchMedia("(pointer: coarse)").matches);

    // On mobile touch devices, use native GPU-composited momentum scrolling to eliminate touch latency & freezing
    if (isTouchDevice) {
      const nativeLenisProxy = {
        start: () => {},
        stop: () => {},
        resize: () => {
          ScrollTrigger.refresh();
        },
        scrollTo: (target: any, options?: any) => {
          let top = 0;
          if (typeof target === "number") {
            top = target;
          } else if (target instanceof HTMLElement) {
            top = target.getBoundingClientRect().top + window.scrollY + (options?.offset || 0);
          } else if (typeof target === "string") {
            const el = document.querySelector(target);
            if (el) top = el.getBoundingClientRect().top + window.scrollY + (options?.offset || 0);
          }
          window.scrollTo({
            top,
            behavior: options?.immediate ? "instant" : "smooth",
          });
        },
        raf: () => {},
        on: () => {},
        off: () => {},
        destroy: () => {},
      };

      (window as any).lenis = nativeLenisProxy;

      let lastWidth = typeof window !== "undefined" ? window.innerWidth : 0;
      let resizeTimer: number;
      const handleResize = () => {
        // Ignore vertical address-bar resize events on mobile devices (only orientation change)
        if (window.innerWidth === lastWidth) return;
        lastWidth = window.innerWidth;
        clearTimeout(resizeTimer);
        resizeTimer = window.setTimeout(() => {
          ScrollTrigger.refresh();
        }, 200);
      };
      window.addEventListener("resize", handleResize, { passive: true });

      const handleAnchorClick = (e: MouseEvent) => {
        const target = (e.target as HTMLElement)?.closest("a[href^='#']");
        if (!target) return;
        const href = target.getAttribute("href");
        if (href && href.startsWith("#") && href.length > 1) {
          const targetEl = document.querySelector(href);
          if (targetEl) {
            e.preventDefault();
            targetEl.scrollIntoView({ behavior: "smooth" });
          }
        }
      };
      document.addEventListener("click", handleAnchorClick);

      return () => {
        clearTimeout(resizeTimer);
        window.removeEventListener("resize", handleResize);
        document.removeEventListener("click", handleAnchorClick);
        delete (window as any).lenis;
      };
    }

    const lenis = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 0.95,
      touchMultiplier: 0,
      syncTouch: false,
      infinite: false,
      autoRaf: false,
      prevent: (node) => {
        return Boolean(
          node.closest?.("[data-lenis-prevent='true']") ||
          document.body.classList.contains("modal-open")
        );
      },
    });

    (window as any).lenis = lenis;

    let lenisSafetyUnlock: number | undefined;

    if (!isDeepLink) {
      lenis.scrollTo(0, { immediate: true });
      window.scrollTo(0, 0);

      // Stop scrolling while initial hero transition runs; guarantee start via timeout
      lenis.stop();
      lenisSafetyUnlock = window.setTimeout(() => {
        lenis.start();
      }, 5000);
    } else {
      lenis.start();
      if (initialSectionId.current) {
        const targetEl = document.getElementById(initialSectionId.current);
        if (targetEl) {
          lenis.scrollTo(targetEl, { immediate: true });
        }
      }
    }

    lenis.on("scroll", () => {
      ScrollTrigger.update();
    });

    const tickerCallback = (time: number) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(tickerCallback);
    // Allow GSAP lag smoothing to smoothly recover from frame drops instead of locking up the UI
    gsap.ticker.lagSmoothing(500, 33);

    const handleBeforeUnload = () => {
      if (window.location.pathname === "/") {
        window.scrollTo(0, 0);
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);

    let lastDesktopWidth = typeof window !== "undefined" ? window.innerWidth : 0;
    let resizeTimer: number;
    const handleResize = () => {
      if (window.innerWidth === lastDesktopWidth) return;
      lastDesktopWidth = window.innerWidth;
      clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => {
        lenis.resize();
        ScrollTrigger.refresh();
      }, 150);
    };
    window.addEventListener("resize", handleResize, { passive: true });

    const handleAnchorClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement)?.closest("a[href^='#']");
      if (!target) return;
      const href = target.getAttribute("href");
      if (href && href.startsWith("#") && href.length > 1) {
        const targetEl = document.querySelector(href);
        if (targetEl) {
          e.preventDefault();
          lenis.scrollTo(targetEl as HTMLElement, {
            offset: 0,
            duration: 1.2,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
          });
        }
      }
    };
    document.addEventListener("click", handleAnchorClick);

    const handleVisibilityChange = () => {
      if (document.hidden) {
        lenis.stop();
        gsap.ticker.sleep();
      } else {
        lenis.start();
        gsap.ticker.wake();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("resize", handleResize);
      document.removeEventListener("click", handleAnchorClick);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      clearTimeout(resizeTimer);
      clearTimeout(lenisSafetyUnlock);
      gsap.ticker.remove(tickerCallback);
      lenis.destroy();
      delete (window as any).lenis;
    };
  }, [isDeepLink]);

  // Post-mount settlement for deep links once ScrollTrigger pins & DOM heights calibrate
  useEffect(() => {
    if (!isDeepLink || !initialSectionId.current) return;
    const targetId = initialSectionId.current;

    const settleScroll = (immediate = true) => {
      const targetEl = document.getElementById(targetId);
      if (!targetEl) return;
      const lenis = (window as any).lenis;
      if (lenis?.scrollTo) {
        lenis.scrollTo(targetEl, { immediate });
      } else {
        targetEl.scrollIntoView({ behavior: immediate ? "instant" : "smooth" });
      }
    };

    const rafId = requestAnimationFrame(() => {
      ScrollTrigger.refresh();
      settleScroll(true);
    });

    const timer1 = window.setTimeout(() => {
      ScrollTrigger.refresh();
      settleScroll(true);
    }, 120);

    const timer2 = window.setTimeout(() => {
      settleScroll(true);
    }, 380);

    return () => {
      cancelAnimationFrame(rafId);
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [isDeepLink]);

  // Popstate listener for browser Back / Forward buttons across sections
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      if (path.startsWith("/admin")) return;

      const targetId = getSectionIdFromPath(path);
      if (targetId) {
        scrollToSection(targetId, { immediate: false });
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  // Layout Synchronization: Auto-refresh ScrollTrigger & Lenis only when dynamic content changes genuinely and user is not scrolling
  useEffect(() => {
    if (!mainContentRef.current) return;

    let timeoutId: number | null = null;
    let isScrolling = false;
    let scrollTimeout: number;

    const onScroll = () => {
      isScrolling = true;
      clearTimeout(scrollTimeout);
      scrollTimeout = window.setTimeout(() => {
        isScrolling = false;
      }, 200);
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    let lastKnownHeight = mainContentRef.current.offsetHeight;
    let lastKnownWidth = mainContentRef.current.offsetWidth;

    const resizeObserver = new ResizeObserver(() => {
      const el = mainContentRef.current;
      if (!el) return;
      const newHeight = el.offsetHeight;
      const newWidth = el.offsetWidth;

      // Ignore address-bar height adjustments on mobile (< 120px height diff with unchanged width)
      const widthChanged = Math.abs(newWidth - lastKnownWidth) > 5;
      const significantHeightChange = Math.abs(newHeight - lastKnownHeight) > 120;

      if (!widthChanged && !significantHeightChange) return;

      lastKnownHeight = newHeight;
      lastKnownWidth = newWidth;

      // Do NOT trigger refresh while user is actively swiping or scrolling
      if (isScrolling) {
        if (timeoutId) clearTimeout(timeoutId);
        timeoutId = window.setTimeout(() => {
          (window as any).lenis?.resize();
          ScrollTrigger.refresh();
        }, 350);
        return;
      }

      if (timeoutId) window.clearTimeout(timeoutId);
      timeoutId = window.setTimeout(() => {
        (window as any).lenis?.resize();
        ScrollTrigger.refresh();
      }, 150);
    });

    resizeObserver.observe(mainContentRef.current);

    return () => {
      window.removeEventListener("scroll", onScroll);
      clearTimeout(scrollTimeout);
      if (timeoutId) window.clearTimeout(timeoutId);
      resizeObserver.disconnect();
    };
  }, []);

  // Custom Cursor Box with Lens interaction (Desktop pointer only)
  useEffect(() => {
    const box = boxRef.current;
    if (!box || !window.matchMedia("(pointer: fine)").matches) return;

    gsap.set(box, {
      xPercent: -50,
      yPercent: -50,
      opacity: 0,
    });

    const xTo = gsap.quickTo(box, "x", { duration: 0.15, ease: "power3.out" });
    const yTo = gsap.quickTo(box, "y", { duration: 0.15, ease: "power3.out" });

    let isOverText = false;
    let isInitialized = false;
    let hoverThrottle = 0;

    const updateHoverState = (target: HTMLElement | null) => {
      const now = Date.now();
      if (now - hoverThrottle < 50) return;
      hoverThrottle = now;

      const lensCandidate = target?.closest(
        "[data-lens-text='true'], h1, h2, h3, a, button"
      ) as HTMLElement | null;

      if (lensCandidate) {
        if (!isOverText) {
          isOverText = true;
          gsap.to(box, {
            scale: 3.2,
            backgroundColor: "rgba(250, 250, 250, 0.15)",
            borderColor: "#ffffff",
            borderWidth: "2px",
            boxShadow:
              "0 0 35px rgba(255, 255, 255, 0.85), inset 0 0 15px rgba(255, 255, 255, 0.4)",
            duration: 0.2,
            ease: "power2.out",
          });
        }
      } else {
        if (isOverText) {
          isOverText = false;
          gsap.to(box, {
            scale: 1,
            scaleX: 1,
            scaleY: 1,
            backgroundColor: "#8c7f7fff",
            borderColor: "rgba(248, 248, 248, 0.6)",
            borderWidth: "1px",
            boxShadow: "0 0 14px rgba(255, 255, 255, 0.8)",
            duration: 0.2,
            ease: "power2.out",
          });
        }
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isInitialized) {
        gsap.to(box, { opacity: 1, duration: 0.2 });
        isInitialized = true;
      }

      xTo(e.clientX);
      yTo(e.clientY);
      updateHoverState(e.target as HTMLElement);
    };

    const handleMouseLeave = () => {
      gsap.to(box, { opacity: 0, duration: 0.2 });
      isOverText = false;
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    document.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  return (
    <>
      {/* Red Cursor Box with GSAP Tracking & Targeting Lens */}
      <div
        ref={boxRef}
        className="hidden md:flex w-1 h-1 rounded-full z-50 fixed top-0 left-0 pointer-events-none items-center justify-center transition-opacity"
      />

      {/* 3D Preloader Overlay (Strictly tracks 3D model & asset loading) */}
      {isLoading && (
        <Preloader3D
          isReady={hero3DReady}
          macReady={macReady}
          businessmanReady={businessmanReady || !teamSectionVisible}
          onStartExit={handleStartPageReveal}
          onComplete={handlePreloaderComplete}
        />
      )}

      {/* Top Sticky Animated Logo */}
      <TopHeader />

      {/* Floating Glassmorphism Navbar */}
      <Navbar
        activeSection={getNavTabFromPath(window.location.pathname)}
        teamSectionVisible={teamSectionVisible}
      />

      {/* Main Sections Flow */}
      <main ref={mainContentRef} className="relative z-10 w-full overflow-x-clip">
        <Home onMacReady={handleMacReady} onMacError={handleMacError} />
        <BrandCollaborations />
        <Services />
        <PlatformsWeManage />
        <Portfolio />
        <ThreeDProjects />
        <ToolsAndTechnology />
        <Process />
        <About />
        <MissionVision />
        <MilestoneShowcase />
        {teamSectionVisible && (
          <OurTeam
            onBusinessmanReady={handleBusinessmanReady}
            onBusinessmanError={handleBusinessmanError}
          />
        )}
        <WorkWithUs />
        <Blogs />
        <Contact />
        <Footer teamSectionVisible={teamSectionVisible} />
      </main>

      {/* Admin Auth Modal */}
      {isAdminAuthOpen && (
        <Suspense fallback={null}>
          <AdminAuthModal
            isOpen={isAdminAuthOpen}
            onClose={() => setIsAdminAuthOpen(false)}
            onLoginSuccess={handleAdminLoginSuccess}
          />
        </Suspense>
      )}

      {/* Admin Dashboard Modal */}
      {isAdminDashboardOpen && (
        <Suspense fallback={null}>
          <AdminDashboardModal
            isOpen={isAdminDashboardOpen}
            onClose={() => setIsAdminDashboardOpen(false)}
            onLogout={handleAdminLogout}
          />
        </Suspense>
      )}
    </>
  );
};

const App = () => {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  if (currentPath === "/admin/login" || currentPath === "/admin/login/") {
    return (
      <Suspense fallback={<div className="w-screen h-screen bg-[#050505]" />}>
        <AdminLoginPage />
      </Suspense>
    );
  }

  if (
    currentPath === "/admin" ||
    currentPath === "/admin/" ||
    currentPath === "/admin/dashboard" ||
    currentPath === "/admin/dashboard/"
  ) {
    return (
      <Suspense fallback={<div className="w-screen h-screen bg-[#050505]" />}>
        <AdminDashboardPage />
      </Suspense>
    );
  }

  return <MainLandingPage />;
};

export default App;