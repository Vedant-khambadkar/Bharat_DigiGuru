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



gsap.registerPlugin(ScrollTrigger);

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
        return cached && cached.length > 0 ? cached : [];
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
                console.warn("Could not fetch services from API:", err);
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
                        {services.length === 0 ? (
                            <div className="py-16 text-center text-neutral-500 font-['Space_Grotesk',sans-serif] text-sm uppercase tracking-wider">
                                Loading services...
                            </div>
                        ) : (
                            services.map((service, index) => (
                                <ServiceItem
                                    key={service.id}
                                    service={service}
                                    index={index}
                                    isOpen={openServiceId === service.id}
                                    onToggle={() => handleToggleService(service.id)}
                                    onHover={handleHoverService}
                                    onLeave={handleLeaveService}
                                />
                            ))
                        )}
                    </div>

                </section>
            </div>
        </div>
    );
};

export default Services;