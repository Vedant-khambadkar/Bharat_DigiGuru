import React, { useState, useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import LensText from "../components/LensText";
import ColorLensImage from "../components/ColorLensImage";
import WordReveal from "../components/WordReveal";
import { Sparkles, Target, Zap } from "lucide-react";
import { preloadMediaList } from "../utils/mediaCache";

gsap.registerPlugin(ScrollTrigger);

const CLOUDFRONT_BASE = (
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_CLOUDFRONT_URL) ||
  "https://d1mou18mn47yy7.cloudfront.net"
).replace(/\/+$/, "");

export const ABOUT_IMAGES = {
  img1: `${CLOUDFRONT_BASE}/assets/Picture/Picture10.webp`,
  img2: `${CLOUDFRONT_BASE}/assets/Picture/Picture2.webp`,
  img3: `${CLOUDFRONT_BASE}/assets/Picture/Picture3.webp`,
  img4: `${CLOUDFRONT_BASE}/assets/Picture/Picture4.webp`,
  img5: `${CLOUDFRONT_BASE}/assets/Picture/Picture5.webp`,
  img6: `${CLOUDFRONT_BASE}/assets/Picture/Picture6.webp`,
};

export const preloadAboutAssets = async (): Promise<void> => {
  await preloadMediaList(Object.values(ABOUT_IMAGES), { priority: "idle" });
};

interface AboutProps {
  id?: string;
}

