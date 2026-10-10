import React, { useState, useEffect, useRef } from "react";
import {
  Home,
  User,
  Users,
  Compass,
  Layers,
  Briefcase,
  BookOpen,
  Mail,
  ArrowUpRight,
  Menu,
  X,
  ChevronDown,
  ChartLine,
  ChevronUp,
  Sparkles,
} from "lucide-react";

interface NavbarProps {
  activeSection?: string;
}

interface NavItem {
  id: string;
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: boolean;
}

const navItems: NavItem[] = [
  { id: "home", label: "Home", href: "#home-section", icon: Home },
  { id: "services", label: "Services", href: "#services-section", icon: Layers },
  { id: "portfolio", label: "Portfolio", href: "#portfolio-section", icon: Briefcase },
  { id: "about", label: "About", href: "#about-section", icon: User },
  { id: "analytics", label: "Analytics", href: "#analytics-section", icon: ChartLine },
  { id: "team", label: "Team", href: "#our-team-section", icon: Users },
  { id: "whyus", label: "Why Us", href: "#work-with-us-section", icon: Sparkles },
  { id: "stories", label: "Stories", href: "#stories-section", icon: BookOpen },
  { id: "contact", label: "Contact", href: "#contact-section", icon: Mail, badge: true },
];

export const Navbar: React.FC<NavbarProps> = ({ activeSection = "home" }) => {
  const [activeTab, setActiveTab] = useState(activeSection);
  const [hoveredTab, setHoveredTab] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isNavVisible, setIsNavVisible] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navContainerRef = useRef<HTMLDivElement>(null);
  const lastScrollY = useRef(0);

  // Auto Scroll Spy, Modal Event Listeners & Smart Hide/Show on Scroll
  useEffect(() => {
    // Detect modal state via body class & custom app events
    const checkModal = () => {
      setIsModalOpen(document.body.classList.contains("modal-open"));
    };
    checkModal();

    const handleModalState = (e: any) => {
      if (e?.detail?.isOpen !== undefined) {
        setIsModalOpen(Boolean(e.detail.isOpen));
      } else {
        checkModal();
      }
    };

    const handleToggleMenu = () => {
      setMobileMenuOpen((prev) => !prev);
    };

    window.addEventListener("app:modal-state", handleModalState);
    window.addEventListener("app:toggle-menu", handleToggleMenu);
    window.addEventListener("app:open-menu", () => setMobileMenuOpen(true));
    const observer = new MutationObserver(checkModal);
    observer.observe(document.body, { attributes: true, attributeFilter: ["class"] });

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const diff = currentScrollY - lastScrollY.current;

      setIsScrolled(currentScrollY > 40);

      // Auto-hide dock when scrolling down so it never blocks content, reveal on scroll up
      if (currentScrollY <= 80) {
        setIsNavVisible(true);
      } else if (diff > 8) {
        setIsNavVisible(false);
      } else if (diff < -8) {
        setIsNavVisible(true);
      }

      lastScrollY.current = currentScrollY;

      // Section detection
      const scrollPos = currentScrollY + window.innerHeight * 0.4;
      for (let i = navItems.length - 1; i >= 0; i--) {
        const item = navItems[i];
        const targetEl = document.querySelector(item.href);
        if (targetEl) {
          const rect = targetEl.getBoundingClientRect();
          const top = rect.top + window.scrollY;
          if (scrollPos >= top) {
            setActiveTab(item.id);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => {
      window.removeEventListener("app:modal-state", handleModalState);
      window.removeEventListener("app:toggle-menu", handleToggleMenu);
      observer.disconnect();
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Smooth scroll handler using Lenis or native smooth scroll
  const handleLinkClick = React.useCallback((
    e: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement>,
    href: string,
    id: string
  ) => {
    e.preventDefault();
    setActiveTab(id);
    setMobileMenuOpen(false);

    const lenis = (window as any).lenis;
    const targetEl = document.querySelector(href);

    if (lenis && targetEl) {
      lenis.scrollTo(targetEl, {
        offset: 0,
        duration: 1.2,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      });
    } else if (targetEl) {
      targetEl.scrollIntoView({ behavior: "smooth" });
    }
  }, []);

  // Close mobile drawer on desktop resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <>
      {/* Invisible Hover Sensor at bottom edge to reveal dock on mouse approach */}
      <div
        onMouseEnter={() => {
          setIsNavVisible(true);
        }}
        className="fixed bottom-0 inset-x-0 h-8 pointer-events-none z-30"
      />

      {/* When Minimized: Floating Mini Trigger Pill that occupies minimal space */}
      {isMinimized && !isModalOpen && (
        <div className="fixed bottom-4 sm:bottom-6 right-4 sm:right-8 z-40 animate-in fade-in zoom-in-95 duration-300">
          <button
            type="button"
            onClick={() => {
              setIsMinimized(false);
              setIsNavVisible(true);
            }}
            className="group flex items-center gap-2 px-3.5 py-2 rounded-full bg-[#111114]/90 hover:bg-[#111114] border border-white/20 text-white shadow-[0_10px_30px_rgba(0,0,0,0.8)] backdrop-blur-xl transition-all hover:scale-105 cursor-pointer"
            title="Expand Navigation Menu"
          >
            <Compass className="w-4 h-4 text-[#ff3b30] group-hover:rotate-45 transition-transform" />
            <span className="font-mono text-[11px] uppercase tracking-wider font-bold">Menu</span>
            <ChevronUp className="w-3.5 h-3.5 text-neutral-400 group-hover:text-white" />
          </button>
        </div>
      )}

      {/* 1. Floating Sticky Bottom Navigation Bar (Awwwards & Pinterest Dock Style) */}
      {!isModalOpen && (
        <header
          className={`fixed bottom-4 sm:bottom-6 md:bottom-8 inset-x-0 z-40 pointer-events-none flex justify-center px-3 sm:px-6 transition-all duration-500 ease-out will-change-transform ${
            !isNavVisible || isMinimized
              ? "translate-y-28 opacity-0 pointer-events-none"
              : "translate-y-0 opacity-100"
          }`}
        >
          <nav
            ref={navContainerRef}
            className={`pointer-events-auto relative flex items-center gap-1 sm:gap-2 p-1.5 sm:p-2 rounded-full transition-all duration-500 will-change-transform ${
              isScrolled
                ? "bg-[#0c0c0e]/95 border border-white/15 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.85),0_0_0_1px_rgba(255,255,255,0.08)]"
                : "bg-[#111114]/90 border border-white/12 backdrop-blur-xl shadow-[0_16px_40px_rgba(0,0,0,0.7)]"
            }`}
            style={{
              boxShadow:
                "0 24px 60px rgba(0,0,0,0.9), 0 0 1px 1px rgba(255,255,255,0.12), inset 0 1px 1px rgba(255,255,255,0.15)",
            }}
          >
            {/* B. Desktop & Tablet Navigation Items */}
            <div className="hidden md:flex items-center gap-1 sm:gap-1.5 px-1">
              

              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                const isHovered = hoveredTab === item.id;

                return (
                  <a
                    key={item.id}
                    href={item.href}
                    onClick={(e) => handleLinkClick(e, item.href, item.id)}
                    onMouseEnter={() => setHoveredTab(item.id)}
                    onMouseLeave={() => setHoveredTab(null)}
                    className={`relative flex flex-col items-center justify-center px-3.5 lg:px-4 py-1.5 sm:py-2 rounded-full transition-all duration-300 group select-none min-w-[58px] lg:min-w-[64px] ${
                      isActive ? "text-white" : "text-white/50 hover:text-white/90"
                    }`}
                  >
                    {/* Active Elevated Contour & Glow */}
                    {isActive && (
                      <span
                        className="absolute inset-0 rounded-full bg-white/[0.08] border border-neutral-400/50 shadow-[inset_0_1px_1px_rgba(255,255,255,0.15),0_0_15px_rgba(255,255,255,0.08)] -z-10 animate-in fade-in zoom-in-95 duration-300"
                      />
                    )}

                    {/* Hover Floating Pill */}
                    {!isActive && isHovered && (
                      <span className="absolute inset-0 rounded-full bg-white/[0.04] border border-white/10 -z-10 transition-all duration-200" />
                    )}

                    {/* Icon */}
                    <div className="relative flex items-center justify-center">
                      <Icon
                        className={`w-4 h-4 transition-all duration-300 ${
                          isActive
                            ? "text-white scale-110 drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]"
                            : "text-white/60 group-hover:text-white group-hover:-translate-y-0.5"
                        }`}
                      />
                    </div>

                    {/* Label */}
                    <span
                      className={`font-mono text-[10px] tracking-wider uppercase mt-1 transition-all duration-200 ${
                        isActive
                          ? "text-white font-bold"
                          : "text-white/50 group-hover:text-white/80"
                      }`}
                    >
                      {item.label}
                    </span>
                  </a>
                );
              })}

              {/* Minimize Dock Button */}
              <button
                type="button"
                onClick={() => setIsMinimized(true)}
                className="ml-1 p-1.5 rounded-full text-white/40 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                title="Minimize Dock"
              >
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* C. Mobile Compact Navigation Dock (< 768px) */}
            <div className="flex md:hidden items-center gap-1 px-1">
             

              {navItems.slice(0, 4).map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;

                return (
                  <a
                    key={item.id}
                    href={item.href}
                    onClick={(e) => handleLinkClick(e, item.href, item.id)}
                    className={`relative flex items-center gap-1.5 px-3 py-2 rounded-full transition-all duration-300 select-none ${
                      isActive
                        ? "bg-white/[0.09] border border-neutral-400/50 text-white shadow-[0_0_15px_rgba(255,255,255,0.08)]"
                        : "text-white/50 hover:text-white"
                    }`}
                  >
                    <Icon
                      className={`w-4 h-4 transition-transform duration-300 ${
                        isActive ? "text-white scale-110" : "text-white/60"
                      }`}
                    />
                    {isActive && (
                      <span className="font-mono text-[10px] uppercase font-bold tracking-wider animate-in fade-in duration-200">
                        {item.label}
                      </span>
                    )}
                  </a>
                );
              })}

              {/* Mobile Minimize Toggle */}
              <button
                type="button"
                onClick={() => setIsMinimized(true)}
                className="p-2 rounded-full bg-white/5 text-white/60 hover:text-white"
                title="Minimize"
              >
                <ChevronDown className="w-3.5 h-3.5" />
              </button>

              {/* Mobile More Drawer Toggle */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className={`p-2 rounded-full transition-all duration-300 ${
                  mobileMenuOpen
                    ? "bg-white/20 text-white"
                    : "bg-white/5 text-white/70 hover:text-white"
                }`}
                aria-label="More Navigation Items"
              >
                {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
              </button>
            </div>
          </nav>
        </header>
      )}

      {/* 2. Mobile Expanded Navigation Modal / Bottom Sheet */}
      {mobileMenuOpen && !isModalOpen && (
        <div className="fixed inset-0 z-40 md:hidden bg-black/70 backdrop-blur-md flex flex-col justify-end p-4 animate-in fade-in duration-200 pointer-events-auto">
          <div className="w-full bg-[#111114] border border-white/15 rounded-3xl p-5 shadow-[0_-10px_40px_rgba(0,0,0,0.8)] flex flex-col gap-2 animate-in slide-in-from-bottom-6 duration-300 mb-20">
            <div className="flex items-center justify-between pb-3 mb-1 border-b border-white/10">
              <div className="flex items-center gap-2">
                <img
                  src="/Logo/BDG Extended.webp"
                  alt="Bharat DigiGuru Logo"
                  className="h-6 w-auto object-contain drop-shadow-[0_2px_8px_rgba(255,255,255,0.2)]"
                  loading="lazy"
                  decoding="async"
                />
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="w-7 h-7 rounded-full bg-white/5 flex items-center justify-center text-white/60 hover:text-white cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;

                return (
                  <a
                    key={item.id}
                    href={item.href}
                    onClick={(e) => handleLinkClick(e, item.href, item.id)}
                    className={`flex items-center gap-2.5 px-3.5 py-3 rounded-2xl font-mono text-xs uppercase tracking-wider transition-all duration-200 ${
                      isActive
                        ? "bg-white/10 border border-neutral-400/50 text-white font-bold"
                        : "bg-white/5 hover:bg-white/10 text-white/70 hover:text-white"
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-white/50"}`} />
                    <span>{item.label}</span>
                    {item.badge && (
                      <span className="ml-auto w-2 h-2 rounded-full bg-neutral-400" />
                    )}
                  </a>
                );
              })}
            </div>

            <a
              href="#contact-section"
              onClick={(e) => handleLinkClick(e, "#contact-section", "contact")}
              className="mt-2 text-center py-3.5 rounded-2xl font-mono text-xs font-black uppercase tracking-widest text-black bg-white hover:bg-neutral-200 transition-colors shadow-lg flex items-center justify-center gap-1.5"
            >
              <span>CONNECT WITH DESK</span>
              <ArrowUpRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
