import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { X, Clock, Calendar, CheckCircle2 } from "lucide-react";
import BlogCard from "../components/BlogCard";
import type { BlogItem } from "../components/BlogCard";
import LensText from "../components/LensText";

gsap.registerPlugin(ScrollTrigger);

const BLOGS_DATA: BlogItem[] = [
  {
    id: "empower-brands-digital-journey",
    number: "(01)",
    category: "Digital Acceleration",
    title: "Empower Your Brand's Digital Journey with Bharat DigiGuru",
    description:
      "In today's digital landscape, establishing a formidable online presence is essential for businesses striving to excel in competitive markets.",
    readTime: "6 MIN READ",
    date: "AUG 2026",
    content: [
      "In today's digital landscape, establishing a formidable online presence is essential for businesses striving to excel in competitive markets. The ever-evolving nature of digital media can be overwhelming, but Bharat DigiGuru serves as a steadfast ally in navigating this dynamic terrain. Our extensive range of digital media services is meticulously crafted to enhance the brand's visibility, engagement, and profitability.",
      "Specializing in Social Media Marketing (SMM), Website Design and development, and more, Bharat DigiGuru tailors solutions to meet your business requirements. Whether seeking increased organic traffic, optimizing social media engagement, or streamlining lead generation, our team of experts is dedicated to realizing clients' objectives.",
      "In conclusion, Bharat DigiGuru is synonymous with innovation and expertise in digital media services. Our comprehensive offerings empower businesses to harness the full potential of the digital landscape, unlocking new opportunities for growth and success. Embark confidently on the brand's digital journey, backed by Bharat DigiGuru's unwavering commitment to excellence.",
    ],
    bullets: [
      "Elevate the brand's social media presence with expert Social Media Marketing Strategies",
      "Boost website visibility and organic traffic through tailored Search Engine Optimization (SEO) Services",
      "Enhance social media engagement and brand visibility with strategic Social Media Optimization (SMO) techniques",
      "Safeguard and manage online reputation effectively with Online Reputation Management (ORM) solutions",
      "Reach target audience and drive conversions with targeted Facebook, Google, and Instagram advertising campaigns",
      "Amplify brand presence and reach through innovative promotional strategies",
      "Increase video visibility and engagement with specialized YouTube promotion services",
      "Foster meaningful connections and engagement with the audience through WhatsApp Community management",
      "Streamline lead generation processes and drive efficiency with advanced Lead Automation services",
      "Generate high-quality leads and drive conversions with targeted lead-generation strategies",
      "Ensure consistency in messaging across all digital platforms with comprehensive Content Management solutions",
      "Boost customer relationships and drive conversions with personalized Email Marketing campaigns that resonate with the audience",
      "Create visually stunning, user-friendly websites that reflect the brand's identity and convert visitors into customers",
      "Support the website running smoothly and up-to-date with reliable Website Maintenance Services",
    ],
  },
  {
    id: "vital-role-digital-media-tech-era",
    number: "(02)",
    category: "Tech Era & Culture",
    title: "Embracing the Vital Role of Digital Media in the Technological Era",
    description:
      "The significance of digital media in the contemporary world cannot be overstated, serving as the cornerstone of our technological revolution.",
    readTime: "8 MIN READ",
    date: "AUG 2026",
    image: "https://images.unsplash.com/photo-1508739773434-c26b3d09e071?q=80&w=1000&auto=format&fit=crop&fm=webp",
    content: [
      "The significance of digital media in the contemporary world cannot be overstated. Technology permeates every aspect of our lives, and digital media stands as the cornerstone of this technological revolution. From communication and entertainment to education and commerce, digital media plays a pivotal role in shaping our daily experiences and interactions.",
      "One of the primary reasons for digital media's importance lies in its unparalleled reach and accessibility. Unlike traditional media forms such as print or broadcast, digital media transcends geographical boundaries and time constraints. High-speed internet and the advent of smartphones have opened up possibilities for people to access information and engage in entertainment anytime and anywhere. This accessibility has democratized the dissemination of knowledge and enabled individuals from diverse backgrounds to participate in the global discourse.",
      "Moreover, digital media serves as a powerful tool for communication and expression. Facebook, Twitter, and Instagram have revolutionized connecting and sharing information. These platforms have empowered individuals to amplify their voices, mobilize communities, and catalyze social change. From grassroots movements to viral trends, digital media has become the catalyst for shaping public opinion and driving conversations on important issues.",
      "Furthermore, digital media has transformed the landscape of education and learning. With the proliferation of online courses, tutorials, and educational resources, individuals now have unprecedented access to knowledge and skills development. Additionally, digital media has revolutionized the classroom experience, enabling educators to leverage interactive multimedia content and collaborative tools to enhance student engagement and comprehension.",
      "Digital media has ushered in an era of creativity and innovation in entertainment. Streaming platforms like Netflix, Hulu, and Spotify have disrupted traditional entertainment models, offering consumers a vast array of content tailored to their preferences. New-age technologies like Virtual Reality (VR) and Augmented Reality (AR) are pushing the boundaries of immersive storytelling, allowing audiences to experience narratives in unprecedented ways.",
      "From a business standpoint, digital media has become indispensable for marketing and commerce. E-commerce platforms like Amazon and Alibaba have transformed how we shop. Today, digital marketing strategies like search engine optimization (SEO), social media advertising, and content marketing are necessary for businesses to reach their target audiences and drive sales. In order to remain competitive and relevant, organizations must adapt and leverage digital media in a digital-first world.",
      "In conclusion, digital media is here to stay in this technological era, and its importance cannot be overstated. From communication and education to entertainment and commerce, digital media permeates every aspect of our lives, shaping how we interact, learn, and engage with the world.",
    ],
  },
  {
    id: "smm-seo-orm-synergy",
    number: "(03)",
    category: "SMM & ORM",
    title: "Safeguarding Reputation & Amplifying Social Footprint",
    description:
      "How integrated SMM, SMO, and Online Reputation Management build untouchable brand authority.",
    readTime: "5 MIN READ",
    date: "JUL 2026",
    image: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=1000&auto=format&fit=crop&fm=webp",
    content: [
      "A brand's reputation takes years to build and seconds to tarnish in the viral social landscape. Online Reputation Management (ORM) is not damage control; it is proactive sentiment architecture.",
      "By harmonizing Social Media Optimization (SMO) with continuous sentiment monitoring, review curation, and proactive crisis protocols, we keep your brand's digital perception authoritative, credible, and pristine.",
      "Paired with targeted Social Media Marketing (SMM) strategies, your audience evolves from passive observers into vocal brand advocates.",
    ],
  },
  {
    id: "targeted-advertising-meta-google",
    number: "(04)",
    category: "Paid Media",
    title: "Precision Ads: Meta, Google, Instagram & YouTube",
    description:
      "High-return campaign architecture designed to capture high-intent buyers and scale customer acquisition.",
    readTime: "7 MIN READ",
    date: "JUL 2026",
    content: [
      "Throwing ad budget at generic audience buckets is a relic of the past. Modern algorithmic advertising requires precision segmentation, dynamic creative variations, and cross-channel remarketing.",
      "We build synchronized ad funnels spanning Meta (Facebook & Instagram Ads), Google Search & Display, and YouTube Promotions. Every dollar is tracked against downstream revenue metrics.",
      "Our campaigns do not just generate clicks — they capture qualified leads and drive direct sales with predictable, compounding ROI.",
    ],
  },
  {
    id: "lead-automation-nurturing",
    number: "(05)",
    category: "Lead Systems",
    title: "Lead Automation & WhatsApp Community Architecture",
    description:
      "Transforming cold traffic into warm relationships through automated workflows and direct messaging.",
    readTime: "6 MIN READ",
    date: "JUN 2026",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1000&auto=format&fit=crop&fm=webp",
    content: [
      "Speed to lead is the single most critical factor in modern sales conversion. Leads contacted within 5 minutes are 21 times more likely to enter the sales pipeline.",
      "With Bharat DigiGuru's advanced Lead Automation and WhatsApp Community management, new inquiries are instantly qualified, routed, and engaged with personalized value.",
      "Coupled with targeted email nurturing sequences, our systems turn intermittent prospect interest into loyal, repeat customer relationships.",
    ],
  },
  {
    id: "conversion-web-development",
    number: "(06)",
    category: "Web Engineering",
    title: "Visually Stunning, High-Conversion Web Architecture",
    description:
      "Creating modern digital storefronts that reflect your identity, captivate visitors, and convert traffic.",
    readTime: "5 MIN READ",
    date: "JUN 2026",
    image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1000&auto=format&fit=crop&fm=webp",
    content: [
      "Your website is the ultimate digital flagship of your business. If it loads slowly, confuses navigation, or lacks aesthetic distinction, visitors bounce within seconds.",
      "Bharat DigiGuru designs and develops visually stunning, responsive, and ultra-fast websites engineered specifically to reflect your brand's unique identity while driving seamless conversions.",
      "Backed by ongoing Website Maintenance Services, we ensure your digital presence remains secure, up-to-date, and performing at peak efficiency 24/7.",
    ],
  },
];

