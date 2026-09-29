import React, { useState, useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import LensText from "../components/LensText";
import ColorLensImage from "../components/ColorLensImage";
import WordReveal from "../components/WordReveal";
import { ChevronDown, ChevronUp, Sparkles, Target, Zap } from "lucide-react";
import Img1 from "../assets/Picture/Picture12.webp"
import Img2 from "../assets/Picture/Picture2.webp"
import Img3 from "../assets/Picture/Picture3.webp"
import Img4 from "../assets/Picture/Picture4.webp"
import Img5 from "../assets/Picture/Picture5.webp"
import Img6 from "../assets/Picture/Picture6.webp"

gsap.registerPlugin(ScrollTrigger);

interface AboutProps {
  id?: string;
}

export const About: React.FC<AboutProps> = ({ id = "about-section" }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [hoveredPillar, setHoveredPillar] = useState<number | null>(null);
  const expandedRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isExpanded && expandedRef.current) {
      // Smooth animated entry for full-width description
      gsap.fromTo(
        expandedRef.current,
        { height: 0, opacity: 0, y: -20 },
        {
          height: "auto",
          opacity: 1,
          y: 0,
          duration: 0.55,
          ease: "power3.out",
          onComplete: () => {
            (window as any).lenis?.resize();
            ScrollTrigger.refresh();
          },
        }
      );

      // Staggered fade in for paragraphs
      const paragraphs = expandedRef.current.querySelectorAll(".about-expand-anim");
      if (paragraphs.length > 0) {
        gsap.fromTo(
          paragraphs,
          { opacity: 0, y: 15 },
          {
            opacity: 1,
            y: 0,
            duration: 0.45,
            stagger: 0.1,
            delay: 0.15,
            ease: "power2.out",
          }
        );
      }
    }
  }, [isExpanded]);

  const handleToggle = () => {
    if (isExpanded && expandedRef.current) {
      gsap.to(expandedRef.current, {
        height: 0,
        opacity: 0,
        y: -15,
        duration: 0.35,
        ease: "power3.in",
        onComplete: () => {
          setIsExpanded(false);
          (window as any).lenis?.resize();
          ScrollTrigger.refresh();
        },
      });
    } else {
      setIsExpanded(true);
    }
  };

  return (
    <section
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
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 md:gap-5 items-start">
        {/* =========================================================================
            TOP LEFT: "ABOUT US" TITLE & INTRO STATEMENT (Spans 2 cols on desktop)
           ========================================================================= */}
        <div className="lg:col-span-2 flex flex-col justify-start pr-0 lg:pr-8 mb-6 lg:mb-0">
          {/* Header with red square accent */}
          <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">

            <h2 className="font-neuropol font-normal text-6xl uppercase tracking-wider text-white leading-none select-none">
              <LensText text="ABOUT US" strokeWidth="2px" strokeColor="#ffffff" />
            </h2>
          </div>

          {/* Primary Lead Paragraph */}
          <WordReveal
            text="Bharat DigiGuru is a digital media company providing clients with top-notch digital-based solutions tailored to their unique needs. We aim to be your committed partner to propel your business to success amidst the dynamic digital landscape. Whether you're a startup looking to establish a strong online presence or an established enterprise seeking to stay ahead of the curve, Bharat DigiGuru is here to be your trusted digital age partner every step of the way."
            className="font-['Space_Grotesk',sans-serif] text-xs sm:text-sm text-neutral-300 leading-relaxed sm:leading-loose tracking-wider uppercase max-w-md block"
            delay={100}
          />

          {/* Interactive Toggle Button */}
          <button
            onClick={handleToggle}
            className="mt-5 inline-flex items-center gap-2 text-xs font-['Space_Grotesk',sans-serif] uppercase tracking-widest text-neutral-400 hover:text-white transition-colors cursor-pointer w-fit group"
          >
            <span className="border-b border-neutral-700 group-hover:border-white pb-0.5 transition-colors">
              {isExpanded ? "Hide Full Story" : "Read Full Story"}
            </span>
            {isExpanded ? (
              <ChevronUp className="w-4 h-4 text-red-500 transition-transform duration-300" />
            ) : (
              <ChevronDown className="w-4 h-4 text-red-500 transition-transform duration-300" />
            )}
          </button>
        </div>

        {/* =========================================================================
            TOP RIGHT: 3 VERTICAL / SQUARE IMAGES (1 col each on desktop)
           ========================================================================= */}
        {/* Image 1: Camera Lens */}
        <div className="aspect-[3/4] rounded-md overflow-hidden  transition-all duration-300 hover:border-neutral-600">
          <ColorLensImage
            src={Img1}
            alt="Analog camera lens"
            lensRadius={100}
          />
        </div>

        {/* Image 2: Woman with Prism/Lens */}
        <div className="aspect-[3/4] rounded-md overflow-hidden  transition-all duration-300 hover:border-neutral-600">
          <ColorLensImage
            src={Img2}
            alt="Portrait with crystal lens"
            lensRadius={100}
          />
        </div>

        {/* Image 3: Laptop Hands & Mug */}
        <div className="aspect-[3/4] rounded-md overflow-hidden  transition-all duration-300 hover:border-neutral-600">
          <ColorLensImage
            src={Img3}
            alt="Overhead laptop keyboard typing"
            lensRadius={100}
          />
        </div>

        {/* =========================================================================
            FULL-WIDTH ANIMATED STORY BREAKDOWN (Spans all 5 columns!)
           ========================================================================= */}
        {isExpanded && (
          <div
            ref={expandedRef}
            className="col-span-1 md:col-span-2 lg:col-span-5 w-full my-4 overflow-hidden rounded-2xl bg-neutral-900/90 border border-neutral-800 shadow-2xl backdrop-blur-xl p-6 sm:p-8 md:p-10"
          >
            <div className="flex flex-col gap-6">
              {/* Header with badge and close button */}
              <div className="flex items-center justify-between border-b border-neutral-800/80 pb-4">
                <div className="flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#ff2d55] animate-pulse shadow-[0_0_8px_#ff2d55]" />
                  <span className="font-['Space_Grotesk',sans-serif] text-xs uppercase tracking-widest text-neutral-200 font-semibold">
                    The Bharat DigiGuru Narrative & Full Story
                  </span>
                </div>
                <button
                  onClick={handleToggle}
                  className="inline-flex items-center gap-1.5 text-xs font-['Space_Grotesk',sans-serif] uppercase tracking-wider text-neutral-400 hover:text-white transition-colors cursor-pointer"
                >
                  <span>Close</span>
                  <ChevronUp className="w-4 h-4 text-red-400" />
                </button>
              </div>

              {/* 2-Column Responsive Full-Width Narrative */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
                {/* Column 1 */}
                <div className="flex flex-col gap-6">
                  <div className="about-expand-anim">
                    <span className="text-[11px] font-['Space_Grotesk',sans-serif] uppercase tracking-widest text-red-400 font-semibold block mb-1.5">
                      [ Tailored Solutions & Brand Architecture ]
                    </span>
                    <p className="font-['Space_Grotesk',sans-serif] text-xs sm:text-sm text-neutral-300 leading-relaxed sm:leading-loose uppercase">
                      At Bharat DigiGuru, we understand that each brand is unique, with its own set of challenges
                      and aspirations. That's why we pride ourselves on our ability to tailor our services to meet
                      the distinct needs and objectives of each client we work with.
                    </p>
                  </div>

                  <div className="about-expand-anim">
                    <span className="text-[11px] font-['Space_Grotesk',sans-serif] uppercase tracking-widest text-red-400 font-semibold block mb-1.5">
                      [ Expert Minds & Tangible Results ]
                    </span>
                    <p className="font-['Space_Grotesk',sans-serif] text-xs sm:text-sm text-neutral-300 leading-relaxed sm:leading-loose uppercase">
                      Our team of experts and creative minds are passionate about leveraging the latest digital
                      trends and technologies to deliver tangible results. From social media management to
                      search engine optimization, our comprehensive suite of services is designed to elevate your
                      brand's online presence and drive meaningful engagement with your target audience.
                    </p>
                  </div>
                </div>

                {/* Column 2 */}
                <div className="flex flex-col gap-6">
                  <div className="about-expand-anim">
                    <span className="text-[11px] font-['Space_Grotesk',sans-serif] uppercase tracking-widest text-neutral-400 font-semibold block mb-1.5">
                      [ Relentless Innovation & Measurable ROI ]
                    </span>
                    <p className="font-['Space_Grotesk',sans-serif] text-xs sm:text-sm text-neutral-300 leading-relaxed sm:leading-loose uppercase">
                      What sets us apart is our unwavering commitment to excellence and our relentless pursuit of
                      innovation. We believe in pushing boundaries, challenging conventions, and thinking outside
                      the box to create truly impactful digital marketing strategies that deliver measurable ROI.
                    </p>
                  </div>

                  <div className="about-expand-anim">
                    <span className="text-[11px] font-['Space_Grotesk',sans-serif] uppercase tracking-widest text-neutral-400 font-semibold block mb-1.5">
                      [ Your Trusted Digital Ally ]
                    </span>
                    <p className="font-['Space_Grotesk',sans-serif] text-xs sm:text-sm text-neutral-300 leading-relaxed sm:leading-loose uppercase">
                      Whether you aim to broaden your online reach, invigorate your social media presence, or
                      optimize your website for optimal impact, Bharat DigiGuru stands ready as your trusted ally
                      in navigating the ever-evolving digital landscape. Join us on this exciting journey towards digital success.
                      Together, let's unlock the full potential of your brand and achieve new heights in the digital realm with
                      Bharat DigiGuru by your side.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            BOTTOM ROW: WIDE DESK TABLET PHOTO (Spans 3 cols) + 2 VERTICAL IMAGES
           ========================================================================= */}
        {/* Image 4: Wide Graphic Tablet with Stylus & Laptop Screen */}
        <div className="lg:col-span-3 aspect-[16/9] md:aspect-[16/8] lg:aspect-[16/8.2] rounded-md overflow-hidden  transition-all duration-300 hover:border-neutral-600">
          <ColorLensImage
            src={Img4}
            alt="Drawing on digital tablet with stylus and laptop"
            lensRadius={120}
          />
        </div>

        {/* Image 5: Studio/Classroom with Desks & Green Board */}
        <div className="aspect-[3/4] rounded-md overflow-hidden  transition-all duration-300 hover:border-neutral-600">
          <ColorLensImage
            src={Img5}
            alt="Studio workshop and classroom desks"
            lensRadius={100}
          />
        </div>

        {/* Image 6: Controller / Architectural Light Beams & Shadows */}
        <div className="aspect-[3/4] rounded-md overflow-hidden  transition-all duration-300 hover:border-neutral-600">
          <ColorLensImage
            src={Img6}
            alt="White gaming controller"
            lensRadius={100}
          />
        </div>
      </div>

      {/* =========================================================================
          BHARAT DIGIGURU CORE PILLARS & STORY BREAKDOWN
         ========================================================================= */}
      <div className="relative z-10 mt-16 sm:mt-24 pt-12 border-t border-neutral-800">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-10">
          {/* Pillar 1: Tailored Solutions */}
          <div
            onMouseEnter={() => setHoveredPillar(1)}
            onMouseLeave={() => setHoveredPillar(null)}
            className="flex flex-col gap-3 group cursor-default"
          >
            <div className="w-10 h-10 rounded-lg  flex items-center justify-center text-neutral-300 group-hover:text-white group-hover:border-neutral-700 transition-all">
              <Target className="w-5 h-5" />
            </div>
            <WordReveal
              text="Tailored Solutions"
              className="font-neuropol text-base sm:text-lg font-normal uppercase tracking-wider text-white"
              staggerMs={50}
              trigger={hoveredPillar === 1}
            />
            <WordReveal
              text="At Bharat DigiGuru, we understand that each brand is unique, with its own set of challenges and aspirations. That's why we pride ourselves on our ability to tailor our services to meet the distinct needs and objectives of each client we work with."
              className="font-['Space_Grotesk',sans-serif] text-xs sm:text-sm text-neutral-400 leading-loose sm:leading-relaxed uppercase group-hover:text-neutral-200 transition-colors"
              delay={40}
              trigger={hoveredPillar === 1}
            />
          </div>

          {/* Pillar 2: Expert Team & Tangible Results */}
          <div
            onMouseEnter={() => setHoveredPillar(2)}
            onMouseLeave={() => setHoveredPillar(null)}
            className="flex flex-col gap-3 group cursor-default"
          >
            <div className="w-10 h-10 rounded-lg  flex items-center justify-center text-neutral-300 group-hover:text-white group-hover:border-neutral-700 transition-all">
              <Zap className="w-5 h-5" />
            </div>
            <WordReveal
              text="Expert Minds & Trends"
              className="font-neuropol text-base sm:text-lg font-normal uppercase tracking-wider text-white"
              staggerMs={50}
              delay={50}
              trigger={hoveredPillar === 2}
            />
            <WordReveal
              text="Our team of experts and creative minds are passionate about leveraging the latest digital trends and technologies to deliver tangible results. From social media management to search engine optimization, our comprehensive suite of services elevates your online presence."
              className="font-['Space_Grotesk',sans-serif] text-xs sm:text-sm text-neutral-400 leading-loose sm:leading-relaxed uppercase group-hover:text-neutral-200 transition-colors"
              delay={90}
              trigger={hoveredPillar === 2}
            />
          </div>

          {/* Pillar 3: Relentless Innovation */}
          <div
            onMouseEnter={() => setHoveredPillar(3)}
            onMouseLeave={() => setHoveredPillar(null)}
            className="flex flex-col gap-3 group cursor-default"
          >
            <div className="w-10 h-10 rounded-lg  flex items-center justify-center text-neutral-300 group-hover:text-white group-hover:border-neutral-700 transition-all">
              <Sparkles className="w-5 h-5" />
            </div>
            <WordReveal
              text="Relentless Innovation & ROI"
              className="font-neuropol text-base sm:text-lg font-normal uppercase tracking-wider text-white"
              staggerMs={50}
              delay={100}
              trigger={hoveredPillar === 3}
            />
            <WordReveal
              text="What sets us apart is our unwavering commitment to excellence and our relentless pursuit of innovation. We believe in pushing boundaries, challenging conventions, and thinking outside the box to create truly impactful digital marketing strategies that deliver measurable ROI."
              className="font-['Space_Grotesk',sans-serif] text-xs sm:text-sm text-neutral-400 leading-loose sm:leading-relaxed uppercase group-hover:text-neutral-200 transition-colors"
              delay={140}
              trigger={hoveredPillar === 3}
            />
          </div>
        </div>

        {/* Final Mission & Partnership Statement */}
        <div
          onMouseEnter={() => setHoveredPillar(4)}
          onMouseLeave={() => setHoveredPillar(null)}
          className="mt-8 sm:mt-12 p-5 sm:p-7 md:p-8 rounded-2xl bg-neutral-900/50 border border-neutral-800/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-5 sm:gap-6 group cursor-default w-full overflow-hidden"
        >
          <div className="w-full max-w-3xl">
            <WordReveal
              text="Join Us On The Journey"
              className="font-['Syne',sans-serif] text-base sm:text-lg font-bold uppercase tracking-wider text-white mb-2 block"
              staggerMs={50}
              trigger={hoveredPillar === 4}
            />
            <WordReveal
              text="Whether you aim to broaden your online reach, invigorate your social media presence, or optimize your website for optimal impact, Bharat DigiGuru stands ready as your trusted ally in navigating the ever-evolving digital landscape. Together, let's unlock the full potential of your brand and achieve new heights in the digital realm with Bharat DigiGuru by your side."
              className="font-['Space_Grotesk',sans-serif] text-xs sm:text-sm text-neutral-300 leading-normal sm:leading-relaxed uppercase block break-words"
              delay={80}
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
