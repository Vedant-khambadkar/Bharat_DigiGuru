import React, { useEffect } from 'react';
import { X, ArrowRight } from 'lucide-react';
import founderPhoto from '../../assets/photography/photography-1.webp';

interface FounderProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  isMobile: boolean;
}

export const FounderProfileModal: React.FC<FounderProfileModalProps> = ({
  isOpen,
  onClose,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Lock background body scroll and halt Lenis smooth scrolling when modal is active
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('modal-open');
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
      (window as any).lenis?.stop();
    } else {
      document.body.classList.remove('modal-open');
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
      (window as any).lenis?.start();
    }

    return () => {
      document.body.classList.remove('modal-open');
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
      (window as any).lenis?.start();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      data-lenis-prevent="true"
      className="fixed inset-0 z-[999999] overflow-y-auto overscroll-contain bg-[#0a0a0c]/98 flex items-start sm:items-center justify-center pt-20 pb-8 px-4 sm:p-6 md:p-8 select-none animate-fadeIn"
    >
      {/* Background Click to Dismiss */}
      <div
        aria-hidden="true"
        onClick={onClose}
        className="fixed inset-0 -z-10"
      />

      {/* Main Content Canvas (Scrollable on mobile, compact fit on desktop) */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Founders Profile"
        className="relative z-10 w-full max-w-5xl lg:max-h-[96vh] bg-transparent text-white flex flex-col justify-between animate-scaleIn my-auto py-2 sm:py-0"
      >

        {/* Top Header Row with Monumental "FOUNDERS" Title & Close Button */}
        <div className="w-full flex items-center justify-between pb-2 sm:pb-2">
          <h1
            className="font-[sans-serif] font-bold uppercase text-white tracking-tighter leading-none select-none text-left"
            style={{
              fontSize: "clamp(1.8rem, 5.5vw, 4.2rem)",
              letterSpacing: "-0.04em",
              lineHeight: 0.9,
            }}
          >
            FOUNDERS
          </h1>

          {/* Close Button */}
          <button
            onClick={onClose}
            aria-label="Close founders modal"
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white flex items-center justify-center transition-all duration-200 cursor-pointer hover:scale-105 active:scale-95 shadow-lg shrink-0"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        {/* Middle Section: Hero Picture (Left) + Oval Wireframe Badge (Right) */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-6 lg:gap-8 items-center my-2 sm:my-3">
          {/* Left: Founder Landscape Photo */}
          <div className="md:col-span-6 lg:col-span-7 relative w-full h-[140px] sm:h-[180px] lg:h-[210px] rounded-xl sm:rounded-2xl overflow-hidden bg-neutral-900 border border-white/15 shadow-xl group">
            <img
              src={founderPhoto}
              alt="Founders of Bharat DigiGuru"
              className="w-full h-full object-cover object-center group-hover:scale-102 transition-transform duration-700 ease-out"
              loading="eager"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
          </div>

          {/* Right: Oval Wireframe "Meet The Founders" Badge + Subtitle */}
          <div className="md:col-span-6 lg:col-span-5 flex flex-col items-start justify-center gap-2 pl-0 md:pl-2">
            {/* Oval Pill Badge */}
            <div className="inline-flex items-center justify-center px-5 py-2 sm:px-6 sm:py-2.5 rounded-full border border-white/40 bg-white/[0.02] backdrop-blur-md shadow-sm">
              <span className="text-xl sm:text-2xl lg:text-[26px] font-[sans-serif] font-light text-white tracking-tight">
                Meet The Founders
              </span>
            </div>

            {/* Subtitle in Warm Terracotta */}
            <p className="text-xs sm:text-sm font-[sans-serif] text-[#e06b3a] tracking-wide font-medium pl-1">
              SHUBHAM SINGH
            </p>
          </div>
        </div>

        {/* Bottom Two-Column Profiles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 lg:gap-10 pt-3 sm:pt-4 border-t border-white/10 mt-1 sm:mt-2">

          {/* Column 1: Oliver Muñoz */}
          <div className="flex flex-col items-start text-left space-y-1.5 sm:space-y-2">
            {/* Name with Orange Arrow */}
            <div className="flex items-center gap-2">
              <ArrowRight className="w-4 h-4 text-[#e06b3a] shrink-0" />
              <h3 className="text-base sm:text-lg lg:text-xl font-[sans-serif] font-medium text-[#e06b3a] tracking-tight">
                SHUMHAM
              </h3>
            </div>


            {/* Bio Paragraphs */}
            <div className="space-y-1 sm:space-y-1.5 text-[11px] sm:text-xs text-neutral-300 font-[sans-serif] leading-relaxed">
              <p>Born in India and raised in a city of artists ‘VARANASI’ , Shubham has  been taking pictures for as long as he can remember.
              </p>
              <p className="text-neutral-400">
                As a digital content creator,he has worked with leading mobile companies.His body of work includes street photography still,short films and music videos..
              </p>
            </div>
            {/* Role Subtitle */}
            <span className="text-[9px] sm:text-[10px] uppercase tracking-[0.16em] text-neutral-400 font-semibold">
             His unique style, training, and appreciation for his subjects makes his photographs a joy to look at.
            </span>

            {/* Outlined Action Pill Buttons */}
            <div className="flex items-center gap-2 pt-1">
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noreferrer"
                className="px-4 py-1 rounded-full border border-white/30 hover:border-white text-white font-mono text-[9px] tracking-widest uppercase hover:bg-white/10 transition-all duration-200 cursor-pointer"
              >
                LIN
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="px-4 py-1 rounded-full border border-white/30 hover:border-white text-white font-mono text-[9px] tracking-widest uppercase hover:bg-white/10 transition-all duration-200 cursor-pointer"
              >
                IG
              </a>
            </div>
          </div>


        </div>

      </div>

      {/* Smooth Animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.98) translateY(12px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.25s ease-out forwards;
        }
        .animate-scaleIn {
          animation: scaleIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </div>
  );
};

export default FounderProfileModal;
