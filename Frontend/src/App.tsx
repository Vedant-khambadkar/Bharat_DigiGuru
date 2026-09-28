import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import Home from "./pages/Home";
import Services from "./pages/Services";
import Process from "./pages/Process";
import PlatformsWeManage from "./pages/PlatformsWeManage";
import ToolsAndTechnology from "./pages/ToolsAndTechnology";
import WorkWithUs from "./pages/WorkWithUs";
import Portfolio from "./pages/Portfolio";
import ThreeDProjects from "./pages/ThreeDProjects";
import About from "./pages/About";
import Blogs from "./pages/Blogs";
import Contact from "./pages/Contact";
import Footer from "./components/Footer";
import Navbar from "./components/Navbar";
import TopHeader from "./components/TopHeader";
import Preloader3D from "./components/Preloader/Preloader3D";
import MissionVision from "./pages/MissionVision";
import AdminAuthModal from "./components/Admin/AdminAuthModal";
import AdminDashboardModal from "./components/Admin/AdminDashboardModal";
import AdminLoginPage from "./pages/AdminLoginPage";
import AdminDashboardPage from "./pages/AdminDashboardPage";

gsap.registerPlugin(ScrollTrigger);

const App = () => {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  // Listen to browser history navigation (back/forward)
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  // 1. DEDICATED SEPARATE PAGE: Admin Login (/admin/login)
  if (currentPath === "/admin/login" || currentPath === "/admin/login/") {
    return <AdminLoginPage />;
  }

  // 2. DEDICATED SEPARATE PAGE: Admin Dashboard (/admin or /admin/dashboard)
  if (
    currentPath === "/admin" ||
    currentPath === "/admin/" ||
    currentPath === "/admin/dashboard" ||
    currentPath === "/admin/dashboard/"
  ) {
    return <AdminDashboardPage />;
  }

  const boxRef = useRef<HTMLDivElement>(null);
  const hudRef = useRef<HTMLDivElement>(null);
  const mainContentRef = useRef<HTMLDivElement>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [framesProgress, setFramesProgress] = useState(0);
  const [isFramesReady, setIsFramesReady] = useState(false);

  // Admin Portal State (for modal fallback if triggered from main site)
  const [isAdminAuthOpen, setIsAdminAuthOpen] = useState(false);
  const [isAdminDashboardOpen, setIsAdminDashboardOpen] = useState(false);

  const handleOpenAdminPortal = () => {
    const token =
      localStorage.getItem("accessToken") ||
      sessionStorage.getItem("accessToken");
    if (token) {
      setIsAdminDashboardOpen(true);
    } else {
      setIsAdminAuthOpen(true);
    }
  };

  const handleAdminLoginSuccess = () => {
    setIsAdminAuthOpen(false);
    setIsAdminDashboardOpen(true);
  };

  const handleAdminLogout = () => {
    localStorage.removeItem("accessToken");
    sessionStorage.removeItem("accessToken");
    setIsAdminDashboardOpen(false);
  };

  // Keyboard shortcut Ctrl+Shift+A, Custom Event, and URL (#admin or /admin) listener for Admin Access
  useEffect(() => {
    const checkAdminRoute = () => {
      if (
        window.location.pathname === "/admin"
      ) {
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
  }, []);

  const handleFramesProgress = (progress: number, isComplete: boolean) => {
    setFramesProgress(progress);
    if (isComplete) {
      setIsFramesReady(true);
    }
  };

  // Triggered concurrently the exact moment the preloader begins sliding up
  const handleStartPageReveal = () => {
    (window as any).lenis?.start();
    const homeSection = document.getElementById("home-section");
    if (homeSection) {
      gsap.fromTo(
        homeSection,
        { opacity: 0, scale: 0.97 },
        {
          opacity: 1,
          scale: 1,
          duration: 1.25,
          ease: "power4.out",
          clearProps: "all",
          onComplete: () => {
            ScrollTrigger.refresh();
          },
        }
      );
    }
  };

  const handlePreloaderComplete = () => {
    setIsLoading(false);
    (window as any).lenis?.scrollTo(0, { immediate: true });
    window.scrollTo(0, 0);
    ScrollTrigger.refresh();
  };

  // Global Lenis Smooth Momentum Scrolling synchronized with GSAP ScrollTrigger
  useEffect(() => {
    // Ensure manual scroll restoration so browser never restores old scroll offset on refresh
    if ("scrollRestoration" in history) {
      history.scrollRestoration = "manual";
    }
    window.scrollTo(0, 0);

    const lenis = new Lenis({
      duration: 2.25,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 1.1,
      touchMultiplier: 1.8,
      infinite: false,
    });

    (window as any).lenis = lenis;

    // Force Lenis and Window to start from absolute top (0, 0)
    lenis.scrollTo(0, { immediate: true });
    window.scrollTo(0, 0);

    // Lock scrolling while preloader is running, resume on complete
    if (isLoading) {
      lenis.stop();
    } else {
      lenis.start();
    }

    // Synchronize Lenis scroll updates with GSAP ScrollTrigger
    lenis.on("scroll", ScrollTrigger.update);

    // Drive Lenis directly via GSAP's high-precision RAF ticker
    const tickerCallback = (time: number) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(tickerCallback);
    // Crucial for Lenis + WebGL: lagSmoothing(0) prevents GSAP ticker from pausing Lenis during 3D loads
    gsap.ticker.lagSmoothing(0);

    // Reset to top before page unload
    const handleBeforeUnload = () => {
      window.scrollTo(0, 0);
    };
    window.addEventListener("beforeunload", handleBeforeUnload);

    // Global Lenis smooth scroll handler for all internal anchor links (#...)
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
            duration: 1.4,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
          });
        }
      }
    };
    document.addEventListener("click", handleAnchorClick);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      document.removeEventListener("click", handleAnchorClick);
      gsap.ticker.remove(tickerCallback);
      lenis.destroy();
      delete (window as any).lenis;
    };
  }, []);

  // Layout Synchronization: Auto-refresh ScrollTrigger & Lenis whenever dynamic content or accordions change height
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
    const hud = hudRef.current;
    if (!box) return;

    // Center cursor box on mouse position
    gsap.set(box, {
      xPercent: -50,
      yPercent: -50,
      opacity: 0, // initially hidden until mouse enters window
    });

    // High performance smooth GSAP quickTo tracking
    const xTo = gsap.quickTo(box, "x", { duration: 0.18, ease: "power3.out" });
    const yTo = gsap.quickTo(box, "y", { duration: 0.18, ease: "power3.out" });

    let isOverText = false;
    let isInitialized = false;
    let currentX = window.innerWidth / 2;
    let currentY = window.innerHeight / 2;
    let scrollTimer: number | null = null;

    // Function to update cursor lens state based on element under cursor
    const updateHoverState = (target: HTMLElement | null) => {
      const lensCandidate = target?.closest(
        "[data-lens-text='true'], h1, h2, h3, a, button"
      ) as HTMLElement | null;

      if (lensCandidate) {
        if (!isOverText) {
          isOverText = true;

          // Expand box into targeting lens around the circle
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

          if (hud) {
            gsap.to(hud, {
              opacity: 1,
              scale: 1,
              rotation: "+=90",
              duration: 0.3,
            });
          }
        }
      } else {
        if (isOverText) {
          isOverText = false;

          // Return box to standard red capsule
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

          if (hud) {
            gsap.to(hud, {
              opacity: 0,
              scale: 0.4,
              duration: 0.2,
            });
          }
        }
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isInitialized) {
        gsap.to(box, { opacity: 1, duration: 0.2 });
        isInitialized = true;
      }

      currentX = e.clientX;
      currentY = e.clientY;

      // Track clientX and clientY
      xTo(currentX);
      yTo(currentY);

      // Check element directly from event target without layout reflow
      updateHoverState(e.target as HTMLElement);
    };

    // Follow and react to mouse scroll
    const handleScroll = () => {
      if (!isInitialized) return;

      // Subtle responsive stretch effect during active scroll
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
          realProgress={framesProgress}
          isReady={isFramesReady}
          onStartExit={handleStartPageReveal}
          onComplete={handlePreloaderComplete}
        />
      )}

      {/* Top Sticky Animated Logo */}
      <TopHeader />

      {/* Floating Glassmorphism Navbar */}
      <Navbar />

      {/* Main Sections Flow */}
      <div ref={mainContentRef} className="relative z-10">
        <Home onFramesProgress={handleFramesProgress} />
        <Services />
        <About />
        <MissionVision/>
        <ToolsAndTechnology /> 
        <PlatformsWeManage />
        <Process />
        <Portfolio />
        <ThreeDProjects />
        <WorkWithUs />
        <Blogs />
        <Contact />
        <Footer />
      </div>

      {/* Admin Auth Modal */}
      <AdminAuthModal
        isOpen={isAdminAuthOpen}
        onClose={() => setIsAdminAuthOpen(false)}
        onLoginSuccess={handleAdminLoginSuccess}
      />

      {/* Admin Dashboard Modal */}
      <AdminDashboardModal
        isOpen={isAdminDashboardOpen}
        onClose={() => setIsAdminDashboardOpen(false)}
        onLogout={handleAdminLogout}
      />
    </>
  );
};

export default App;