import React, { useState, useRef, useEffect, useCallback } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import ScrollExploreBadge from "../components/ScrollExploreBadge";
import ServiceItem, { extractYouTubeId } from "../components/ServiceItem";
import type { ServiceData } from "../components/ServiceItem";
import LensText from "../components/LensText";
import { userService } from "../services/service/userService";
import { onSocketEvent } from "../utils/socket";
import { getApiCache, setApiCache } from "../utils/apiCache";

// Local WebP & Video Assets for offline readiness and zero external latency
import pic1 from "../assets/Picture/Picture1.webp";
import pic2 from "../assets/Picture/Picture2.webp";
import pic3 from "../assets/Picture/Picture3.webp";
import pic4 from "../assets/Picture/Picture4.webp";
import pic5 from "../assets/Picture/Picture5.webp";
import pic7 from "../assets/Picture/Picture7.webp";
import pic10 from "../assets/Picture/Picture10.webp";
import pic11 from "../assets/Picture/Picture11.webp";
import pic12 from "../assets/Picture/Picture12.webp";
import pic13 from "../assets/Picture/Picture13.webp";
import PhotographyImg1 from "../assets/photography/photography-1.webp";
import PhotographyImg2 from "../assets/photography/photography-2.webp";
import PhotographyImg3 from "../assets/photography/photography-3.webp";
import DigitalMediaImg1 from "../assets/DigitalMedia/DigitalMedia-1.webp";
import DigitalMediaImg2 from "../assets/DigitalMedia/DigitalMedia-2.webp";
import DigitalMediaImg3 from "../assets/DigitalMedia/DigitalMedia-3.webp";
import DigitalMediaImg4 from "../assets/DigitalMedia/DigitalMedia-4.webp";


gsap.registerPlugin(ScrollTrigger);

