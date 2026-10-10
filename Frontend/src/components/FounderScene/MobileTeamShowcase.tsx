import React, { useState, useEffect } from "react";
import { Sparkles, ArrowRight, Award, Compass, ExternalLink } from "lucide-react";
import founderPhoto from "../../assets/Picture/Picture12.webp";
import mobileVignette from "../../assets/Minimalist Black and White Vignette  mobile.webp";
import { userService } from "../../services/service/userService";
import { onSocketEvent } from "../../utils/socket";

interface MobileTeamShowcaseProps {
  onOpenProfile: () => void;
  onReady?: () => void;
}

export const MobileTeamShowcase: React.FC<MobileTeamShowcaseProps> = ({
  onOpenProfile,
  onReady,
}) => {
  const [founder, setFounder] = useState<any>(null);

  useEffect(() => {
    onReady?.();
    let isMounted = true;
    userService.getFounder().then((data) => {
      if (isMounted && data) {
        setFounder(data);
      }
    });

    const unsub = onSocketEvent("founder:updated", (updated) => {
      if (isMounted && updated) {
        setFounder(updated);
      }
    });

    return () => {
      isMounted = false;
      unsub();
    };
  }, [onReady]);

  const founderName = founder?.name || "SHUBHAM SINGH";
  const founderRole = founder?.role || "FOUNDER & CREATIVE DIRECTOR";
  const founderSubtitle = founder?.subtitle || "LEADERSHIP & VISION";
  const founderCityTag = founder?.cityTag || "VARANASI × GLOBAL";
  const founderImg = founder?.image || founderPhoto;
  const founderQuote = founder?.quote || '"Crafting visuals that redefine the boundaries of light, space, and emotion for visionary global brands."';

  return (
    <div className="relative w-full h-full min-h-[100svh] flex flex-col justify-between py-12 px-4 select-none overflow-hidden bg-black">
      {/* Background Vignette Graphic Layer */}
      <div className="absolute inset-0 z-0 pointer-events-none select-none overflow-hidden bg-white">
        <img
          src={mobileVignette}
          alt=""
          className="w-full h-full object-fill select-none pointer-events-none"
        />
      </div>

      {/* TOP HEADER: 1:1 Match with Desktop */}
      <div className="relative z-20 flex flex-col items-center text-center pt-2">
        <div className="flex items-center gap-3 text-[18px] sm:text-[22px] font-mono tracking-[0.28em] text-white uppercase font-normal">
          <span className="w-5 h-[1px] bg-white/40" />
          <span>THE COLLECTIVE &amp; DIRECTION</span>
          <span className="w-5 h-[1px] bg-white/40" />
        </div>
        <span className="text-[10px] sm:text-[12px] font-mono tracking-[0.25em] uppercase text-neutral-400 mt-1 font-normal">
          A VISION BUILT TOGETHER
        </span>
      </div>

      {/* CENTER EDITORIAL SHOWCASE CARD */}
      <div className="relative z-20 w-full max-w-sm mx-auto my-auto flex flex-col items-center">
        {/* Glow Aura */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[280px] h-[340px] rounded-full bg-gradient-to-t from-[#ff3b30]/25 via-[#ff7b00]/15 to-transparent blur-[80px] pointer-events-none" />

        <div
          onClick={onOpenProfile}
          className="relative w-full rounded-3xl overflow-hidden border border-white/20 bg-neutral-950/85 shadow-[0_25px_60px_rgba(0,0,0,0.95),0_0_40px_rgba(255,59,48,0.2)] backdrop-blur-2xl transition-all duration-300 active:scale-98 cursor-pointer group"
        >
          {/* Top Pill Bar */}
          <div className="px-4 py-2 bg-neutral-900/90 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#ff3b30] shadow-[0_0_8px_#ff3b30] animate-pulse" />
              <span className="text-[8.5px] font-mono uppercase tracking-[0.22em] text-neutral-300 font-bold">
                {founderSubtitle}
              </span>
            </div>
            <span className="text-[8.5px] font-mono uppercase tracking-widest text-[#ff5500] font-semibold">
              01 // DIRECTION
            </span>
          </div>

          {/* Portrait Container */}
          <div className="relative aspect-[3/4] w-full overflow-hidden bg-neutral-900">
            <img
              src={founderImg}
              alt={`${founderName} — ${founderRole}`}
              loading="eager"
              decoding="async"
              className="w-full h-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-105"
            />

            {/* Cinematic Gradient Vignette */}
            <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/30 to-transparent pointer-events-none" />

            {/* Floating Top Heritage Pill */}
            <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-black/75 backdrop-blur-md border border-white/15 text-[8.5px] font-mono text-neutral-300 uppercase tracking-wider flex items-center gap-1">
              <Compass className="w-2.5 h-2.5 text-[#ff5500]" />
              <span>{founderCityTag}</span>
            </div>

            {/* Overlaid Bottom Title & Info */}
            <div className="absolute bottom-3 left-3 right-3 flex flex-col gap-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#ff3b30]/20 border border-[#ff3b30]/40 w-fit backdrop-blur-md">
                <Sparkles className="w-2.5 h-2.5 text-[#ff6633]" />
                <span className="text-[8.5px] font-mono uppercase tracking-widest text-[#ff6633] font-bold">
                  {founderRole}
                </span>
              </div>

              <h3 className="font-['Neuropol_X',sans-serif] text-xl text-white tracking-wider uppercase mt-0.5">
                {founderName}
              </h3>

              <p className="text-[11px] text-stone-300 font-sans leading-relaxed line-clamp-2">
                {founderQuote}
              </p>
            </div>
          </div>

          {/* Interactive Tap Footer */}
          <div className="p-3.5 bg-neutral-900/90 border-t border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-1 text-[9px] font-mono uppercase tracking-wider text-neutral-400">
              <Award className="w-3 h-3 text-[#ff5500]" />
              <span>CGI &amp; DIRECTION DOSSIER</span>
            </div>

            <div className="flex items-center gap-1 text-[9px] font-mono uppercase tracking-widest text-white group-hover:text-[#ff5500] font-semibold transition-colors">
              <span>EXPLORE PROFILE</span>
              <ArrowRight className="w-3 h-3 text-[#ff3b30]" />
            </div>
          </div>
        </div>
      </div>

      {/* BOTTOM FOOTER STATUS */}
      <div className="relative z-20 flex items-center justify-between max-w-sm mx-auto w-full pt-2 border-t border-white/10 text-[8.5px] font-mono tracking-widest uppercase text-neutral-500">
        <span className="text-neutral-400">BHARAT DIGIGURU // FOUNDER</span>
        <button
          onClick={onOpenProfile}
          className="text-white hover:text-[#ff5500] flex items-center gap-1 transition-colors cursor-pointer"
        >
          <span>OPEN BIO</span>
          <ExternalLink className="w-2.5 h-2.5" />
        </button>
      </div>
    </div>
  );
};

export default MobileTeamShowcase;
