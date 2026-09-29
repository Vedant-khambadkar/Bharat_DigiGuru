import React, { useRef, useState, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  Plus,
  Circle,
  Sparkles,
  Square,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

interface PillarCard {
  number: string;
  title: string;
  description: string;
}

const PILLARS: PillarCard[] = [
  {
    number: "01",
    title: "Strategy First, Posts Second",
    description:
      "We don't just create content — we build a framework. Every post serves a strategic goal aligned with your business objectives.",
  },
  {
    number: "02",
    title: "Consistent Brand Voice",
    description:
      "Your audience knows who you are. We maintain consistency in tone, messaging, and visual identity across all platforms.",
  },
  {
    number: "03",
    title: "Data-Driven Decisions",
    description:
      "We don't guess. Every strategy adjustment is backed by analytics, trends, and performance data.",
  },
  {
    number: "04",
    title: "Audience-Focused Content",
    description:
      "We understand your audience, not just your brand. Content is built around what resonates with the people you're trying to reach.",
  },
  {
    number: "05",
    title: "Clear Communication",
    description:
      "You get detailed monthly reports, performance insights, and honest recommendations — no corporate jargon.",
  },
  {
    number: "06",
    title: "Long-Term Partnership",
    description:
      "We're invested in your success. We work to build sustainable growth, not quick wins.",
  },
];

const VALUES = [
  { icon: Plus, label: "Experience" },
  { icon: Circle, label: "Consistency" },
  { icon: Sparkles, label: "Quality" },
  { icon: Square, label: "Dedication" },
];

export const WhyWorkWithUs: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const scrollTriggerInstance = useRef<ScrollTrigger | null>(null);

  // Smooth scroll pinning setup
  useEffect(() => {
    const section = sectionRef.current;
    const container = containerRef.current;
    const track = trackRef.current;
    if (!section || !container || !track) return;

    const ctx = gsap.context(() => {
      // Calculate how far the horizontal track needs to travel
      const getScrollDistance = () => {
        return Math.max(track.scrollWidth - container.clientWidth + 80, 400);
      };

      const tween = gsap.to(track, {
        x: () => -getScrollDistance(),
        ease: "none",
        scrollTrigger: {
          trigger: section,
          pin: true,
          start: "top top",
          end: () => `+=${getScrollDistance() + 600}`,
          scrub: 1,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            const index = Math.round(self.progress * (PILLARS.length - 1));
            setActiveIndex(Math.min(Math.max(index, 0), PILLARS.length - 1));
          },
        },
      });

      scrollTriggerInstance.current = tween.scrollTrigger || null;
    }, section);

    return () => ctx.revert();
  }, []);

  // Jump to specific slide
  const scrollToIndex = (index: number) => {
    const st = scrollTriggerInstance.current;
    if (st) {
      const progress = index / (PILLARS.length - 1);
      const targetScroll = st.start + progress * (st.end - st.start);
      (window as any).lenis?.scrollTo(targetScroll, { duration: 0.8 });
    }
    setActiveIndex(index);
  };

  const handlePrev = () => {
    if (activeIndex > 0) {
      scrollToIndex(activeIndex - 1);
    }
  };

  const handleNext = () => {
    if (activeIndex < PILLARS.length - 1) {
      scrollToIndex(activeIndex + 1);
    }
  };

  return (
    <section
      ref={sectionRef}
      id="work-with-us-section"
      className="relative w-full min-h-screen bg-transparent text-white font-['Plus_Jakarta_Sans',sans-serif] overflow-hidden select-none border-t border-b border-neutral-900/60 flex flex-col justify-center py-12 lg:py-0"
    >
      {/* Subtle Dedicated Ambient Lighting */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] bg-white/[0.02] blur-[140px] rounded-full" />
        <div className="absolute bottom-1/4 left-1/4 w-[400px] h-[400px] bg-white/[0.015] blur-[120px] rounded-full" />
      </div>

      <div className="relative z-10 w-full max-w-8xl mx-auto px-5 sm:px-8 md:px-12 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          
          {/* =========================================================================
              LEFT COLUMN: Title, Core Values, Review Testimonial (NO BOX/BORDER)
             ========================================================================= */}
          <div className="why-us-left-col lg:col-span-4 flex flex-col justify-between gap-8 sm:gap-12">
            <div className="flex flex-col gap-6 sm:gap-8">
              <h2 className="text-5xl font-['Material Symbols Rounded'] sm:text-6xl md:text-7xl font-bold tracking-tight text-white leading-none">
                Why us
              </h2>

              {/* Core Values List */}
              <div className="flex flex-col gap-3 pt-1">
                {VALUES.map((val, idx) => {
                  const Icon = val.icon;
                  return (
                    <div key={idx} className="flex items-center gap-3 text-neutral-400 group cursor-default">
                      <Icon className="w-3.5 h-3.5 text-neutral-400 group-hover:text-white transition-colors" />
                      <span className="font-['Space_Grotesk',sans-serif] text-sm text-neutral-300 group-hover:text-white transition-colors font-medium">
                        {val.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Testimonial / Review (Clean & Borderless, directly on canvas) */}
            <div className="flex flex-col gap-3.5 max-w-sm">
              <p className="text-xs sm:text-[13px] text-neutral-300 leading-relaxed italic">
                "We asked Bharat DigiGuru to elevate our brand and digital presence from scratch, and they absolutely nailed it."
              </p>

              <div className="flex flex-col pt-1">
                <span className="text-xs font-bold text-white uppercase">Shubham Singh</span>
                <span className="text-[11px] text-neutral-500 font-['Space_Grotesk',sans-serif]">Marketing Director, Lunos</span>
              </div>
            </div>
          </div>

          {/* =========================================================================
              RIGHT COLUMN: Main Statement & Horizontal Scroll-Pinned Columns
             ========================================================================= */}
          <div className="lg:col-span-8 flex flex-col gap-8 sm:gap-10 overflow-hidden">
            
            {/* Top Mission Statement */}
            <div className="why-us-statement max-w-3xl ">
              <p className="text-xl sm:text-2xl md:text-3xl mt-12 font-normal text-neutral-200 leading-relaxed sm:leading-snug">
                We design and build tailored digital experiences that not only elevate your brand visually but also deliver measurable results that support long-term business growth.
              </p>
            </div>

            {/* Horizontal Track Container */}
            <div ref={containerRef} className="relative w-full overflow-hidden pt-4">
              <div
                ref={trackRef}
                className="flex gap-10 sm:gap-14 will-change-transform"
                style={{ width: "max-content" }}
              >
                {PILLARS.map((pillar, index) => (
                  <div
                    key={index}
                    className="why-us-pillar-column w-[270px] sm:w-[320px] md:w-[340px] shrink-0 min-h-[290px] sm:min-h-[320px] flex flex-col justify-between relative group select-none"
                  >
                    {/* Background Watermark Number */}
                    <span className="absolute -top-6 -right-2 font-bold text-8xl sm:text-9xl text-white/[0.04] group-hover:text-white/[0.08] transition-colors pointer-events-none select-none tracking-tighter">
                      {pillar.number}
                    </span>

                    {/* Top Large Bold Number */}
                    <div className="relative z-10">
                      <span className="text-5xl sm:text-6xl font-bold tracking-tight text-white group-hover:text-white transition-colors">
                        {pillar.number}
                      </span>
                    </div>

                    {/* Bottom Title & Description */}
                    <div className="relative z-10 mt-auto pt-8 flex flex-col gap-2.5">
                      <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight leading-snug group-hover:text-white transition-colors">
                        {pillar.title}
                      </h3>
                      <p className="text-xs sm:text-[13px] text-neutral-400 group-hover:text-neutral-300 leading-relaxed font-normal">
                        {pillar.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Progress & Controls Bar */}
              <div className="flex items-center justify-between pt-8 border-t border-neutral-900/80 mt-4">
                {/* Active Indicator Text */}
                <div className="flex items-center gap-2 text-neutral-400 font-['Space_Grotesk',sans-serif] text-xs">
                  <span>Pillar</span>
                  <span className="font-bold text-white text-sm">0{activeIndex + 1}</span>
                  <span>of 0{PILLARS.length}</span>
                </div>

                {/* Controls */}
                <div className="flex items-center gap-5">
                  {/* Progress Dash Indicators */}
                  <div className="flex items-center gap-1.5">
                    {PILLARS.map((_, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => scrollToIndex(i)}
                        aria-label={`Go to pillar ${i + 1}`}
                        className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                          activeIndex === i
                            ? "w-8 bg-white shadow-[0_0_10px_rgba(255,255,255,0.7)]"
                            : "w-3 bg-neutral-800 hover:bg-neutral-600"
                        }`}
                      />
                    ))}
                  </div>

                  {/* Left / Right Arrow Buttons */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handlePrev}
                      disabled={activeIndex === 0}
                      aria-label="Previous Pillar"
                      className={`w-10 h-10 rounded-full border flex items-center justify-center transition-all duration-300 ${
                        activeIndex > 0
                          ? "border-neutral-700 bg-[#0e0e0e] text-white hover:bg-neutral-800 hover:border-neutral-500 cursor-pointer active:scale-90 shadow-sm"
                          : "border-neutral-900 bg-[#0a0a0a] text-neutral-700 cursor-not-allowed opacity-40"
                      }`}
                    >
                      <ArrowLeft className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={handleNext}
                      disabled={activeIndex === PILLARS.length - 1}
                      aria-label="Next Pillar"
                      className={`w-10 h-10 rounded-full border flex items-center justify-center transition-all duration-300 ${
                        activeIndex < PILLARS.length - 1
                          ? "border-neutral-700 bg-[#0e0e0e] text-white hover:bg-neutral-800 hover:border-neutral-500 cursor-pointer active:scale-90 shadow-sm"
                          : "border-neutral-900 bg-[#0a0a0a] text-neutral-700 cursor-not-allowed opacity-40"
                      }`}
                    >
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyWorkWithUs;
