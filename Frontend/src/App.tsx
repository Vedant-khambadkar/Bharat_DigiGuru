import { useEffect, useRef, useState, useCallback, lazy, Suspense } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import Home from "./pages/Home";
import Services from "./pages/Services";
import About from "./pages/About";
import MissionVision from "./pages/MissionVision";
import ToolsAndTechnology from "./pages/ToolsAndTechnology";
import PlatformsWeManage from "./pages/PlatformsWeManage";
import Process from "./pages/Process";
import Portfolio, { preloadPortfolioAssets } from "./pages/Portfolio";
import ThreeDProjects from "./pages/ThreeDProjects";
import WorkWithUs from "./pages/WhyWorkWithUs";
import OurTeam from "./pages/OurTeam";
import Blogs from "./pages/Blogs";
import ClientProposals from "./pages/ClientProposals";
import Contact from "./pages/Contact";
import Footer from "./components/Footer";
import Navbar from "./components/Navbar";
import TopHeader from "./components/TopHeader";
import Preloader3D from "./components/Preloader/Preloader3D";

// Lazy-load Admin routes & modals so they don't bloat the main landing page bundle
const AdminAuthModal = lazy(() => import("./components/Admin/AdminAuthModal"));
const AdminDashboardModal = lazy(() => import("./components/Admin/AdminDashboardModal"));
const AdminLoginPage = lazy(() => import("./pages/AdminLoginPage"));
const AdminDashboardPage = lazy(() => import("./pages/AdminDashboardPage"));

gsap.registerPlugin(ScrollTrigger);

