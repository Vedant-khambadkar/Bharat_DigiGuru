import React, { useEffect, useState, useRef } from "react";

import { scrollToSection } from "../utils/routes";

export const TopHeader: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const headerRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLAnchorElement>(null);

  // Modal detection so TopHeader never bleeds or overlaps over modals
  useEffect(() => {
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

    window.addEventListener("app:modal-state", handleModalState);
    const observer = new MutationObserver(checkModal);
    observer.observe(document.body, { attributes: true, attributeFilter: ["class"] });

    return () => {
      window.removeEventListener("app:modal-state", handleModalState);
      observer.disconnect();
    };
  }, []);

  // Scroll detection for sticky header transition
  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const shouldBeScrolled = window.scrollY > 40;
          setIsScrolled((prev) => (prev !== shouldBeScrolled ? shouldBeScrolled : prev));
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Smooth scroll to top when logo is clicked and sync URL to /
  const handleLogoClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    if (window.location.pathname !== "/" && !window.location.pathname.startsWith("/admin")) {
      window.history.pushState(null, "", "/");
    }
    scrollToSection("home-section", { immediate: false });
  };

  if (isModalOpen) {
    return null;
  }

  return (
    <header
      ref={headerRef}
      data-nav-header="true"
      className={`fixed top-0 inset-x-0 z-40 pointer-events-none transition-all duration-500 will-change-transform ${isScrolled
          ? "bg-[#050505]/90 backdrop-blur-2xl shadow-[0_12px_32px_rgba(0,0,0,0.65)] py-2.5 sm:py-3 px-6 sm:px-10 md:px-12 lg:px-16 pointer-events-auto"
          : "bg-transparent py-5 sm:py-6 lg:py-8 px-6 sm:px-10 md:px-12 lg:px-16"
        }`}
    >
      <div className="w-full max-w-8xl mx-auto flex items-center justify-between">
        {/* Animated Sticky Brand Logo */}
        <a
          ref={logoRef}
          href="/"
          onClick={handleLogoClick}
          className="pointer-events-auto group relative inline-flex items-center gap-3 select-none cursor-pointer transition-transform duration-300 active:scale-95 origin-left"
          style={{
            transform: isScrolled ? "scale(0.92)" : "scale(1)",
            transition: "transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
          }}
          title="Bharat DigiGuru"
        >
          <img
            src="/Logo/BDG Extended.webp"
            alt="Bharat DigiGuru Logo"
            className="h-8 sm:h-10 md:h-11 lg:h-12 w-auto object-contain transition-all duration-300 group-hover:brightness-110 drop-shadow-[0_2px_14px_rgba(255,255,255,0.2)]"
            loading="eager"
            fetchPriority="high"
            decoding="async"
          />
        </a>
      </div>
    </header>
  );
};

export default TopHeader;
