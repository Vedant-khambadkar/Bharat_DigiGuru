import React, { useEffect, useState, useRef } from "react";

export const TopHeader: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const headerRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLAnchorElement>(null);

  // Scroll detection for sticky header transition
  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          setIsScrolled(window.scrollY > 40);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Smooth scroll to top when logo is clicked
  const handleLogoClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const lenis = (window as any).lenis;
    const homeEl = document.getElementById("home-section");

    if (lenis) {
      lenis.scrollTo(homeEl || 0, {
        offset: 0,
        duration: 1.3,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <header
      ref={headerRef}
      className={`fixed top-0 inset-x-0 z-40 pointer-events-none transition-all duration-500 will-change-transform ${isScrolled
          ? "bg-[#050505]/90 backdrop-blur-2xl shadow-[0_12px_32px_rgba(0,0,0,0.65)] py-2.5 sm:py-3 px-6 sm:px-10 md:px-12 lg:px-16 pointer-events-auto"
          : "bg-transparent py-5 sm:py-6 lg:py-8 px-6 sm:px-10 md:px-12 lg:px-16"
        }`}
    >
      <div className="w-full max-w-8xl mx-auto flex items-center justify-between">
        {/* Animated Sticky Brand Logo */}
        <a
          ref={logoRef}
          href="#home-section"
          onClick={handleLogoClick}
          className="pointer-events-auto group relative inline-flex items-center gap-3 select-none cursor-pointer transition-transform duration-300 active:scale-95 origin-left"
          style={{
            transform: isScrolled ? "scale(0.92)" : "scale(1)",
            transition: "transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
          }}
          title="Bharat DigiGuru"
        >
          <img
            src="/Logo/BDG Extended.png"
            alt="Bharat DigiGuru Logo"
            className="h-8 sm:h-10 md:h-11 lg:h-12 w-auto object-contain transition-all duration-300 group-hover:brightness-110 drop-shadow-[0_2px_14px_rgba(255,255,255,0.2)]"
            decoding="async"
          />
        </a>
      </div>
    </header>
  );
};

export default TopHeader;
