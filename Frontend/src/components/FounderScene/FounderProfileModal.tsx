import React, { useEffect } from 'react';
import { X, ArrowRight, Sparkles } from 'lucide-react';
import founderPhoto from '../../assets/Picture/Picture12.webp';

interface FounderProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  isMobile: boolean;
}

export const FounderProfileModal: React.FC<FounderProfileModalProps> = ({
  isOpen,
  onClose,
}) => {
  // Escape key listener attached only while modal is open
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
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
      className="fixed inset-0 z-[999999] overflow-y-auto overscroll-contain bg-[#060608]/95 backdrop-blur-xl flex items-center justify-center p-2.5 sm:p-5 md:p-8 select-none animate-fadeIn"
    >
      {/* Background Click to Dismiss */}
      <div
        aria-hidden="true"
        onClick={onClose}
        className="fixed inset-0 -z-10"
      />

      {/* Main Modal Card */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Founders Profile"
        className="relative z-10 w-full max-w-4xl bg-[#0e0e12]/98 border border-white/10 rounded-2xl sm:rounded-3xl shadow-[0_20px_70px_rgba(0,0,0,0.85)] text-white p-4 sm:p-7 md:p-9 flex flex-col my-auto max-h-[92vh] sm:max-h-[88vh] overflow-y-auto animate-scaleIn"
      >
        {/* Top Header Bar */}
        <div className="w-full flex items-center justify-between pb-3 sm:pb-5 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-2 sm:gap-3">
            <h1 className="font-neuropol text-xl sm:text-3xl md:text-4xl font-normal uppercase text-white tracking-wide m-0">
              FOUNDERS
            </h1>
            <span className="inline-block px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full bg-white/[0.06] border border-white/15 text-[9px] sm:text-[11px] font-mono uppercase tracking-widest text-stone-300">
              LEADERSHIP & VISION
            </span>
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            aria-label="Close founders modal"
            className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white flex items-center justify-center transition-all duration-200 cursor-pointer hover:scale-105 active:scale-95 shrink-0"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        {/* Content Body: Photo on Left + Editorial Bio on Right */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 sm:gap-7 md:gap-9 items-center py-4 sm:py-6">
          {/* Left Column: Portrait Photo with Proper Framing */}
          <div className="md:col-span-5 relative w-full h-[200px] sm:h-[280px] md:h-[380px] lg:h-[410px] rounded-2xl overflow-hidden bg-neutral-900 border border-white/15 shadow-2xl group shrink-0">
            <img
              src={founderPhoto}
              alt="Shubham Singh - Founder of Bharat DigiGuru"
              className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-700 ease-out"
              loading="eager"
            />
            {/* Subtle Gradient Vignette */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0e0e12] via-transparent to-transparent opacity-85 pointer-events-none" />
            
            {/* Bottom Floating Badge on Photo */}
            <div className="absolute bottom-2.5 left-2.5 right-2.5 p-2 sm:p-2.5 rounded-xl bg-black/70 backdrop-blur-md border border-white/10 flex items-center justify-between">
              <span className="text-[10px] sm:text-[11px] font-neuropol uppercase text-white tracking-wider">
                Shubham Singh
              </span>
              <span className="text-[8px] sm:text-[9px] font-mono text-[#e06b3a] uppercase tracking-widest font-bold">
                FOUNDER
              </span>
            </div>
          </div>

          {/* Right Column: Founder Details & Biography */}
          <div className="md:col-span-7 flex flex-col items-start justify-center space-y-3.5 sm:space-y-4">
            {/* Pill Badge & Subtitle */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-1.5 px-3 sm:px-3.5 py-1 rounded-full border border-white/20 bg-white/[0.04] backdrop-blur-md shadow-sm">
                <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#ff3b30]" />
                <span className="text-[11px] sm:text-xs font-neuropol text-white tracking-wide uppercase">
                  Meet The Founder
                </span>
              </div>
              <span className="text-[11px] sm:text-xs font-mono uppercase text-[#e06b3a] tracking-widest font-semibold">
                Creative Director & Visionary
              </span>
            </div>

            {/* Name Heading */}
            <div className="flex items-center gap-2 sm:gap-3">
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 text-[#ff3b30] shrink-0" />
              <h2 className="font-neuropol text-xl sm:text-2xl lg:text-3xl text-white font-normal uppercase tracking-wider m-0">
                SHUBHAM SINGH
              </h2>
            </div>

            {/* Biography Paragraphs */}
            <div className="space-y-2 text-xs sm:text-[13px] md:text-sm text-stone-300 font-sans leading-relaxed tracking-wide">
              <p>
                Born in India and raised in the city of artists, <strong className="text-white">Varanasi</strong>, Shubham has been capturing stories and crafting visuals for as long as he can remember.
              </p>
              <p className="text-stone-400">
                As an accomplished digital content creator and 3D visionary, he has collaborated with premier global mobile enterprises. His portfolio encompasses high-end commercial CGI, street photography stills, cinematic short films, and high-impact music videos.
              </p>
            </div>

            {/* Quote / Credo Highlight */}
            <div className="p-3 sm:p-3.5 rounded-xl bg-white/[0.03] border-l-2 border-[#ff3b30] w-full">
              <p className="text-[10.5px] sm:text-xs italic text-stone-300 m-0 leading-relaxed font-sans">
                "His unique style, artistic training, and profound appreciation for light and architecture make every frame an unforgettable visual journey."
              </p>
            </div>

            {/* Specialties Tags */}
            <div className="flex flex-wrap gap-1.5 sm:gap-2 pt-0.5">
              {['3D CGI & ArchViz', 'Commercial Stills', 'Cinematic Direction', 'Creative Strategy'].map((tag) => (
                <span
                  key={tag}
                  className="px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-md bg-white/[0.04] border border-white/10 text-[9px] sm:text-[10px] font-mono uppercase tracking-wider text-stone-300 whitespace-nowrap"
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* Social & Contact Actions */}
            <div className="flex items-center gap-2.5 sm:gap-3 pt-1">
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-full border border-white/20 hover:border-[#ff3b30] text-white hover:text-white font-mono text-[9px] sm:text-[10px] tracking-widest uppercase bg-white/[0.04] hover:bg-[#ff3b30]/10 transition-all duration-200 cursor-pointer whitespace-nowrap"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/>
                </svg>
                <span>LinkedIn</span>
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-full border border-white/20 hover:border-[#ff3b30] text-white hover:text-white font-mono text-[9px] sm:text-[10px] tracking-widest uppercase bg-white/[0.04] hover:bg-[#ff3b30]/10 transition-all duration-200 cursor-pointer whitespace-nowrap"
              >
                <svg className="w-3.5 h-3.5 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                </svg>
                <span>Instagram</span>
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
            transform: scale(0.96) translateY(16px);
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