export const Blogs: React.FC = () => {
  const blogs = BLOGS_DATA;
  const sectionRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [activeBlog, setActiveBlog] = useState<BlogItem | null>(null);

  useEffect(() => {
    const track = trackRef.current;
    const section = sectionRef.current;
    if (!track || !section) return;

    const mm = gsap.matchMedia();

    // Desktop Layout (>= 1024px): Pinned Horizontal Glide
    mm.add("(min-width: 1024px)", () => {
      const getScrollAmount = () => {
        return track.scrollWidth - window.innerWidth + 140;
      };

      gsap.to(track, {
        x: () => -getScrollAmount(),
        ease: "none",
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: () => `+=${getScrollAmount() + 500}`,
          pin: true,
          pinSpacing: true,
          scrub: 0.5,
          fastScrollEnd: true,
          invalidateOnRefresh: true,
        },
      });
    });

    // Mobile / Tablet (< 1024px): Reset horizontal transform for fluid touch scroll
    mm.add("(max-width: 1023px)", () => {
      gsap.set(track, { clearProps: "transform,x" });
    });

    return () => mm.revert();
  }, []);

  return (
    <section
      id="stories-section"
      ref={sectionRef}
      className="relative z-10 bg-transparent text-white w-full overflow-hidden py-10 sm:py-16 lg:py-0"
    >
      {/* Anchor for backwards compatibility */}
      <div id="blogs-section" className="absolute -top-10 left-0 pointer-events-none" />
      {/* Ambient background glows */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-1/3 left-1/4 w-[600px] h-[600px] bg-red-600/[0.03] blur-[150px] rounded-full" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-orange-500/[0.025] blur-[140px] rounded-full" />
      </div>

      {/* Giant Kinetic Watermark Typography across the background */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 w-full select-none pointer-events-none z-0 overflow-hidden opacity-[0.035] leading-none whitespace-nowrap">
        <span className="font-['Syne',sans-serif] font-black text-[22vw] uppercase tracking-tighter text-transparent [-webkit-text-stroke:2px_#ffffff]">
          Bharat DigiGuru
        </span>
      </div>

      {/* Main Container */}
      <div className="relative z-10 min-h-screen lg:h-screen w-full max-w-8xl mx-auto flex flex-col justify-between py-6 sm:py-8 md:py-10 px-4 sm:px-8 md:px-12 lg:px-16">
        {/* =========================================================================
            HEADER SECTION
           ========================================================================= */}
        <div className="flex flex-col gap-2 shrink-0 max-w-5xl mt-16">
          {/* Studio Emblem + Tagline */}
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#ff3b30] shadow-[0_0_10px_#ff3b30] animate-pulse" />
            <span className="font-['Space_Grotesk',sans-serif] text-[10px] sm:text-xs uppercase tracking-widest text-neutral-400 font-semibold flex items-center gap-1.5">
              Bharat DigiGuru Editorial & Insights
              <span className="text-orange-500">✦</span>
            </span>
          </div>

          {/* Main Title with LensText */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-3">
            <div>
              <h2 className="font-neuropol font-normal text-3xl sm:text-4xl lg:text-5xl uppercase tracking-wider text-white leading-tight select-none">
                <LensText text="REDEFINE DIGITAL STORIES" strokeWidth="1.5px" strokeColor="#ffffff" />
              </h2>

              {/* Sub-statement with Molten Capsule Pills */}
              <div className="mt-2 font-['Space_Grotesk',sans-serif] text-xs sm:text-sm text-neutral-400 tracking-wide uppercase leading-normal max-w-2xl flex flex-wrap items-center gap-y-1.5 py-0.5">
                <span>Bharat DigiGuru — is an editorial agency of bold</span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-gradient-to-r from-red-600 via-orange-500 to-amber-400 shadow-[0_0_12px_rgba(255,69,0,0.6)] text-white text-[9px] sm:text-[10px] font-bold uppercase tracking-wider mx-1.5 align-middle shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-white mr-1.5 animate-ping" />
                  Creators
                </span>
                <span>that delivers the power of media with</span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-gradient-to-r from-orange-500 to-red-600 shadow-[0_0_12px_rgba(255,80,0,0.6)] text-white text-[9px] sm:text-[10px] font-bold uppercase tracking-wider mx-1.5 align-middle shrink-0">
                  Cutting-Edge
                </span>
                <span>strategy.</span>
              </div>
            </div>

            {/* Quick Horizontal Scroll Badge */}
            <div className="hidden lg:flex items-center gap-3 shrink-0 pb-1">
              <span className="font-['Space_Grotesk',sans-serif] text-xs uppercase tracking-widest text-neutral-500">
                Scroll to Explore Full Cards
              </span>
              <span className="w-2 h-2 rounded-full bg-orange-500/80 animate-ping" />
            </div>
          </div>
        </div>

        {/* =========================================================================
            HORIZONTAL CAROUSEL TRACK (Fluid scroll on mobile, Pinned on desktop)
           ========================================================================= */}
        <div
          ref={containerRef}
          className="my-auto overflow-x-auto lg:overflow-visible py-4 sm:py-6 lg:py-8 scrollbar-none snap-x snap-mandatory lg:snap-none"
        >
          <div
            ref={trackRef}
            className="flex gap-4 sm:gap-6 lg:gap-8 items-center will-change-transform pl-1 sm:pl-4 lg:pl-6 pr-6 lg:pr-32 select-none"
            style={{ width: "max-content" }}
          >
            {blogs.map((blog) => (
              <div key={blog.id} className="snap-start shrink-0">
                <BlogCard
                  blog={blog}
                  onClick={(selected) => setActiveBlog(selected)}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {activeBlog && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 md:p-10 bg-black/90 backdrop-blur-2xl"
          onClick={() => setActiveBlog(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            data-lenis-prevent="true"
            className="relative w-full max-w-4xl max-h-[88vh] overflow-y-auto rounded-2xl bg-[#0d0d0d] border border-neutral-800 p-5 sm:p-8 md:p-10 shadow-2xl flex flex-col gap-5 sm:gap-6 text-neutral-200 animate-in fade-in zoom-in-95 duration-300"
          >
            {/* Modal Top Navigation */}
            <div className="flex items-center justify-between border-b border-neutral-800 pb-4 sticky top-0 bg-[#0d0d0d]/95 backdrop-blur-md z-20">
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#ff3b30] shadow-[0_0_8px_#ff3b30]" />
                <span className="px-3 py-1 rounded-full text-xs font-['Space_Grotesk',sans-serif] uppercase tracking-wider bg-neutral-900 border border-neutral-800 text-neutral-300">
                  {activeBlog.category}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setActiveBlog(null)}
                aria-label="Close article modal"
                className="w-8 h-8 rounded-full border border-neutral-800 flex items-center justify-center text-neutral-400 hover:text-white hover:border-neutral-600 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Article Cover Image (if available) */}
            {activeBlog.image && (
              <div className="w-full aspect-[21/9] rounded-xl overflow-hidden bg-neutral-900 border border-neutral-800 shadow-xl">
                <img
                  src={activeBlog.image}
                  alt={activeBlog.title}
                  className="w-full h-full object-cover"
                  loading="lazy"
                  decoding="async"
                />
              </div>
            )}

            {/* Title & Metadata */}
            <div className="flex flex-col gap-2.5 sm:gap-3">
              <span className="font-['Cormorant_Garamond',serif] italic text-xs sm:text-sm text-neutral-400">
                {activeBlog.number} · Bharat DigiGuru Official Editorial
              </span>
              <h2 className="font-['Syne',sans-serif] font-bold text-xl sm:text-2xl md:text-3xl lg:text-4xl uppercase tracking-tight text-white leading-tight">
                {activeBlog.title}
              </h2>
              <div className="flex items-center gap-4 text-[11px] sm:text-xs font-['Space_Grotesk',sans-serif] uppercase tracking-wider text-neutral-400 pt-1">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  {activeBlog.date}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  {activeBlog.readTime}
                </span>
              </div>
            </div>

            {/* Editorial Body Content */}
            <div className="flex flex-col gap-4 sm:gap-5 text-xs sm:text-sm md:text-base text-neutral-300 leading-relaxed font-['Space_Grotesk',sans-serif] pt-2 border-t border-neutral-800/80">
              {activeBlog.content?.map((paragraph, idx) => (
                <p key={idx} className="leading-relaxed sm:leading-loose">
                  {paragraph}
                </p>
              ))}
            </div>

            {/* Bullet Points Checklist (for full solution breakdown) */}
            {activeBlog.bullets && activeBlog.bullets.length > 0 && (
              <div className="flex flex-col gap-3 pt-4 border-t border-neutral-800/80">
                <h3 className="font-['Syne',sans-serif] text-xs sm:text-sm md:text-base font-bold uppercase tracking-wider text-white flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#ff3b30]" />
                  Explore Our Comprehensive Array of Solutions:
                </h3>
                <ul className="grid grid-cols-1 gap-2 sm:gap-2.5 pt-2">
                  {activeBlog.bullets.map((bullet, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2.5 sm:gap-3 text-xs sm:text-sm text-neutral-300 bg-neutral-900/60 p-2.5 sm:p-3 rounded-lg border border-neutral-800/80 font-['Space_Grotesk',sans-serif]"
                    >
                      <CheckCircle2 className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Modal Footer CTA */}
            <div className="pt-4 sm:pt-6 border-t border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
              <span className="text-[11px] sm:text-xs text-neutral-400 font-['Space_Grotesk',sans-serif] uppercase tracking-wider text-center sm:text-left">
                Published by Bharat DigiGuru Digital Media Company
              </span>
              <button
                type="button"
                onClick={() => setActiveBlog(null)}
                className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-white text-black text-xs font-['Space_Grotesk',sans-serif] font-semibold uppercase tracking-wider hover:bg-neutral-200 transition-colors cursor-pointer"
              >
                Close Article
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default Blogs;
