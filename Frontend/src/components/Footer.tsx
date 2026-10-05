import React from "react";
import { ArrowUpRight, ArrowUp, Mail, MapPin, Globe, Phone } from "lucide-react";

export const Footer: React.FC = () => {
  const scrollToSection = (id: string) => {
    if (id === "top" || id === "home-section") {
      if ((window as any).lenis) {
        (window as any).lenis.scrollTo(0, {
          duration: 1.2,
          easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        });
      } else {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
      return;
    }

    const el = document.getElementById(id);
    if (el) {
      if ((window as any).lenis) {
        (window as any).lenis.scrollTo(el, {
          duration: 1.2,
          easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        });
      } else {
        el.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  return (
    <footer id="footer-section" className="relative z-10 bg-transparent text-white w-full pt-10 sm:pt-14 md:pt-16 pb-10 sm:pb-14 overflow-hidden font-['Space_Grotesk',sans-serif]">
      {/* Subtle Ambient Backlight Glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-96 bg-red-600/[0.03] blur-[160px] rounded-full pointer-events-none" />

      {/* Top Grid Section: Brand Info + 4 Nav Columns (Edge-to-Edge Full Width) */}
      <div className="relative px-6 sm:px-10 md:px-12 lg:px-16 z-10 w-full max-w-8xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 sm:gap-14 lg:gap-12 items-start">
        {/* Left Column: Brand Wordmark & Summary */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          <a
            href="#home-section"
            onClick={(e) => {
              e.preventDefault();
              scrollToSection("home-section");
            }}
            className="inline-block w-fit group select-none cursor-pointer"
            title="Bharat DigiGuru"
          >
            <img
              src="/Logo/BDG Extended.webp"
              alt="Bharat DigiGuru Logo"
              className="h-9 sm:h-11 md:h-12 lg:h-14 w-auto object-contain transition-all duration-300 group-hover:brightness-110 drop-shadow-[0_2px_18px_rgba(255,255,255,0.2)]"
              loading="lazy"
              decoding="async"
            />
          </a>

          <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed max-w-md font-normal">
            Bharat DigiGuru is a full-service digital media and CGI production company engineering photorealistic 3D experiences, AI media, and high-impact digital marketing acceleration for global enterprises.
          </p>

          <div className="mt-2 flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_10px_#34d399] animate-pulse" />
            <span className="text-[11px] uppercase tracking-widest text-neutral-300 font-semibold">
              Together, let’s build a thriving business.  
            </span>
          </div>
        </div>

        {/* Right Columns: 4 Nav Columns */}
        <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-8 sm:gap-10">
          {/* Column 1: Navigation / Explore */}
          <div className="flex flex-col gap-3.5">
            <h4 className="text-xs sm:text-sm font-semibold text-white tracking-wider uppercase flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#ff3b30]" />
              Explore
            </h4>
            <ul className="flex flex-col gap-2.5 text-xs sm:text-sm text-neutral-400 font-normal">
              <li>
                <button
                  type="button"
                  onClick={() => scrollToSection("home-section")}
                  className="hover:text-white transition-colors cursor-pointer text-left hover:translate-x-1 duration-200 inline-block"
                >
                  Home
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => scrollToSection("services-section")}
                  className="hover:text-white transition-colors cursor-pointer text-left hover:translate-x-1 duration-200 inline-block"
                >
                  Services
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => scrollToSection("about-section")}
                  className="hover:text-white transition-colors cursor-pointer text-left hover:translate-x-1 duration-200 inline-block"
                >
                  About Us
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => scrollToSection("mission-vision-section")}
                  className="hover:text-white transition-colors cursor-pointer text-left hover:translate-x-1 duration-200 inline-block"
                >
                  Mission & Vision
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => scrollToSection("portfolio-section")}
                  className="hover:text-white transition-colors cursor-pointer text-left hover:translate-x-1 duration-200 inline-block"
                >
                  Portfolio
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => scrollToSection("our-team-section")}
                  className="hover:text-white transition-colors cursor-pointer text-left hover:translate-x-1 duration-200 inline-block"
                >
                  Our Team
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => scrollToSection("stories-section")}
                  className="hover:text-white transition-colors cursor-pointer text-left hover:translate-x-1 duration-200 inline-block"
                >
                  Stories & Insights
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => scrollToSection("contact-section")}
                  className="hover:text-[#ff3b30] text-neutral-300 font-medium transition-colors cursor-pointer text-left hover:translate-x-1 duration-200 inline-block"
                >
                  Contact Us →
                </button>
              </li>
            </ul>
          </div>

          {/* Column 2: Capabilities & Services */}
          <div className="flex flex-col gap-3.5">
            <h4 className="text-xs sm:text-sm font-semibold text-white tracking-wider uppercase flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#ff3b30]" />
              Services
            </h4>
            <ul className="flex flex-col gap-2.5 text-xs sm:text-sm text-neutral-400 font-normal">
              <li>
                <button
                  type="button"
                  onClick={() => scrollToSection("services-section")}
                  className="hover:text-white transition-colors cursor-pointer text-left hover:translate-x-1 duration-200 inline-block"
                >
                  Digital Media & SMM
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => scrollToSection("services-section")}
                  className="hover:text-white transition-colors cursor-pointer text-left hover:translate-x-1 duration-200 inline-block"
                >
                  Architectural & 3D CGI
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => scrollToSection("services-section")}
                  className="hover:text-white transition-colors cursor-pointer text-left hover:translate-x-1 duration-200 inline-block"
                >
                  Generative AI Media
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => scrollToSection("services-section")}
                  className="hover:text-white transition-colors cursor-pointer text-left hover:translate-x-1 duration-200 inline-block"
                >
                  Brand Strategy & Ads
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => scrollToSection("services-section")}
                  className="hover:text-white transition-colors cursor-pointer text-left hover:translate-x-1 duration-200 inline-block"
                >
                  Search Engine SEO
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => scrollToSection("services-section")}
                  className="hover:text-white transition-colors cursor-pointer text-left hover:translate-x-1 duration-200 inline-block"
                >
                  Web Design & Code
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Studio & Inquiries */}
          <div className="flex flex-col gap-3.5">
            <h4 className="text-xs sm:text-sm font-semibold text-white tracking-wider uppercase flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#ff3b30]" />
              Inquiries
            </h4>
            <ul className="flex flex-col gap-2.5 text-xs sm:text-sm text-neutral-400 font-normal">
              <li>
                <button
                  type="button"
                  onClick={() => scrollToSection("contact-section")}
                  className="hover:text-white transition-colors cursor-pointer text-left hover:translate-x-1 duration-200 inline-block"
                >
                  Start a Project
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => scrollToSection("contact-section")}
                  className="hover:text-white transition-colors cursor-pointer text-left hover:translate-x-1 duration-200 inline-block"
                >
                  Book Consultation
                </button>
              </li>
              <li>
                <a
                  href="mailto:contactbharatdigiguru@gmail.com"
                  className="hover:text-white transition-colors inline-flex items-center gap-1.5 text-neutral-300 group"
                >
                  <Mail className="w-3.5 h-3.5 text-[#ff3b30] shrink-0" />
                  <span className="truncate">Email Studio</span>
                  <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </a>
              </li>
              <li>
                <a
                  href="tel:+919876543210"
                  className="hover:text-white transition-colors inline-flex items-center gap-1.5 text-neutral-300 group font-mono"
                >
                  <Phone className="w-3.5 h-3.5 text-[#ff3b30] shrink-0" />
                  <span className="truncate">+91 98765 43210</span>
                  <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </a>
              </li>
              <li className="pt-2 text-neutral-500 text-[11px] leading-relaxed">
                <div className="flex items-center gap-1.5 text-neutral-400 mb-1">
                  <MapPin className="w-3.5 h-3.5 text-[#ff3b30] shrink-0" />
                  <span>India</span>
                </div>
                <div className="flex items-center gap-1.5 text-neutral-400">
                  <Globe className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Global Deployments</span>
                </div>
              </li>
            </ul>
          </div>

          {/* Column 4: Social */}
          <div className="flex flex-col gap-3.5">
            <h4 className="text-xs sm:text-sm font-semibold text-white tracking-wider uppercase flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#ff3b30]" />
              Social
            </h4>
            <ul className="flex flex-col gap-2.5 text-xs sm:text-sm text-neutral-400 font-normal">
              <li>
                <a
                  href="https://www.facebook.com/banarasichap"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-white transition-colors inline-flex items-center gap-1 group hover:translate-x-1 duration-200"
                >
                  Facebook <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </a>
              </li>
              <li>
                <a
                  href="https://www.linkedin.com/in/shubhsingh04/"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-white transition-colors inline-flex items-center gap-1 group hover:translate-x-1 duration-200"
                >
                  LinkedIn <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </a>
              </li>
              <li>
                <a
                  href="https://www.instagram.com/banarasi_chap/"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-white transition-colors inline-flex items-center gap-1 group hover:translate-x-1 duration-200"
                >
                  Instagram <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </a>
              </li>
              <li>
                <a
                  href="https://twitter.com"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-white transition-colors inline-flex items-center gap-1 group hover:translate-x-1 duration-200"
                >
                  Twitter (X) <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </a>
              </li>
              <li>
                <a
                  href="https://www.youtube.com/@banarasichap"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-white transition-colors inline-flex items-center gap-1 group hover:translate-x-1 duration-200"
                >
                  YouTube <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Middle Meta Bar: Copyright, Developer Credit, Back to Top & Admin Portal Link */}
      <div className="relative px-6 sm:px-10 md:px-12 lg:px-16 z-10 w-full max-w-8xl mx-auto mt-14 sm:mt-20 pt-6 sm:pt-8 border-t border-neutral-800/80 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-neutral-400">
        <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-center sm:text-left">
          <p>© 2026 Bharat DigiGuru. All rights reserved.</p>
          <span className="hidden sm:inline text-neutral-700">•</span>
          <p className="text-neutral-400">
            Design & Developed by{" "}
            <span className="text-white font-medium hover:text-[#ff3b30] transition-colors">
              Vedant Khambadkar
            </span>
          </p>
        </div>

        <div className="flex items-center gap-5 sm:gap-6">
          <button
            type="button"
            onClick={() => scrollToSection("home-section")}
            className="text-neutral-400 hover:text-white text-xs uppercase tracking-wider transition-colors flex items-center gap-1.5 cursor-pointer group"
          >
            <span>Back to Top</span>
            <ArrowUp className="w-3.5 h-3.5 group-hover:-translate-y-0.5 transition-transform" />
          </button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
