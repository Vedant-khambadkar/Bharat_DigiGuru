import React, { useCallback, useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { userService } from "../services/service/userService";
import CachedImage from "../components/CachedImage";
import { onSocketEvent } from "../utils/socket";

gsap.registerPlugin(ScrollTrigger);

interface Member {
  id: string;
  name: string;
  role?: string;
  column?: number;
  order?: number;
  image: string;
}

const DEFAULT_TEAM_COLUMNS: {
  col1: Member[];
  col2: Member[];
  col3: Member[];
  col4: Member[];
  col5: Member[];
} = {
  // Column 1 (Left - Lower offset)
  col1: [
    {
      id: "m1",
      name: "ELENA ROSTOVA",
      role: "BRAND STRATEGIST",
      column: 1,
      order: 1,
      image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=85",
    },
  ],
  // Column 2 (Left-Center - Elevated top portrait + bottom portrait)
  col2: [
    {
      id: "m2",
      name: "DMITRY SULLIWAN",
      role: "FOUNDER & CD",
      column: 2,
      order: 1,
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=85",
    },
    {
      id: "m3",
      name: "ALEXEI VORONOV",
      role: "3D ARCHITECT",
      column: 2,
      order: 2,
      image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=85",
    },
  ],
  // Column 3 (Center - Elegant focal portrait)
  col3: [
    {
      id: "m4",
      name: "VICTORIA CHEN",
      role: "CREATIVE DIRECTOR",
      column: 3,
      order: 1,
      image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=600&q=85",
    },
  ],
  // Column 4 (Right-Center - Elevated top portrait + bottom portrait)
  col4: [
    {
      id: "m5",
      name: "DMITRY KOROTEVSKY",
      role: "TECHNICAL DIRECTOR",
      column: 4,
      order: 1,
      image: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=600&q=85",
    },
    {
      id: "m6",
      name: "MARCUS VANCE",
      role: "PERFORMANCE LEAD",
      column: 4,
      order: 2,
      image: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=600&q=85",
    },
  ],
  // Column 5 (Right - Lower offset)
  col5: [
    {
      id: "m7",
      name: "SOPHIE NOIR",
      role: "ART DIRECTOR",
      column: 5,
      order: 1,
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=600&q=85",
    },
  ],
};

const organizeMembersIntoColumns = (list: any[]) => {
  if (!list || list.length === 0) return DEFAULT_TEAM_COLUMNS;
  
  const activeMembers = list.filter((m) => m && m.isActive !== false);
  if (activeMembers.length === 0) return DEFAULT_TEAM_COLUMNS;

  const cols: {
    col1: Member[];
    col2: Member[];
    col3: Member[];
    col4: Member[];
    col5: Member[];
  } = {
    col1: [],
    col2: [],
    col3: [],
    col4: [],
    col5: [],
  };

  activeMembers.forEach((m, idx) => {
    const colNum = m.column && m.column >= 1 && m.column <= 5 ? m.column : (idx % 5) + 1;
    const memberObj: Member = {
      id: m.id || m._id || `m_${idx}`,
      name: m.name || "TEAM MEMBER",
      role: m.role || "",
      column: colNum,
      order: m.order ?? idx,
      image: m.image || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=85",
    };

    if (colNum === 1) cols.col1.push(memberObj);
    else if (colNum === 2) cols.col2.push(memberObj);
    else if (colNum === 3) cols.col3.push(memberObj);
    else if (colNum === 4) cols.col4.push(memberObj);
    else if (colNum === 5) cols.col5.push(memberObj);
  });

  // Sort each column by order
  cols.col1.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  cols.col2.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  cols.col3.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  cols.col4.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  cols.col5.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  return cols;
};

export const OurTeam: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const textBgRef = useRef<HTMLDivElement>(null);
  const portraitsRef = useRef<HTMLDivElement>(null);

  const [teamColumns, setTeamColumns] = useState<{
    col1: Member[];
    col2: Member[];
    col3: Member[];
    col4: Member[];
    col5: Member[];
  }>(DEFAULT_TEAM_COLUMNS);

  const loadTeam = useCallback(async (force = false) => {
    try {
      const data = await userService.getTeamMembers(force);
      if (data && Array.isArray(data)) {
        setTeamColumns(organizeMembersIntoColumns(data));
      }
    } catch (err) {
      console.error("Failed to fetch team members:", err);
    }
  }, []);

  useEffect(() => {
    loadTeam(false);

    const unsubCreated = onSocketEvent("team:created", () => loadTeam(true));
    const unsubUpdated = onSocketEvent("team:updated", () => loadTeam(true));
    const unsubDeleted = onSocketEvent("team:deleted", () => loadTeam(true));

    return () => {
      unsubCreated();
      unsubUpdated();
      unsubDeleted();
    };
  }, [loadTeam]);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      // Subtle parallax on scroll between background giant typography and foreground portraits
      if (textBgRef.current && portraitsRef.current) {
        gsap.fromTo(
          textBgRef.current,
          { y: 40 },
          {
            y: -40,
            ease: "none",
            scrollTrigger: {
              trigger: section,
              start: "top bottom",
              end: "bottom top",
              scrub: 1,
            },
          }
        );

        gsap.fromTo(
          ".team-portrait-card",
          { opacity: 0, y: 50 },
          {
            opacity: 1,
            y: 0,
            stagger: 0.08,
            duration: 0.9,
            ease: "power2.out",
            scrollTrigger: {
              trigger: section,
              start: "top 70%",
            },
          }
        );
      }
    }, section);

    return () => ctx.revert();
  }, []);

  const allActiveMembers = [
    ...teamColumns.col1,
    ...teamColumns.col2,
    ...teamColumns.col3,
    ...teamColumns.col4,
    ...teamColumns.col5,
  ];

  return (
    <section
      id="our-team-section"
      ref={sectionRef}
      className="relative w-full min-h-screen text-white py-16 sm:py-24 lg:py-32 px-4 sm:px-6 lg:px-8 overflow-hidden select-none flex flex-col justify-center items-center pb-32 sm:pb-36"
    >
      {/* Main Relative Container */}
      <div className="relative w-full max-w-7xl mx-auto flex flex-col items-center justify-center min-h-[480px] sm:min-h-[600px] lg:min-h-[800px]">
        
        {/* =========================================================================
            LAYER 1: EDITORIAL HIGH-FASHION SERIF TYPOGRAPHY
           ========================================================================= */}
        {/* Desktop Large Parallax Layer */}
        <div
          ref={textBgRef}
          className="absolute inset-0 hidden lg:flex flex-col items-center justify-start text-center pointer-events-none z-0 select-none"
        >
          <h2
            className="font-serif font-normal text-white uppercase tracking-tight leading-[0.88]"
            style={{
              fontFamily: "'Italiana', 'Cormorant Garamond', serif",
              fontSize: "clamp(4.5rem, 13vw, 12rem)",
            }}
          >
            <span className="block">A TEAM</span>
            <span className="block">THAT DEFINES</span>
            <span className="block">THE STYLE</span>
          </h2>
        </div>

        {/* Mobile & Tablet Header (< lg) */}
        <div className="lg:hidden text-center mb-8 sm:mb-12 z-20">
          <h2
            className="font-serif font-normal text-white uppercase tracking-tight leading-tight"
            style={{
              fontFamily: "'Italiana', 'Cormorant Garamond', serif",
              fontSize: "clamp(2.2rem, 7vw, 4rem)",
            }}
          >
            A TEAM THAT DEFINES THE STYLE
          </h2>
        </div>

        {/* =========================================================================
            LAYER 2A (RESPONSIVE VIEW < lg): BALANCED RESPONSIVE GRID
           ========================================================================= */}
        <div className="relative z-20 w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8 lg:hidden items-start">
          {allActiveMembers.map((m) => (
            <div key={m.id} className="team-portrait-card w-full max-w-[320px] mx-auto flex flex-col items-center group">
              <div className="w-full aspect-[3/4] overflow-hidden bg-neutral-900 shadow-2xl rounded-sm">
                <CachedImage
                  src={m.image}
                  alt={m.name}
                  className="w-full h-full object-cover object-[center_top] grayscale contrast-125 brightness-95 group-hover:scale-105 transition-transform duration-700 ease-out"
                />
              </div>
              <div className="font-mono text-xs tracking-[0.2em] text-neutral-300 uppercase mt-3 text-center font-semibold">
                {m.name}
              </div>
              {m.role && (
                <div className="font-mono text-[9px] tracking-[0.15em] text-neutral-500 uppercase mt-1 text-center">
                  {m.role}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* =========================================================================
            LAYER 2B (DESKTOP VIEW >= lg): 5-COLUMN STAGGERED EDITORIAL SPREAD
           ========================================================================= */}
        <div
          ref={portraitsRef}
          className="relative z-20 w-full hidden lg:grid grid-cols-5 gap-5 items-start mt-48 lg:mt-52"
        >
          {/* COLUMN 1: Lower Left Portrait */}
          <div className="flex flex-col items-center pt-36">
            {teamColumns.col1.map((m) => (
              <div key={m.id} className="team-portrait-card w-full flex flex-col items-center group">
                <div className="w-full aspect-[3/4] overflow-hidden bg-neutral-900 shadow-2xl">
                  <CachedImage
                    src={m.image}
                    alt={m.name}
                    className="w-full h-full object-cover object-[center_top] grayscale contrast-125 brightness-95 group-hover:scale-105 transition-transform duration-700 ease-out"
                  />
                </div>
                <div className="font-mono text-[10px] tracking-[0.2em] text-neutral-400 uppercase mt-2.5 text-center">
                  {m.name}
                </div>
                {m.role && (
                  <div className="font-mono text-[8px] tracking-[0.15em] text-neutral-500 uppercase mt-0.5 text-center">
                    {m.role}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* COLUMN 2: Elevated Top Portrait + Bottom Portrait */}
          <div className="flex flex-col items-center gap-6 pt-0">
            {teamColumns.col2.map((m) => (
              <div key={m.id} className="team-portrait-card w-full flex flex-col items-center group">
                <div className="w-full aspect-[3/4] overflow-hidden bg-neutral-900 shadow-2xl">
                  <CachedImage
                    src={m.image}
                    alt={m.name}
                    className="w-full h-full object-cover object-[center_top] grayscale contrast-125 brightness-95 group-hover:scale-105 transition-transform duration-700 ease-out"
                  />
                </div>
                <div className="font-mono text-[10px] tracking-[0.2em] text-neutral-400 uppercase mt-2.5 text-center">
                  {m.name}
                </div>
                {m.role && (
                  <div className="font-mono text-[8px] tracking-[0.15em] text-neutral-500 uppercase mt-0.5 text-center">
                    {m.role}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* COLUMN 3: Center Focal Portrait */}
          <div className="flex flex-col items-center pt-28">
            {teamColumns.col3.map((m) => (
              <div key={m.id} className="team-portrait-card w-full flex flex-col items-center group">
                <div className="w-full aspect-[3/4] overflow-hidden bg-neutral-900 shadow-2xl">
                  <CachedImage
                    src={m.image}
                    alt={m.name}
                    className="w-full h-full object-cover object-[center_top] grayscale contrast-125 brightness-95 group-hover:scale-105 transition-transform duration-700 ease-out"
                  />
                </div>
                <div className="font-mono text-[10px] tracking-[0.2em] text-neutral-400 uppercase mt-2.5 text-center">
                  {m.name}
                </div>
                {m.role && (
                  <div className="font-mono text-[8px] tracking-[0.15em] text-neutral-500 uppercase mt-0.5 text-center">
                    {m.role}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* COLUMN 4: Elevated Top Portrait + Bottom Portrait */}
          <div className="flex flex-col items-center gap-6 pt-0">
            {teamColumns.col4.map((m) => (
              <div key={m.id} className="team-portrait-card w-full flex flex-col items-center group">
                <div className="w-full aspect-[3/4] overflow-hidden bg-neutral-900 shadow-2xl">
                  <CachedImage
                    src={m.image}
                    alt={m.name}
                    className="w-full h-full object-cover object-[center_top] grayscale contrast-125 brightness-95 group-hover:scale-105 transition-transform duration-700 ease-out"
                  />
                </div>
                <div className="font-mono text-[10px] tracking-[0.2em] text-neutral-400 uppercase mt-2.5 text-center">
                  {m.name}
                </div>
                {m.role && (
                  <div className="font-mono text-[8px] tracking-[0.15em] text-neutral-500 uppercase mt-0.5 text-center">
                    {m.role}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* COLUMN 5: Lower Right Portrait */}
          <div className="flex flex-col items-center pt-36">
            {teamColumns.col5.map((m) => (
              <div key={m.id} className="team-portrait-card w-full flex flex-col items-center group">
                <div className="w-full aspect-[3/4] overflow-hidden bg-neutral-900 shadow-2xl">
                  <CachedImage
                    src={m.image}
                    alt={m.name}
                    className="w-full h-full object-cover object-[center_top] grayscale contrast-125 brightness-95 group-hover:scale-105 transition-transform duration-700 ease-out"
                  />
                </div>
                <div className="font-mono text-[10px] tracking-[0.2em] text-neutral-400 uppercase mt-2.5 text-center">
                  {m.name}
                </div>
                {m.role && (
                  <div className="font-mono text-[8px] tracking-[0.15em] text-neutral-500 uppercase mt-0.5 text-center">
                    {m.role}
                  </div>
                )}
              </div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
};

export default OurTeam;
