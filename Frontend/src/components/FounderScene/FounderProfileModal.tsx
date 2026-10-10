import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, ArrowRight, Sparkles } from 'lucide-react';
import founderPhoto from '../../assets/Picture/Picture12.webp';
import { userService } from '../../services/service/userService';
import { onSocketEvent } from '../../utils/socket';

interface FounderProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  isMobile: boolean;
}

export const FounderProfileModal: React.FC<FounderProfileModalProps> = ({
  isOpen,
  onClose,
  isMobile: _isMobile,
}) => {
  const [founder, setFounder] = useState<any>(null);

  // Fetch founder profile and sync real-time changes
  useEffect(() => {
    let isMounted = true;
    userService.getFounder().then((data) => {
      if (isMounted && data) {
        setFounder(data);
      }
    });

    const unsub = onSocketEvent('founder:updated', (updated) => {
      if (isMounted && updated) {
        setFounder(updated);
      }
    });

    return () => {
      isMounted = false;
      unsub();
    };
  }, []);

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

  // Lock background body scroll, halt Lenis smooth scrolling, and broadcast modal-state
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('modal-open');
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
      (window as any).lenis?.stop();
      window.dispatchEvent(new CustomEvent('app:modal-state', { detail: { isOpen: true } }));
    } else {
      document.body.classList.remove('modal-open');
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
      (window as any).lenis?.start();
      window.dispatchEvent(new CustomEvent('app:modal-state', { detail: { isOpen: false } }));
    }

    return () => {
      document.body.classList.remove('modal-open');
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
      (window as any).lenis?.start();
      window.dispatchEvent(new CustomEvent('app:modal-state', { detail: { isOpen: false } }));
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const founderName = founder?.name || 'SHUBHAM SINGH';
  const founderRole = founder?.role || 'CREATIVE DIRECTOR & VISIONARY';
  const founderBadge = founder?.badge || 'MEET THE FOUNDER';
  const founderSubtitle = founder?.subtitle || 'LEADERSHIP & VISION';
  const founderPhotoTag = founder?.photoTag || 'FOUNDER';
  const founderImg = founder?.image || founderPhoto;
  const founderBio = founder?.bio || 'Born in India and raised in the city of artists, Varanasi, Shubham has been capturing stories and crafting visuals for as long as he can remember.';
  const founderBioSec = founder?.bioSecondary || 'As an accomplished digital content creator and 3D visionary, he has collaborated with premier global mobile enterprises. His portfolio encompasses high-end commercial CGI, street photography stills, cinematic short films, and high-impact music videos.';
  const founderQuote = founder?.quote || '"His unique style, artistic training, and profound appreciation for light and architecture make every frame an unforgettable visual journey."';
  const founderSpecialties = Array.isArray(founder?.specialties) && founder.specialties.length > 0
    ? founder.specialties
    : ['3D CGI & ArchViz', 'Commercial Stills', 'Cinematic Direction', 'Creative Strategy'];
  const founderLinkedin = founder?.linkedinUrl || 'https://linkedin.com';
  const founderInstagram = founder?.instagramUrl || 'https://instagram.com';

  const modalNode = (
    <div
      data-lenis-prevent="true"
      className="fixed inset-0 z-[999999] overflow-y-auto overscroll-contain bg-[#060608]/96 backdrop-blur-2xl flex items-center justify-center pt-[max(env(safe-area-inset-top),3.5rem)] pb-8 px-3 sm:px-6 md:px-8 select-none animate-fadeIn"
    >
      {/* Background Click to Dismiss with requested z-index -1000 */}
      <div
        aria-hidden="true"
        onClick={onClose}
        className="fixed inset-0 -z-[1000] z-[-1000]"
      />

      {/* Main Modal Card - optimized for Mobile, Tablet, and Desktop */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Founders Profile"
        className="relative z-10 w-full max-w-4xl bg-[#0e0e12]/98  rounded-2xl sm:rounded-3xl shadow-[0_24px_80px_rgba(0,0,0,0.95),0_0_0_1px_rgba(255,255,255,0.08)] text-white p-4 sm:p-7 md:p-9 flex flex-col my-auto max-h-[88vh] sm:max-h-[88vh] overflow-y-auto animate-scaleIn"
      >
        {/* Top Header Bar */}
        <div className="w-full flex items-center justify-between pb-3 sm:pb-5  shrink-0">
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <h1 className="font-neuropol text-lg sm:text-2xl md:text-3xl lg:text-4xl font-normal uppercase text-white tracking-wide m-0">
              FOUNDERS
            </h1>
            <span className="inline-block px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full bg-white/[0.06]  text-[8.5px] sm:text-[10px] md:text-[11px] font-mono uppercase tracking-widest text-stone-300">
              {founderSubtitle}
            </span>
          </div>

          {/* Close Button with generous touch hit target */}
          <button
            onClick={onClose}
            aria-label="Close founders modal"
            className="w-9 h-9 sm:w-10 sm:h-10 min-w-[36px] min-h-[36px] rounded-full bg-white/10 hover:bg-white/20  text-white flex items-center justify-center transition-all duration-200 cursor-pointer hover:scale-105 active:scale-95 shrink-0"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        {/* Content Body: Photo on Left + Editorial Bio on Right */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 sm:gap-7 md:gap-9 items-center py-4 sm:py-6">
          {/* Left Column: Portrait Photo with Proper Face Centering & Lighting */}
          <div className="md:col-span-5 relative w-full h-[260px] sm:h-[320px] md:h-[390px] lg:h-[430px] rounded-2xl overflow-hidden bg-[#0a0a0d] shadow-2xl group shrink-0">
            <img
              src={founderImg}
              alt={`${founderName} - Founder of Bharat DigiGuru`}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
              style={{ objectPosition: '48% 36%' }}
              loading="eager"
            />
            {/* Bottom Subtle Gradient: face remains 100% visible, subtle fade only behind name pill */}
            <div className="absolute bottom-0 inset-x-0 h-24 bg-gradient-to-t from-[#0e0e12]/95 via-[#0e0e12]/40 to-transparent pointer-events-none" />
            
            {/* Bottom Floating Badge on Photo */}
            <div className="absolute bottom-2.5 left-2.5 right-2.5 p-2 sm:p-2.5 rounded-xl bg-black/75 backdrop-blur-md  flex items-center justify-between z-10 shadow-lg">
              <span className="text-[11px] sm:text-xs font-neuropol uppercase text-white tracking-wider">
                {founderName}
              </span>
              <span className="text-[9px] sm:text-[10px] font-mono text-[#ff5500] uppercase tracking-widest font-bold">
                {founderPhotoTag}
              </span>
            </div>
          </div>

          {/* Right Column: Founder Details & Biography */}
          <div className="md:col-span-7 flex flex-col items-start justify-center space-y-3 sm:space-y-4">
            {/* Pill Badge & Subtitle */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full  bg-white/[0.04] backdrop-blur-md shadow-sm">
                <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#ff3b30]" />
                <span className="text-[10px] sm:text-xs font-neuropol text-white tracking-wide uppercase">
                  {founderBadge}
                </span>
              </div>
              <span className="text-[10px] sm:text-xs font-mono uppercase text-[#e06b3a] tracking-widest font-semibold">
                {founderRole}
              </span>
            </div>

            {/* Name Heading */}
            <div className="flex items-center gap-2 sm:gap-3">
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 text-[#ff3b30] shrink-0" />
              <h2 className="font-neuropol text-lg sm:text-2xl lg:text-3xl text-white font-normal uppercase tracking-wider m-0">
                {founderName}
              </h2>
            </div>

            {/* Biography Paragraphs */}
            <div className="space-y-2 text-xs sm:text-[13px] md:text-sm text-stone-300 font-sans leading-relaxed tracking-wide">
              <p>
                {founderBio}
              </p>
              {founderBioSec && (
                <p className="text-stone-400">
                  {founderBioSec}
                </p>
              )}
            </div>

            {/* Quote / Credo Highlight */}
            {founderQuote && (
              <div className="p-3 sm:p-3.5 rounded-xl bg-white/[0.03]  w-full">
                <p className="text-[11px] sm:text-xs italic text-stone-300 m-0 leading-relaxed font-sans">
                  {founderQuote}
                </p>
              </div>
            )}

            {/* Specialties Tags */}
            <div className="flex flex-wrap gap-1.5 sm:gap-2 pt-0.5">
              {founderSpecialties.map((tag: string) => (
                <span
                  key={tag}
                  className="px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-md bg-white/[0.04]  text-[9px] sm:text-[10px] font-mono uppercase tracking-wider text-stone-300 whitespace-nowrap"
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* Social & Contact Actions */}
            <div className="flex items-center gap-2.5 sm:gap-3 pt-1 flex-wrap">
              {founderLinkedin && (
                <a
                  href={founderLinkedin}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-full  text-white hover:text-white font-mono text-[9px] sm:text-[10px] tracking-widest uppercase bg-white/[0.04] hover:bg-[#ff3b30]/10 transition-all duration-200 cursor-pointer whitespace-nowrap active:scale-95"
                >
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/>
                  </svg>
                  <span>LinkedIn</span>
                </a>
              )}
              {founderInstagram && (
                <a
                  href={founderInstagram}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-full  text-white hover:text-white font-mono text-[9px] sm:text-[10px] tracking-widest uppercase bg-white/[0.04] hover:bg-[#ff3b30]/10 transition-all duration-200 cursor-pointer whitespace-nowrap active:scale-95"
                >
                  <svg className="w-3.5 h-3.5 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                  </svg>
                  <span>Instagram</span>
                </a>
              )}
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
            transform: scale(0.96) translateY(12px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.22s ease-out forwards;
        }
        .animate-scaleIn {
          animation: scaleIn 0.28s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalNode, document.body) : modalNode;
};

export default FounderProfileModal;
