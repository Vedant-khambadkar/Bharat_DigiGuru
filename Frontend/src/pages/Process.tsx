import React, { useRef, useState, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  ArrowRight,
  Search,
  Compass,
  Calendar,
  Sparkles,
  Send,
  MessageSquare,
  BarChart3,
  RefreshCw,
} from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

export interface ProcessStep {
  step: number;
  title: string;
  description: string;
  phase: string;
  icon: React.ComponentType<{ className?: string }>;
  accentColor: string;
}

const PROCESS_STEPS: ProcessStep[] = [
  {
    step: 1,
    title: "Research",
    phase: "Discovery & Analysis",
    description: "Understand your business, audience, competitors, and goals.",
    icon: Search,
    accentColor: "#f59e0b",
  },
  {
    step: 2,
    title: "Strategy",
    phase: "Roadmap Formulation",
    description: "Develop a clear, realistic plan and platform roadmap.",
    icon: Compass,
    accentColor: "#f59e0b",
  },
  {
    step: 3,
    title: "Planning",
    phase: "Architecture & Pillars",
    description: "Create content calendars with themes, pillars, and ideas.",
    icon: Calendar,
    accentColor: "#f59e0b",
  },
  {
    step: 4,
    title: "Creation",
    phase: "Production & Copywriting",
    description: "Produce original content and copywriting for each post.",
    icon: Sparkles,
    accentColor: "#f59e0b",
  },
  {
    step: 5,
    title: "Publishing",
    phase: "Omnichannel Scheduling",
    description: "Schedule and publish content consistently on all platforms.",
    icon: Send,
    accentColor: "#f59e0b",
  },
  {
    step: 6,
    title: "Engagement",
    phase: "Community & Interaction",
    description: "Interact with your audience, build community, manage comments.",
    icon: MessageSquare,
    accentColor: "#f59e0b",
  },
  {
    step: 7,
    title: "Analytics",
    phase: "Data & Pattern Detection",
    description: "Track metrics, identify patterns, and measure performance.",
    icon: BarChart3,
    accentColor: "#f59e0b",
  },
  {
    step: 8,
    title: "Optimization",
    phase: "Continuous Refinement",
    description: "Refine strategy based on data and continuously improve.",
    icon: RefreshCw,
    accentColor: "#f59e0b",
  },
];