const SERVICES_DATA: ServiceData[] = [
    {
        id: "digital-media-services",
        number: "(01)",
        title: "Digital Media Services",
        subtitle: "360° SMM, SEO, PERFORMANCE ADS & LEAD GENERATION",
        tag: "& 360° DIGITAL ACCELERATION",
        image: DigitalMediaImg1,
        works: [
            {
                id: "dm-work-1",
                title: "Apex Growth Campaign & SMM",
                type: "image",
                url: DigitalMediaImg2,
                thumbnail: DigitalMediaImg2,
                tag: "Ad Campaign Reel",
                description: "Multi-channel lead generation and ad conversion campaign with +280% ROI.",
                metrics: "+280% Lead Volume • 4K",
            },
            {
                id: "dm-work-2",
                title: "Omnichannel Brand Positioning",
                type: "image",
                url: DigitalMediaImg4,
                thumbnail: DigitalMediaImg4,
                tag: "Brand Architecture",
                description: "Complete visual branding, meta ads strategy, and high-converting creative copies.",
                metrics: "4.8M Impressions",
            },
            {
                id: "dm-work-3",
                title: "Viral Social Content & SEO",
                type: "image",
                url: DigitalMediaImg3,
                thumbnail: DigitalMediaImg3,
                tag: "SEO & Growth Engine",
                description: "Data-driven SEO dominance and organic engagement across search & socials.",
                metrics: "Top 3 SERP Ranking",
            },
        ],
        details: {
            description:
                "Our team of professional digital media specialists is dedicated to providing tailored services be it SMM, SEO, SMO or ORM to help you achieve your goals. From crafting engaging social media strategies to optimizing your online presence, count on us to elevate your digital footprint and drive results that matter. Delve into the expansive range of services provided by Bharat DigiGuru, meticulously designed to enhance your online presence. Our offerings span a diverse spectrum, encompassing strategic digital marketing campaigns and innovative web design and development, each uniquely tailored to align with your specific objectives in the digital realm. Precision-crafted marketing endeavors elevate brand visibility and drive engagement across multiple platforms. From Social Media Marketing to targeted Lead Generation strategies, we offer comprehensive solutions to address your unique business needs. Partner with us to propel your brand toward digital success.",
            deliverables: [
                "Strategic Social Media Marketing (SMM)",
                "Search Engine Optimization (SEO & SMO)",
                "Online Reputation Management (ORM)",
                "Targeted Lead Generation & Automation",
            ],
            chips: [
                "SMM",
                "SEO",
                "SMO",
                "ORM",
                "Facebook Ads",
                "Google Ads",
                "YouTube Promotions",
                "WhatsApp Community",
                "Content Management",
                "Email Marketing",
                "Instagram Ads",
                "Lead Automation",
                "Website Development",
                "X Promotions",
                "Lead Generation",
                "Website Maintenance",
            ],
            timeline: "Ongoing Retainer / Sprint Based",
        },
    },
    {
        id: "photography-services",
        number: "(02)",
        title: "Photography Services",
        subtitle: "PRODUCT, CORPORATE & EVENTS",
        tag: "& HIGH-RES STUDIO SHOOTS",
        image: pic4,
        works: [
            {
                id: "photo-work-1",
                title: "Luxury Product Studio Shoot",
                type: "image",
                url: PhotographyImg1,
                thumbnail: PhotographyImg1,
                tag: "Studio Lighting",
                description: "High-end product photography featuring precision studio lighting and reflection controls.",
                metrics: "Ultra-HD Master",
            },
            {
                id: "photo-work-2",
                title: "Executive Corporate Portfolios",
                type: "image",
                url: PhotographyImg2,
                thumbnail: PhotographyImg2,
                tag: "Executive Headshots",
                description: "Editorial corporate portraits and leadership team showcase for modern enterprise brands.",
                metrics: "100+ C-Suite Shoots",
            },
            {
                id: "photo-work-3",
                title: "Global Summit & Event Coverage",
                type: "image",
                url: PhotographyImg3,
                thumbnail: PhotographyImg3,
                tag: "Live Event Photography",
                description: "Real-time live conference capture, keynote spotlights, and high-energy atmosphere moments.",
                metrics: "Instant Live Delivery",
            },
        ],
        details: {
            description:
                "Trust our team of skilled photographers to capture your vision with creativity, professionalism, and attention to detail. Whether you require product photography, corporate headshots, or event coverage, we are committed to delivering high-quality images that align seamlessly with your brand. At Bharat DigiGuru, we understand the power of captivating visuals in conveying your brand's story and capturing your audience's attention. Our Photography Services go beyond just taking pictures; we strive to encapsulate the essence of your brand and showcase it in the most compelling way possible. Whether it's product photography, corporate events, or lifestyle shoots, our team of skilled photographers has the expertise to bring your vision to life. With an eye for detail and a passion for creativity, we ensure that every photograph we capture tells a story and leaves a lasting impression on your audience.",
            deliverables: [
                "High-End Product Photography",
                "Corporate Executive Headshots",
                "Event Coverage & Lifestyle Shoots",
                "Studio Lighting & Color Grading",
            ],
            chips: [
                "Product Photography",
                "Corporate Headshots",
                "Event Coverage",
                "Lifestyle Shoots",
                "Studio Lighting",
                "Commercial Retouching",
                "Brand Portfolios",
            ],
            timeline: "1–2 Weeks Per Shoot",
        },
    },
    {
        id: "videography-services",
        number: "(03)",
        title: "Videography Services",
        subtitle: "PROMOTIONAL, SOCIAL & DOCUMENTARIES",
        tag: "& CINEMATIC STORYTELLING",
        image: pic7,
        works: [
            {
                id: "video-work-1",
                title: "Abhishek & Nitya — Rajasthan Destination Wedding",
                type: "youtube",
                url: "https://www.youtube.com/watch?v=-nWIdh4-PeA",
                youtubeId: "-nWIdh4-PeA",
                thumbnail: "https://img.youtube.com/vi/-nWIdh4-PeA/hqdefault.jpg",
                tag: "Destination Wedding",
                description: "Cinematic royal destination wedding film captured across the palaces and heritage locales of Rajasthan.",
                metrics: "4K Cinema • Drone Master",
            },
            {
                id: "video-work-2",
                title: "Kush & Venu — Varanasi Pre-Wedding Film",
                type: "youtube",
                url: "https://www.youtube.com/watch?v=KgXOwkM9o30",
                youtubeId: "KgXOwkM9o30",
                thumbnail: "https://img.youtube.com/vi/KgXOwkM9o30/hqdefault.jpg",
                tag: "Pre-Wedding Cinema",
                description: "Soulful pre-wedding film set against the ethereal morning ghats and sacred architecture of Varanasi.",
                metrics: "Ghats of Kashi • 4K Master",
            },
            {
                id: "video-work-3",
                title: "Bhavesh & Kusum — Leh Ladakh Visual Odyssey",
                type: "youtube",
                url: "https://www.youtube.com/watch?v=PybqBUGmTkE",
                youtubeId: "PybqBUGmTkE",
                thumbnail: "https://img.youtube.com/vi/PybqBUGmTkE/hqdefault.jpg",
                tag: "Mountain Odyssey",
                description: "Epic cinematic visual narrative through the dramatic mountain passes and blue waters of Leh Ladakh.",
                metrics: "High Altitude • 4K 60FPS",
            },
            {
                id: "video-work-4",
                title: "Kumar Kanti & Dr. Ankita — Jaisalmer & Jaipur Reel",
                type: "youtube",
                url: "https://www.youtube.com/watch?v=cl6LdLUealA",
                youtubeId: "cl6LdLUealA",
                thumbnail: "https://img.youtube.com/vi/cl6LdLUealA/hqdefault.jpg",
                tag: "Royal Heritage",
                description: "Grand romantic film shot in the royal dunes of Jaisalmer and iconic forts of Jaipur.",
                metrics: "Golden Dunes • Ultra-HD",
            },
        ],
        details: {
            description:
                "From captivating promotional videos to engaging social media content, our team excels in delivering high-quality videography services that elevate your brand. Trust our team to craft visually compelling narratives and weave stories that resonate with your audience and drive meaningful engagement. Video has become an integral part of digital marketing, offering unparalleled opportunities to engage and connect with your audience. At Bharat DigiGuru, our Videography Services are designed to help you harness the power of visual storytelling to elevate your brand and drive meaningful engagement. From promotional videos and corporate documentaries to social media content and event coverage, our team of talented videographers is equipped with the skills and expertise to bring your ideas to life on screen. With a keen understanding of storytelling techniques and the latest video production trends, we create immersive and impactful videos that resonate with your audience and leave a lasting impression.",
            deliverables: [
                "Promotional Videos & Ad Films",
                "Corporate Documentaries & Spotlights",
                "Social Media Reels, TikToks & Shorts",
                "4K Production, Drone Footage & Color Grading",
            ],
            chips: [
                "Brand Films",
                "Promotional Videos",
                "Reels & Shorts",
                "Corporate Documentaries",
                "Event Cinematography",
                "Motion Design",
                "Post-Production & Sound",
            ],
            timeline: "2–3 Weeks Per Production",
        },
    },
    {
        id: "content-generation",
        number: "(04)",
        title: "Content Generation",
        subtitle: "EDITORIAL, CONTENT, STRATEGIC , DEVELOPMENT & NARRATIVES",
        tag: "& STRATEGIC COPYWRITING",
        image: pic10,
        works: [
            {
                id: "content-work-1",
                title: "SEO Authority Publication",
                type: "image",
                url: pic10,
                thumbnail: pic10,
                tag: "Thought Leadership",
                description: "In-depth industry whitepapers and technical blog articles driving inbound organic traffic.",
                metrics: "95+ Readability Score",
            },
            {
                id: "content-work-2",
                title: "High-Converting Sales Funnels",
                type: "image",
                url: pic11,
                thumbnail: pic11,
                tag: "Direct Response Copy",
                description: "Landing page conversion copywriting tailored for high-ticket SaaS and enterprise buyers.",
                metrics: "+64% Conversion Lift",
            },
            {
                id: "content-work-3",
                title: "Omnichannel Brand Narratives",
                type: "image",
                url: pic12,
                thumbnail: pic12,
                tag: "Email & Social Scripts",
                description: "Automated nurturing drip campaigns and viral tweet/LinkedIn story threads.",
                metrics: "42% Open Rate",
            },
        ],
        details: {
            description:
                "With a team of seasoned experts at the helm, we specialize in producing captivating content, from thought-provoking blog posts to enlightening articles designed to capture the attention of your audience. Rely on us to weave compelling narratives that forge genuine connections and bolster your online visibility. Content is king in the digital age, and at Bharat DigiGuru, we specialize in creating high-quality, engaging content that resonates with your target audience. Whether it's blog posts, articles, social media posts, or website copy, our Content Generation services are tailored to meet your unique needs and objectives. Our team of experienced writers and content creators combines creativity with strategic thinking to deliver content that not only captivates your audience but also drives results. From crafting compelling narratives to optimizing content for search engines, we ensure that every piece of content we produce is optimized to help you achieve your goals and stand out in the crowded digital landscape.",
            deliverables: [
                "SEO-Driven Thought Leadership & Articles",
                "High-Converting Landing Page Copy",
                "Social Media Copywriting & Scripts",
                "Email Newsletters & Nurturing Sequences",
            ],
            chips: [
                "SEO Articles",
                "Thought Leadership",
                "Website Copy",
                "Social Media Copy",
                "Email Newsletters",
                "Brand Storytelling",
                "Content Strategy",
            ],
            timeline: "Fast Turnaround / Monthly Retainer",
        },
    },
    {
        id: "ai-art-generation",
        number: "(05)",
        title: "Art Generation",
        subtitle: "DIGITAL MASTERPIECES & VISUAL ASSETS",
        tag: "& NEXT-GEN CREATIVE TECH",
        image: pic13,
        works: [
            {
                id: "ai-art-work-1",
                title: "Generative Cybernetic Key Visuals",
                type: "image",
                url: pic13,
                thumbnail: pic13,
                tag: "Generative Concept",
                description: "Futuristic visual storytelling combining neural diffusion models and 3D motion design.",
                metrics: "8K Native Render",
            },
            {
                id: "ai-art-work-2",
                title: "Surreal 3D Spatial Characters",
                type: "image",
                url: pic1,
                thumbnail: pic1,
                tag: "Character Design",
                description: "Custom digital character assets rendered with custom prompt loRA weights and shaders.",
                metrics: "Commercial Ready",
            },
            {
                id: "ai-art-work-3",
                title: "Abstract Luxury Key Visuals",
                type: "image",
                url: pic2,
                thumbnail: pic2,
                tag: "Print & Exhibition Prep",
                description: "Upscaled hyper-detailed abstract generative visuals for digital displays and billboards.",
                metrics: "300 DPI Vector Scale",
            },
        ],
        details: {
            description:
                "Harnessing cutting-edge AI technology, our team specializes in offering innovative AI Art. From stunning digital masterpieces to unique creations, we craft visually captivating artwork that pushes the boundaries of creativity. Entrust us to unleash the power of AI to produce mesmerizing artworks that inspire and delight. Unlock the potential of artificial intelligence to create stunning visual artwork that captivates and inspires. At Bharat DigiGuru, our Art Generation services harness the latest advancements in AI technology to produce unique and captivating artwork that reflects your brand's identity and vision. Whether you're looking for digital illustrations, graphics, or custom artwork, our AI-powered tools can bring your ideas to life with unparalleled precision and creativity. With our Art Generation services, you can unleash your imagination and explore new possibilities in visual storytelling and brand expression.",
            deliverables: [
                "Bespoke Generative Brand Art & Key Visuals",
                "Custom Digital Illustrations & Graphics",
                "High-Resolution Upscaling & Print Prep",
                "Custom Visual Styles & Prompt Libraries",
            ],
            chips: [
                "Custom AI Illustrations",
                "Generative Concept Art",
                "High-Resolution Upscaling",
                "Custom Aesthetics",
                "Prompt Engineering",
                "Commercial Assets",
            ],
            timeline: "24–48 Hour Turnaround",
        },
    },
    {
        id: "ai-video-generation",
        number: "(06)",
        title: "AI Video Generation",
        subtitle: "DYNAMIC PROMOTIONAL & NEXT-GEN VIDEO",
        tag: "& FUTURE OF VIDEO PRODUCTION",
        image: pic3,
        works: [
            {
                id: "ai-vid-work-1",
                title: "Neural Motion Synthesis Ad",
                type: "video",
                url: pic3,
                thumbnail: pic3,
                tag: "AI Commercial Teaser",
                description: "Generative video production with high-fidelity camera motion synthesis and VFX.",
                metrics: "10x Production Speed",
            },
            {
                id: "ai-vid-work-2",
                title: "Multilingual AI Voiceover & Avatar",
                type: "image",
                url: pic4,
                thumbnail: pic4,
                tag: "AI Avatar & Localization",
                description: "Lip-synced video localization in 15+ languages with natural neural voiceovers.",
                metrics: "15 Languages • Real-time",
            },
            {
                id: "ai-vid-work-3",
                title: "High-Cadence Ad Variation Engine",
                type: "image",
                url: pic5,
                thumbnail: pic5,
                tag: "Dynamic Ad Variants",
                description: "Rapid generation of 50+ video creative hooks for performance testing.",
                metrics: "50+ A/B Variations",
            },
        ],
        details: {
            description:
                "Delve into the future of video production with our AI-powered services, where innovation meets creativity. Our team leverages cutting-edge AI technology to produce captivating videos that leave a lasting impression. From dynamic promotional content to immersive storytelling, we craft visually stunning videos. Experience the future of video production with Bharat DigiGuru's AI Videos Generation services. Using cutting-edge artificial intelligence technology, we can create dynamic and engaging videos that capture attention and drive results. Whether you need promotional videos, explainer videos, or social media content, our AI-powered video creation tools can generate professional-quality videos in a fraction of the time and cost of traditional production methods. With our AI Videos Generation services, you can elevate your brand's video content and stand out in today's competitive digital landscape with ease and efficiency.",
            deliverables: [
                "Automated AI Promotional Video Creatives",
                "High-Cadence Social Video Variations",
                "AI Voiceover & Multilingual Dubbing",
                "Rapid Video Prototyping & Ad Testing",
            ],
            chips: [
                "AI Promotional Teasers",
                "Automated Explainer Videos",
                "Motion Synthesis",
                "AI Voiceovers",
                "Fast Ad Variations",
                "High-Cadence Production",
            ],
            timeline: "48–72 Hour Turnaround",
        },
    },
];