export const About: React.FC<AboutProps> = ({ id = "about-section" }) => {
  const containerRef = useRef<HTMLElement>(null);
  const [hoveredPillar, setHoveredPillar] = useState<number | null>(null);

  // Preload and store in persistent CacheStorage on mount
  useEffect(() => {
    preloadAboutAssets().catch(() => {});
  }, []);

  // Coordinated, high-performance responsive GSAP entrance animations
  useEffect(() => {
    const ctx = gsap.context(() => {
      // Title block reveal
      gsap.fromTo(
        ".about-title-block",
        { opacity: 0, y: 24 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: "power2.out",
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top 88%",
            toggleActions: "play none none none",
          },
        }
      );

      // Photo grid items staggered reveal
      gsap.fromTo(
        ".about-grid-card",
        { opacity: 0, y: 20, scale: 0.98 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.5,
          stagger: 0.06,
          ease: "power2.out",
          scrollTrigger: {
            trigger: ".about-photo-grid",
            start: "top 85%",
            toggleActions: "play none none none",
          },
        }
      );

      // Core pillars reveal
      gsap.fromTo(
        ".about-pillar-card",
        { opacity: 0, y: 24 },
        {
          opacity: 1,
          y: 0,
          duration: 0.55,
          stagger: 0.08,
          ease: "power2.out",
          scrollTrigger: {
            trigger: ".about-pillars-grid",
            start: "top 88%",
            toggleActions: "play none none none",
          },
        }
      );

      // CTA Banner reveal
      gsap.fromTo(
        ".about-cta-card",
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.5,
          ease: "power2.out",
          scrollTrigger: {
            trigger: ".about-cta-card",
            start: "top 92%",
            toggleActions: "play none none none",
          },
        }
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={containerRef}
      id={id}
      className="relative z-10 min-h-screen bg-transparent text-white px-4 sm:px-8 md:px-12 lg:px-16 py-12 sm:py-20 md:py-24 mx-auto w-full max-w-8xl overflow-hidden flex flex-col justify-center"
    >
      {/* Subtle Dedicated Ambient Lighting for About Us */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] bg-white/[0.04] blur-[130px] rounded-full" />
        <div className="absolute bottom-1/4 left-1/4 w-[400px] h-[400px] bg-red-500/[0.03] blur-[120px] rounded-full" />
      </div>

      {/* =========================================================================
          EDITORIAL PHOTO GRID (Matching Reference Mockup)
         ========================================================================= */}
      <div className="about-photo-grid relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 md:gap-5 items-start">
        {/* =========================================================================
            TOP LEFT: "ABOUT US" TITLE & INTRO STATEMENT (Spans 2 cols on desktop)
           ========================================================================= */}
        <div className="about-title-block col-span-full lg:col-span-2 flex flex-col justify-start pr-0 lg:pr-8 mb-6 lg:mb-0">
          {/* Header with red square accent */}
          <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
            <h2 className="font-neuropol font-normal text-4xl sm:text-5xl lg:text-6xl uppercase tracking-wider text-white leading-none select-none">
              <LensText text="ABOUT US" strokeWidth="2px" strokeColor="#ffffff" />
            </h2>
          </div>

          {/* Primary Lead Paragraph */}
          <WordReveal
            text="Bharat DigiGuru is a digital media company providing clients with top-notch digital-based solutions tailored to their unique needs. We aim to be your committed partner to propel your business to success amidst the dynamic digital landscape. Whether you're a startup looking to establish a strong online presence or an established enterprise seeking to stay ahead of the curve, Bharat DigiGuru is here to be your trusted digital age partner every step of the way."
            className="font-['Space_Grotesk',sans-serif] text-xs sm:text-sm text-neutral-300 leading-relaxed sm:leading-loose tracking-wider uppercase max-w-xl lg:max-w-md block"
            delay={80}
            staggerMs={16}
          />
        </div>

        {/* =========================================================================
            TOP RIGHT: 3 VERTICAL / SQUARE IMAGES (1 col each on desktop)
           ========================================================================= */}
        {/* Image 1: Camera Lens */}
        <div className="about-grid-card w-full aspect-[3/4] rounded-xl lg:rounded-md overflow-hidden transition-all duration-300 hover:border-neutral-600 will-change-transform">
          <ColorLensImage
            src={ABOUT_IMAGES.img1}
            alt="Analog camera lens"
            lensRadius={100}
          />
        </div>

        {/* Image 2: Woman with Prism/Lens */}
        <div className="about-grid-card w-full aspect-[3/4] rounded-xl lg:rounded-md overflow-hidden transition-all duration-300 hover:border-neutral-600 will-change-transform">
          <ColorLensImage
            src={ABOUT_IMAGES.img2}
            alt="Portrait with crystal lens"
            lensRadius={100}
          />
        </div>

        {/* Image 3: Laptop Hands & Mug */}
        <div className="about-grid-card w-full aspect-[3/4] rounded-xl lg:rounded-md overflow-hidden transition-all duration-300 sm:col-span-2 lg:col-span-1 will-change-transform">
          <ColorLensImage
            src={ABOUT_IMAGES.img3}
            alt="Overhead laptop keyboard typing"
            lensRadius={100}
          />
        </div>

        {/* Image 4: Wide Graphic Tablet with Stylus & Laptop Screen */}
        <div className="about-grid-card col-span-full lg:col-span-3 aspect-[16/9] lg:aspect-[16/8.2] rounded-xl lg:rounded-md overflow-hidden transition-all duration-300 hover:border-neutral-600 will-change-transform">
          <ColorLensImage
            src={ABOUT_IMAGES.img4}
            alt="Drawing on digital tablet with stylus and laptop"
            lensRadius={120}
          />
        </div>

        {/* Image 5: Studio/Classroom with Desks & Green Board */}
        <div className="about-grid-card w-full aspect-[3/4] lg:aspect-[3/4.85] rounded-xl lg:rounded-md overflow-hidden transition-all duration-300 hover:border-neutral-600 will-change-transform">
          <ColorLensImage
            src={ABOUT_IMAGES.img5}
            alt="Studio workshop and classroom desks"
            lensRadius={100}
          />
        </div>

        {/* Image 6: Controller / Architectural Light Beams & Shadows */}
        <div className="about-grid-card w-full aspect-[3/4] lg:aspect-[3/4.85] rounded-xl lg:rounded-md overflow-hidden transition-all duration-300 hover:border-neutral-600 will-change-transform">
          <ColorLensImage
            src={ABOUT_IMAGES.img6}
            alt="White gaming controller"
            lensRadius={100}
          />
        </div>
      </div>

      {/* =========================================================================
          BHARAT DIGIGURU CORE PILLARS & STORY BREAKDOWN
         ========================================================================= */}
      <div className="relative z-10 mt-16 sm:mt-24 pt-12 border-t border-neutral-800">
        <div className="about-pillars-grid grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-10">
          {/* Pillar 1: Tailored Solutions */}
          <div
            onMouseEnter={() => setHoveredPillar(1)}
            onMouseLeave={() => setHoveredPillar(null)}
            className="about-pillar-card flex flex-col gap-3 group cursor-default"
          >
            <div className="w-10 h-10 rounded-lg flex items-center justify-center text-neutral-300 group-hover:text-white group-hover:border-neutral-700 transition-all">
              <Target className="w-5 h-5" />
            </div>
            <WordReveal
              text="Tailored Solutions"
              className="font-neuropol text-base sm:text-lg font-normal uppercase tracking-wider text-white"
              staggerMs={30}
              trigger={hoveredPillar === 1}
            />
            <WordReveal
              text="At Bharat DigiGuru, we understand that each brand is unique, with its own set of challenges and aspirations. That's why we pride ourselves on our ability to tailor our services to meet the distinct needs and objectives of each client we work with."
              className="font-['Space_Grotesk',sans-serif] text-xs sm:text-sm text-neutral-400 leading-loose sm:leading-relaxed uppercase group-hover:text-neutral-200 transition-colors"
              delay={30}
              staggerMs={14}
              trigger={hoveredPillar === 1}
            />
          </div>

          {/* Pillar 2: Expert Team & Tangible Results */}
          <div
            onMouseEnter={() => setHoveredPillar(2)}
            onMouseLeave={() => setHoveredPillar(null)}
            className="about-pillar-card flex flex-col gap-3 group cursor-default"
          >
            <div className="w-10 h-10 rounded-lg flex items-center justify-center text-neutral-300 group-hover:text-white group-hover:border-neutral-700 transition-all">
              <Zap className="w-5 h-5" />
            </div>
            <WordReveal
              text="Expert Minds & Trends"
              className="font-neuropol text-base sm:text-lg font-normal uppercase tracking-wider text-white"
              staggerMs={30}
              delay={30}
              trigger={hoveredPillar === 2}
            />
            <WordReveal
              text="Our team of experts and creative minds are passionate about leveraging the latest digital trends and technologies to deliver tangible results. From social media management to search engine optimization, our comprehensive suite of services elevates your online presence."
              className="font-['Space_Grotesk',sans-serif] text-xs sm:text-sm text-neutral-400 leading-loose sm:leading-relaxed uppercase group-hover:text-neutral-200 transition-colors"
              delay={60}
              staggerMs={14}
              trigger={hoveredPillar === 2}
            />
          </div>

          {/* Pillar 3: Relentless Innovation */}
          <div
            onMouseEnter={() => setHoveredPillar(3)}
            onMouseLeave={() => setHoveredPillar(null)}
            className="about-pillar-card flex flex-col gap-3 group cursor-default"
          >
            <div className="w-10 h-10 rounded-lg flex items-center justify-center text-neutral-300 group-hover:text-white group-hover:border-neutral-700 transition-all">
              <Sparkles className="w-5 h-5" />
            </div>
            <WordReveal
              text="Relentless Innovation & ROI"
              className="font-neuropol text-base sm:text-lg font-normal uppercase tracking-wider text-white"
              staggerMs={30}
              delay={60}
              trigger={hoveredPillar === 3}
            />
            <WordReveal
              text="What sets us apart is our unwavering commitment to excellence and our relentless pursuit of innovation. We believe in pushing boundaries, challenging conventions, and thinking outside the box to create truly impactful digital marketing strategies that deliver measurable ROI."
              className="font-['Space_Grotesk',sans-serif] text-xs sm:text-sm text-neutral-400 leading-loose sm:leading-relaxed uppercase group-hover:text-neutral-200 transition-colors"
              delay={90}
              staggerMs={14}
              trigger={hoveredPillar === 3}
            />
          </div>
        </div>

        {/* Final Mission & Partnership Statement */}
        <div
          onMouseEnter={() => setHoveredPillar(4)}
          onMouseLeave={() => setHoveredPillar(null)}
          className="about-cta-card mt-8 sm:mt-12 p-5 sm:p-7 md:p-8 rounded-2xl bg-neutral-900/50 border border-neutral-800/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-5 sm:gap-6 group cursor-default w-full overflow-hidden will-change-transform"
        >
          <div className="w-full max-w-3xl">
            <WordReveal
              text="Join Us On The Journey"
              className="font-['Syne',sans-serif] text-base sm:text-lg font-bold uppercase tracking-wider text-white mb-2 block"
              staggerMs={30}
              trigger={hoveredPillar === 4}
            />
            <WordReveal
              text="Whether you aim to broaden your online reach, invigorate your social media presence, or optimize your website for optimal impact, Bharat DigiGuru stands ready as your trusted ally in navigating the ever-evolving digital landscape. Together, let's unlock the full potential of your brand and achieve new heights in the digital realm with Bharat DigiGuru by your side."
              className="font-['Space_Grotesk',sans-serif] text-xs sm:text-sm text-neutral-300 leading-normal sm:leading-relaxed uppercase block break-words"
              delay={50}
              staggerMs={14}
              trigger={hoveredPillar === 4}
            />
          </div>
          <a
            href="#services-section"
            className="w-full sm:w-auto shrink-0 px-5 py-3 rounded-xl bg-white text-black font-['Space_Grotesk',sans-serif] text-xs uppercase tracking-wider font-semibold hover:bg-neutral-200 transition-colors text-center"
          >
            Explore Solutions →
          </a>
        </div>
      </div>
    </section>
  );
};

export default About;