const MainLandingPage = () => {
  const boxRef = useRef<HTMLDivElement>(null);
  const mainContentRef = useRef<HTMLDivElement>(null);

  const [isLoading, setIsLoading] = useState(true);

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

    // Check on initial load
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

  // Triggered concurrently the exact moment the preloader begins sliding up
  const handleStartPageReveal = useCallback(() => {
    (window as any).lenis?.start();
    window.dispatchEvent(new CustomEvent("start-hero-letters"));
    const homeSection = document.getElementById("home-section");
    if (homeSection) {
      gsap.fromTo(
        homeSection,
        { opacity: 0.3, scale: 0.96 },
        {
          opacity: 1,
          scale: 1,
          duration: 1.5,
          ease: "power3.out",
          clearProps: "all",
          onComplete: () => {
            ScrollTrigger.refresh();
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
    ScrollTrigger.refresh();
  }, []);

  // Background idle preloading of 3D Portfolio data & textures after Preloader exits
  useEffect(() => {
    if (isLoading) return;

    let isDisposed = false;
    const triggerPortfolioPreload = () => {
      if (isDisposed) return;
      preloadPortfolioAssets();
    };

    if ("requestIdleCallback" in window) {
      const idleId = (window as any).requestIdleCallback(triggerPortfolioPreload, { timeout: 1200 });
      return () => {
        isDisposed = true;
        if ("cancelIdleCallback" in window) {
          (window as any).cancelIdleCallback(idleId);
        }
      };
    } else {
      const timerId = setTimeout(triggerPortfolioPreload, 600);
      return () => {
        isDisposed = true;
        clearTimeout(timerId);
      };
    }
  }, [isLoading]);

  // Global Lenis Smooth Momentum Scrolling synchronized with GSAP ScrollTrigger
  useEffect(() => {
    if ("scrollRestoration" in history) {
      history.scrollRestoration = "manual";
    }
    window.scrollTo(0, 0);

    const isMobile = window.innerWidth < 768;

    const lenis = new Lenis({
      duration: isMobile ? 1.0 : 1.25,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 0.92,
      touchMultiplier: 1.0,
      infinite: false,
      autoRaf: false,
    });

    (window as any).lenis = lenis;

    lenis.scrollTo(0, { immediate: true });
    window.scrollTo(0, 0);

    if (isLoading) {
      lenis.stop();
    } else {
      lenis.start();
    }

    lenis.on("scroll", () => {
      ScrollTrigger.update();
    });

    const tickerCallback = (time: number) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(tickerCallback);
    gsap.ticker.lagSmoothing(500, 33);

    const handleBeforeUnload = () => {
      window.scrollTo(0, 0);
    };
    window.addEventListener("beforeunload", handleBeforeUnload);

    let resizeTimer: number;
    const handleResize = () => {
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

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("resize", handleResize);
      document.removeEventListener("click", handleAnchorClick);
      clearTimeout(resizeTimer);
      gsap.ticker.remove(tickerCallback);
      lenis.destroy();
      delete (window as any).lenis;
    };
  }, [isLoading]);

  // Layout Synchronization: Auto-refresh ScrollTrigger & Lenis whenever dynamic content changes height
  useEffect(() => {
    if (!mainContentRef.current) return;

    let timeoutId: number | null = null;
    const resizeObserver = new ResizeObserver(() => {
      if (timeoutId) window.clearTimeout(timeoutId);
      timeoutId = window.setTimeout(() => {
        (window as any).lenis?.resize();
        ScrollTrigger.refresh();
      }, 60);
    });

    resizeObserver.observe(mainContentRef.current);

    return () => {
      if (timeoutId) window.clearTimeout(timeoutId);
      resizeObserver.disconnect();
    };
  }, []);

  // Custom Cursor Box with Lens interaction
  useEffect(() => {
    const box = boxRef.current;
    if (!box) return;

    gsap.set(box, {
      xPercent: -50,
      yPercent: -50,
      opacity: 0,
    });

    const xTo = gsap.quickTo(box, "x", { duration: 0.18, ease: "power3.out" });
    const yTo = gsap.quickTo(box, "y", { duration: 0.18, ease: "power3.out" });

    let isOverText = false;
    let isInitialized = false;
    let scrollTimer: number | null = null;

    const updateHoverState = (target: HTMLElement | null) => {
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
            duration: 0.25,
            ease: "back.out(1.7)",
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
            duration: 0.25,
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

    const handleScroll = () => {
      if (!isInitialized) return;

      if (!isOverText) {
        gsap.to(box, {
          scaleY: 1.25,
          scaleX: 0.85,
          duration: 0.1,
          overwrite: "auto",
        });
      }

      if (scrollTimer) window.clearTimeout(scrollTimer);
      scrollTimer = window.setTimeout(() => {
        if (!isOverText) {
          gsap.to(box, {
            scaleY: 1,
            scaleX: 1,
            duration: 0.2,
            ease: "power2.out",
          });
        }
      }, 80);
    };

    const handleMouseLeave = () => {
      gsap.to(box, { opacity: 0, duration: 0.2 });
      isOverText = false;
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("scroll", handleScroll, { passive: true });
    document.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("mouseleave", handleMouseLeave);
      if (scrollTimer) window.clearTimeout(scrollTimer);
    };
  }, []);

  return (
    <>
      {/* Red Cursor Box with GSAP Tracking & Targeting Lens */}
      <div
        ref={boxRef}
        className="w-1 h-1 rounded-full z-50 fixed top-0 left-0 pointer-events-none flex items-center justify-center transition-opacity"
      />

      {/* 3D Preloader Overlay */}
      {isLoading && (
        <Preloader3D
          onStartExit={handleStartPageReveal}
          onComplete={handlePreloaderComplete}
        />
      )}

      {/* Top Sticky Animated Logo */}
      <TopHeader />

      {/* Floating Glassmorphism Navbar */}
      <Navbar />

      {/* Main Sections Flow */}
      <main ref={mainContentRef} className="relative z-10 w-full overflow-x-hidden">
        <Home />
        <Services />
        <PlatformsWeManage />
        <Portfolio />
        <ThreeDProjects />
        <ToolsAndTechnology />
        <MissionVision />
        <Process />
        <About />
        <OurTeam />
        <WorkWithUs />
        <ClientProposals />
        <Blogs />
        <Contact />
        <Footer />
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