export const Process: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [activeStep, setActiveStep] = useState<number>(1);
  const scrollTriggerInstance = useRef<ScrollTrigger | null>(null);

  // GSAP ScrollTrigger Horizontal Pin-Scroll Setup (Desktop only)
  useEffect(() => {
    const section = sectionRef.current;
    const container = containerRef.current;
    const track = trackRef.current;
    if (!section || !container || !track) return;

    const mm = gsap.matchMedia();

    // Desktop Layout (>= 1024px): Pinned Horizontal Glide
    mm.add("(min-width: 1024px)", () => {
      const getScrollDistance = () => {
        return Math.max(track.scrollWidth - container.clientWidth + 80, 500);
      };

      let lastStep = 1;

      const tween = gsap.to(track, {
        x: () => -getScrollDistance(),
        ease: "none",
        scrollTrigger: {
          trigger: section,
          pin: true,
          start: "top top",
          end: () => `+=${getScrollDistance() + 800}`,
          scrub: 1,
          anticipatePin: 1,
          fastScrollEnd: true,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            const index = Math.round(self.progress * (PROCESS_STEPS.length - 1)) + 1;
            const clamped = Math.min(Math.max(index, 1), PROCESS_STEPS.length);
            if (clamped !== lastStep) {
              lastStep = clamped;
              setActiveStep(clamped);
            }
          },
        },
      });

      scrollTriggerInstance.current = tween.scrollTrigger || null;
    });

    // Mobile / Tablet (< 1024px): Fluid Native Touch Glide without pinning lock
    mm.add("(max-width: 1023px)", () => {
      gsap.set(track, { clearProps: "transform,x" });
      scrollTriggerInstance.current = null;
    });

    return () => mm.revert();
  }, []);

  // Jump to specific step
  const scrollToStep = (stepNumber: number) => {
    const st = scrollTriggerInstance.current;
    if (st) {
      const progress = (stepNumber - 1) / (PROCESS_STEPS.length - 1);
      const targetScroll = st.start + progress * (st.end - st.start);
      (window as any).lenis?.scrollTo(targetScroll, { duration: 0.8 });
    } else {
      // Mobile direct scroll inside touch container
      const container = containerRef.current;
      const track = trackRef.current;
      if (container && track) {
        const stepNodes = track.querySelectorAll(".process-step-node");
        const targetNode = stepNodes[stepNumber - 1] as HTMLElement;
        if (targetNode) {
          targetNode.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
        }
      }
    }
    setActiveStep(stepNumber);
  };


  return (
    <section
      ref={sectionRef}
      id="process-section"
      className="relative w-full min-h-screen bg-transparent text-white font-['DM_Sans']  overflow-hidden select-none flex flex-col justify-center py-10 lg:py-0"
    >
      {/* Background Subtle Ambient Lighting */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] bg-white/[0.02] blur-[140px] rounded-full" />
        <div className="absolute bottom-1/4 left-1/4 w-[400px] h-[400px] bg-white/[0.015] blur-[120px] rounded-full" />
      </div>

      <div className="relative z-10 mt-5 w-full max-w-8xl mx-auto px-5 sm:px-8 md:px-12 flex flex-col justify-between gap-10 sm:gap-14 py-8">

        {/* Top Header Row */}
        <div className="process-header flex flex-col sm:flex-row sm:items-start justify-between gap-6 border-b border-neutral-900 pb-6">
          <div className="flex flex-col gap-2">
            <span className="font-['DM_Sans'] text-xs uppercase tracking-widest text-neutral-500 select-none">
              Execution Roadmap
            </span>
            <h2 className="font-['DM_Sans'] uppercase text-3xl sm:text-4xl md:text-5xl  tracking-tight text-white flex items-center gap-3">
              <span>Our Process</span>
              <span className="inline-block translate-y-1 text-3xl sm:text-4xl font-light text-neutral-500">
                ↴
              </span>
            </h2>
            <p className="text-neutral-400 font-['Space_Grotesk',sans-serif] text-sm sm:text-base max-w-xl">
              How we deliver results, step by step
            </p>
          </div>

        </div>

        {/* Continuous Horizontal Track: On mobile it is a native touch swipeable row; on desktop it is pinned */}
        <div
          ref={containerRef}
          className="relative w-full overflow-x-auto lg:overflow-hidden pt-2 pb-6 scrollbar-none touch-pan-x touch-pan-y"
          style={{ overscrollBehaviorX: "contain" }}
        >

          {/* Horizontal Timeline Connector Bar */}
          <div className="absolute top-[38px] left-8 right-8 h-[2px] pointer-events-none z-0" />

          {/* Animated Horizontal Track */}
          <div
            ref={trackRef}
            className="flex gap-4 sm:gap-6 lg:gap-8 will-change-transform relative z-10 px-1 sm:px-2 lg:px-0"
            style={{ width: "max-content" }}
          >
            {PROCESS_STEPS.map((item) => {
              const isSelected = activeStep === item.step;
              const Icon = item.icon;

              return (
                <div
                  key={item.step}
                  onClick={() => scrollToStep(item.step)}
                  className={`process-step-node shrink-0 w-[270px] sm:w-[310px] md:w-[330px] rounded-3xl p-6 sm:p-7 bg-[#0c0c0c] border transition-all duration-500 ease-out flex flex-col gap-6 relative group cursor-pointer ${isSelected
                      ? "border-neutral-500 bg-[#111111] shadow-[0_20px_45px_rgba(0,0,0,0.85)] -translate-y-2"
                      : "border-neutral-800/90 hover:border-neutral-700 hover:-translate-y-1"
                    }`}
                >
                  {/* Top Step Number Orb with subtle glowing beacon */}
                  <div className="flex items-center justify-between relative z-10">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-base transition-all duration-500 border ${isSelected
                          ? "bg-white text-black border-white shadow-[0_0_20px_rgba(255,255,255,0.4)] scale-110"
                          : "bg-[#141414] text-neutral-300 border-neutral-700 group-hover:border-neutral-500 group-hover:text-white"
                        }`}
                    >
                      <span>{item.step}</span>
                    </div>

                    {/* Step Icon Badge */}
                    <div className="w-8 h-8 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center text-neutral-400 group-hover:text-white transition-colors">
                      <Icon className="w-4 h-4" />
                    </div>
                  </div>

                  {/* Step Title & Phase Tag */}
                  <div className="flex flex-col gap-1.5 relative z-10">
                    <span className="font-['Space_Grotesk',sans-serif] text-[11px] uppercase tracking-wider text-neutral-500 group-hover:text-neutral-400 transition-colors font-medium">
                      {item.phase}
                    </span>
                    <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight leading-snug">
                      {item.title}
                    </h3>
                  </div>

                  {/* Divider Line */}
                  <span
                    className={`h-[1.5px] rounded-full transition-all duration-500 ${isSelected ? "w-12 bg-white" : "w-6 bg-neutral-800 group-hover:w-10 group-hover:bg-neutral-600"
                      }`}
                  />

                  {/* Step Description */}
                  <p className="text-xs sm:text-[13px] text-neutral-400 group-hover:text-neutral-300 leading-relaxed font-normal">
                    {item.description}
                  </p>

                  {/* Next Step Arrow Hint */}
                  <div className="mt-auto pt-2 flex items-center justify-end text-neutral-600 group-hover:text-neutral-400 transition-colors">
                    {item.step < PROCESS_STEPS.length ? (
                      <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    ) : (
                      <span className="font-['Space_Grotesk',sans-serif] text-[10px] uppercase tracking-wider text-neutral-500 font-semibold">Complete</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </section>
  );
};

export default Process;
