import React, { useState, useEffect } from 'react';
import { X, ArrowUpRight, Award, Compass, Layers } from 'lucide-react';

interface FounderProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  isMobile: boolean;
}

export const FounderProfileModal: React.FC<FounderProfileModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'manifesto' | 'milestones'>('manifesto');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-8 select-none">
      {/* Dark Ambient Backdrop */}
      <div
        aria-hidden="true"
        onClick={onClose}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity duration-300 animate-fadeIn"
      />

      {/* Centered Floating Editorial Modal Card */}
      <aside
        aria-label="Founder Profile Dialog"
        className="relative z-10 w-full max-w-xl lg:max-w-2xl max-h-[82vh] bg-white text-neutral-900 rounded-2xl shadow-[0_25px_70px_rgba(0,0,0,0.45)] border border-neutral-200/80 flex flex-col overflow-hidden animate-scaleIn"
      >
        {/* Sticky Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100 bg-white/95 backdrop-blur-sm shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-black animate-pulse" />
            <span className="text-[10px] sm:text-[11px] font-mono font-bold tracking-[0.22em] text-neutral-900 uppercase">
              FOUNDER & CREATIVE DIRECTOR
            </span>
          </div>
          <button
            onClick={onClose}
            aria-label="Close profile modal"
            className="p-1.5 rounded-full text-neutral-600 hover:text-black hover:bg-neutral-100 transition-colors duration-200 cursor-pointer border border-transparent hover:border-neutral-300"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Modal Body */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-6 sm:p-8 space-y-6">
          {/* Monochromatic Editorial Hero Card */}
          <div className="relative w-full aspect-[16/9] sm:aspect-[21/9] bg-black text-white p-6 sm:p-7 rounded-xl flex flex-col justify-between overflow-hidden shadow-md">
            <div className="flex justify-between items-start z-10">
              <span className="text-[9px] tracking-[0.25em] uppercase text-neutral-400 font-mono">
                COLLECTIVE 01
              </span>
              <span className="text-[9px] tracking-[0.2em] uppercase text-neutral-400 font-mono">
                EST. 2018
              </span>
            </div>

            <div className="z-10">
              <p className="text-[10px] sm:text-[11px] font-mono tracking-[0.22em] text-neutral-400 uppercase">
                EXECUTIVE VISION
              </p>
              <h3 className="text-2xl sm:text-3xl font-serif font-bold text-white tracking-wide mt-0.5">
                ALEXANDER VANCE
              </h3>
            </div>

            {/* Geometric Monogram Watermark */}
            <div className="absolute right-4 -bottom-6 text-white/5 font-serif text-8xl sm:text-9xl font-black select-none pointer-events-none">
              AV
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex gap-6 border-b border-neutral-200 pb-2 text-xs tracking-[0.18em] uppercase font-mono font-semibold">
            <button
              onClick={() => setActiveTab('manifesto')}
              className={`pb-2 transition-colors cursor-pointer relative ${
                activeTab === 'manifesto' ? 'text-black font-bold' : 'text-neutral-400 hover:text-black'
              }`}
            >
              PHILOSOPHY & VISION
              {activeTab === 'manifesto' && (
                <span className="absolute bottom-[-9px] left-0 w-full h-[2px] bg-black" />
              )}
            </button>
            <button
              onClick={() => setActiveTab('milestones')}
              className={`pb-2 transition-colors cursor-pointer relative ${
                activeTab === 'milestones' ? 'text-black font-bold' : 'text-neutral-400 hover:text-black'
              }`}
            >
              RECOGNITIONS
              {activeTab === 'milestones' && (
                <span className="absolute bottom-[-9px] left-0 w-full h-[2px] bg-black" />
              )}
            </button>
          </div>

          {/* Tab 1: Manifesto */}
          {activeTab === 'manifesto' ? (
            <div className="space-y-4 text-xs sm:text-sm text-neutral-700 leading-relaxed font-sans">
              <p className="text-neutral-800 font-medium">
                "We compose silhouetted spaces where light, pure form, and negative space dictate human attention. By stripping away extraneous decorative noise, the narrative achieves uncompromised clarity."
              </p>
              <p className="text-neutral-500 text-xs">
                Leading a multi-disciplinary collective of computational artists, 3D architects, and creative directors across New York, London, and Tokyo.
              </p>

              {/* Key Attributes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="p-3.5 border border-neutral-200 rounded-lg bg-neutral-50/80 flex items-center gap-3">
                  <Compass size={20} className="text-black shrink-0" />
                  <div>
                    <span className="block text-[9px] uppercase tracking-wider text-neutral-400 font-mono">
                      DIRECTION
                    </span>
                    <span className="text-xs font-bold text-black">Spatial Systems</span>
                  </div>
                </div>
                <div className="p-3.5 border border-neutral-200 rounded-lg bg-neutral-50/80 flex items-center gap-3">
                  <Layers size={20} className="text-black shrink-0" />
                  <div>
                    <span className="block text-[9px] uppercase tracking-wider text-neutral-400 font-mono">
                      DISCIPLINE
                    </span>
                    <span className="text-xs font-bold text-black">Monochrome 3D</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Tab 2: Milestones */
            <div className="space-y-3 text-xs">
              <div className="p-3.5 border border-neutral-200 rounded-lg bg-neutral-50/80 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Award size={18} className="text-black shrink-0" />
                  <div>
                    <p className="font-bold text-neutral-900">Awwwards Site of the Year</p>
                    <p className="text-[10px] text-neutral-500 uppercase tracking-wider font-mono">
                      Spatial Design 2025
                    </p>
                  </div>
                </div>
                <span className="font-mono text-xs text-neutral-400">01</span>
              </div>

              <div className="p-3.5 border border-neutral-200 rounded-lg bg-neutral-50/80 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Award size={18} className="text-black shrink-0" />
                  <div>
                    <p className="font-bold text-neutral-900">FWA of the Day × 12</p>
                    <p className="text-[10px] text-neutral-500 uppercase tracking-wider font-mono">
                      Interactive Direction
                    </p>
                  </div>
                </div>
                <span className="font-mono text-xs text-neutral-400">02</span>
              </div>

              <div className="p-3.5 border border-neutral-200 rounded-lg bg-neutral-50/80 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Award size={18} className="text-black shrink-0" />
                  <div>
                    <p className="font-bold text-neutral-900">Cannes Lions Grand Prix</p>
                    <p className="text-[10px] text-neutral-500 uppercase tracking-wider font-mono">
                      Digital Craft & Aesthetics
                    </p>
                  </div>
                </div>
                <span className="font-mono text-xs text-neutral-400">03</span>
              </div>
            </div>
          )}
        </div>

        {/* Sticky Bottom Actions Bar */}
        <div className="px-6 py-4 border-t border-neutral-200 bg-neutral-50/95 backdrop-blur-sm flex items-center gap-3 shrink-0">
          <a
            href="https://linkedin.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 bg-black text-white text-xs tracking-[0.2em] uppercase font-bold font-mono rounded-lg hover:bg-neutral-800 transition-colors duration-200"
          >
            <span>CONNECT ON LINKEDIN</span>
            <ArrowUpRight size={14} />
          </a>

          <button
            onClick={onClose}
            className="px-5 py-3 bg-white text-neutral-800 text-xs tracking-[0.2em] uppercase font-bold font-mono border border-neutral-300 rounded-lg hover:border-black hover:bg-neutral-100 transition-colors duration-200 cursor-pointer"
          >
            RETURN
          </button>
        </div>
      </aside>

      {/* Modal Entrance Animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.94) translateY(12px);
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