const getHoverImage = (service: ServiceData | null): string => {
    if (!service) return "";
    if (service.works && service.works.length > 0) {
        const firstWork = service.works[0];
        if (firstWork.thumbnail) return firstWork.thumbnail;
        if (firstWork.type === "youtube" && (firstWork.youtubeId || firstWork.url)) {
            const ytId = firstWork.youtubeId || extractYouTubeId(firstWork.url);
            if (ytId) return `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`;
        }
        if (firstWork.url) return firstWork.url;
    }
    return service.image || "";
};

const Services: React.FC = () => {
    const [services, setServices] = useState<ServiceData[]>(() => {
        const cached = getApiCache<ServiceData[]>("services_items");
        return cached && cached.length > 0 ? cached : SERVICES_DATA;
    });
    const [hoveredService, setHoveredService] = useState<ServiceData | null>(null);
    const [openServiceId, setOpenServiceId] = useState<string | null>(null);
    const previewRef = useRef<HTMLDivElement>(null);

    const servicesListRef = useRef<HTMLElement>(null);
    const hoveredRef = useRef<boolean>(false);

    // Fetch dynamic services with true Stale-While-Revalidate (SWR)
    const fetchServices = useCallback(async (forceRefresh = false) => {
        try {
            const data = await userService.getServices(forceRefresh);
            const items = Array.isArray(data) ? data : (data as any)?.items || [];
            if (items.length > 0) {
                setServices((prev) => {
                    // Only trigger React state update if data actually changed
                    if (JSON.stringify(prev) === JSON.stringify(items)) {
                        return prev;
                    }
                    setApiCache("services_items", items);
                    return items;
                });
            }
        } catch (err) {
            if (typeof import.meta !== "undefined" && import.meta.env?.DEV) {
                console.warn("Using fallback local services data:", err);
            }
        }
    }, []);

    useEffect(() => {
        fetchServices();

        const unsubCreated = onSocketEvent("service:created", (newService: any) => {
            if (!newService || (!newService.id && !newService._id)) return;
            setServices((prev) => {
                const id = newService.id || newService._id;
                if (prev.some((s) => s.id === id || (s as any)._id === id)) {
                    return prev;
                }
                const updated = [newService, ...prev];
                setApiCache("services_items", updated);
                return updated;
            });
        });

        const unsubUpdated = onSocketEvent("service:updated", (updatedService: any) => {
            if (!updatedService || (!updatedService.id && !updatedService._id)) return;
            setServices((prev) => {
                const id = updatedService.id || updatedService._id;
                let hasChanged = false;
                const updated = prev.map((s) => {
                    if (s.id === id || (s as any)._id === id) {
                        if (JSON.stringify(s) !== JSON.stringify(updatedService)) {
                            hasChanged = true;
                            return updatedService;
                        }
                    }
                    return s;
                });
                if (!hasChanged) return prev;
                setApiCache("services_items", updated);
                return updated;
            });
        });

        const unsubDeleted = onSocketEvent("service:deleted", (deletedId: string) => {
            if (!deletedId) return;
            setServices((prev) => {
                if (!prev.some((s) => s.id === deletedId || (s as any)._id === deletedId)) {
                    return prev;
                }
                const updated = prev.filter((s) => s.id !== deletedId && (s as any)._id !== deletedId);
                setApiCache("services_items", updated);
                return updated;
            });
        });

        return () => {
            unsubCreated();
            unsubUpdated();
            unsubDeleted();
        };
    }, [fetchServices]);

    const handleToggleService = useCallback((id: string) => {
        setOpenServiceId((prev) => (prev === id ? null : id));
    }, []);

    const handleHoverService = useCallback((service: ServiceData) => {
        setHoveredService(service);
    }, []);

    const handleLeaveService = useCallback(() => {
        setHoveredService(null);
    }, []);

    // Single settled refresh for ScrollTrigger & Lenis when service accordion finishes expanding
    useEffect(() => {
        const timer = setTimeout(() => {
            (window as any).lenis?.resize();
            ScrollTrigger.refresh();
        }, 320);

        return () => clearTimeout(timer);
    }, [openServiceId]);

    useEffect(() => {
        const preview = previewRef.current;
        if (!preview || !window.matchMedia("(pointer: fine)").matches) return;

        gsap.set(preview, {
            xPercent: -50,
            yPercent: -50,
            opacity: 0,
            scale: 0.8,
        });

        const xTo = gsap.quickTo(preview, "x", { duration: 0.35, ease: "power2.out" });
        const yTo = gsap.quickTo(preview, "y", { duration: 0.35, ease: "power2.out" });
        const rotTo = gsap.quickTo(preview, "rotation", { duration: 0.25, ease: "power1.out" });

        let lastX = 0;
        const handleMouseMove = (e: MouseEvent) => {
            if (!hoveredRef.current) return;

            xTo(e.clientX);
            yTo(e.clientY);

            const deltaX = e.clientX - lastX;
            lastX = e.clientX;
            const rotation = Math.max(-10, Math.min(10, deltaX * 0.18));
            rotTo(rotation);
        };

        window.addEventListener("mousemove", handleMouseMove, { passive: true });
        return () => window.removeEventListener("mousemove", handleMouseMove);
    }, []);

    useEffect(() => {
        const preview = previewRef.current;
        if (!preview) return;

        hoveredRef.current = !!hoveredService;

        if (hoveredService) {
            preview.style.display = "block";
            gsap.to(preview, {
                opacity: 1,
                scale: 1,
                duration: 0.3,
                ease: "power2.out",
            });
        } else {
            gsap.to(preview, {
                opacity: 0,
                scale: 0.8,
                duration: 0.2,
                ease: "power2.in",
                onComplete: () => {
                    if (!hoveredRef.current && preview) {
                        preview.style.display = "none";
                    }
                },
            });
        }
    }, [hoveredService]);

    useEffect(() => {
        // Automatically dismiss the preview only when active and scrolled outside the section
        const handleScroll = () => {
            if (!hoveredRef.current) return;
            const listEl = servicesListRef.current;
            if (!listEl) return;
            const rect = listEl.getBoundingClientRect();
            if (rect.bottom < 0 || rect.top > window.innerHeight) {
                setHoveredService(null);
            }
        };

        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <div
            id="services-section"
            className="relative min-h-screen bg-transparent text-white selection:bg-white selection:text-black font-['Plus_Jakarta_Sans',sans-serif] overflow-x-hidden "
        >
            {/* Background Vignette & Radial Lighting - feathers naturally into dynamic background */}
            <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(255,255,255,0.035)_0%,rgba(255,255,255,0.01)_45%,transparent_80%)] opacity-90" />
                <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:24px_24px] opacity-25" />
                <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] sm:w-[900px] h-[350px] sm:h-[500px] bg-white/[0.025] blur-[120px] rounded-full pointer-events-none" />
            </div>

            {/* Floating Service Preview Image - STRICTLY displayed only when hovering ServiceItem */}
            <div
                ref={previewRef}
                style={{ display: "none", opacity: 0 }}
                className="fixed top-0 left-0 pointer-events-none z-40 w-72 sm:w-96 h-48 sm:h-60 rounded-2xl overflow-hidden border border-neutral-700/70 shadow-2xl shadow-black/95 bg-neutral-900 will-change-transform"
            >
                {hoveredService && (
                    <div className="relative w-full h-full overflow-hidden">
                        <img
                            src={getHoverImage(hoveredService)}
                            alt={hoveredService.title}
                            className="w-full h-full object-cover"
                            decoding="async"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent pointer-events-none" />
                        <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-white">
                            <span className="font-['Space_Grotesk',sans-serif] text-xs uppercase tracking-wider text-neutral-200 font-medium truncate pr-2">
                                {hoveredService.number} {hoveredService.title}
                            </span>
                            <span className="shrink-0 font-['Space_Grotesk',sans-serif] text-[10px] uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-md text-neutral-200">
                                Preview
                            </span>
                        </div>
                    </div>
                )}
            </div>

            <div className="relative z-10 flex flex-col justify-between">
                <section className="relative sm:min-h-screen flex flex-col justify-between px-6 sm:px-10 md:px-12 lg:px-16 py-6 sm:py-8 max-w-8xl mx-auto w-full">

                    <div className="my-auto py-12 sm:py-16 md:py-20 flex flex-col items-center text-center">
                        <div className="flex flex-col items-center w-full max-w-6xl font-neuropol">
                            <h1 className="font-neuropol text-4xl sm:text-7xl md:text-6xl lg:text-[100px] xl:text-[120px] uppercase tracking-wider text-white leading-[0.95] select-none">
                                <LensText text="OUR" strokeWidth="1px" strokeColor="#ffffff" />
                            </h1>

                            <h2 className="font-neuropol text-4xl sm:text-7xl md:text-8xl lg:text-[120px] xl:text-[110px] uppercase tracking-wider text-white leading-[0.95] select-none mt-1 sm:mt-2">
                                <LensText text="SERVICES" strokeWidth="1px" strokeColor="#ffffff" />
                            </h2>
                        </div>
                    </div>

                    {/* Bottom Scroll Explore Indicator */}
                    <div className="flex justify-center items-center pb-4 sm:pb-8">
                        <ScrollExploreBadge targetId="services-list" />
                    </div>
                </section>

                {/* =========================================================================
                    SERVICES LIST SECTION
                   ========================================================================= */}
                <section
                    id="services-list"
                    ref={servicesListRef}
                    onMouseLeave={handleLeaveService}
                    className="relative px-6 sm:px-10 md:px-12 lg:px-16 py-16 sm:py-24 max-w-8xl mx-auto w-full"
                >
                    {/* Section Subheader for SEO & Context */}
                    <div className="flex items-center justify-between mb-8 sm:mb-12 border-b border-neutral-800 pb-4">
                        <span className="font-['Space_Grotesk',sans-serif] text-xs uppercase tracking-widest text-neutral-500">
                            Selected Capabilities & Solutions
                        </span>
                        <span className="font-['Space_Grotesk',sans-serif] text-xs uppercase tracking-widest text-neutral-500">
                            ({services.length.toString().padStart(2, "0")} Capabilities)
                        </span>
                    </div>

                    {/* The Services Items */}
                    <div className="flex flex-col">
                        {services.map((service, index) => (
                            <ServiceItem
                                key={service.id}
                                service={service}
                                index={index}
                                isOpen={openServiceId === service.id}
                                onToggle={() => handleToggleService(service.id)}
                                onHover={handleHoverService}
                                onLeave={handleLeaveService}
                            />
                        ))}
                    </div>

                </section>
            </div>
        </div>
    );
};

export default Services;