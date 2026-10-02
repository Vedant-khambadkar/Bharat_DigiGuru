import React, { useState } from "react";
import {
  Calendar,
  Clock,
  CheckCircle2,
  FileText,
  ExternalLink,
  Target,
  Sparkles,
  Users,
  Video,
  Layers,
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  Award,
  ChevronRight,
} from "lucide-react";
import LensText from "../components/LensText";

interface ProposalItem {
  id: "nourishing-schools" | "rise-bionics";
  tag: string;
  clientName: string;
  shortName: string;
  badge: string;
  domain: string;
  location: string;
  objective: string;
  background: string;
  summary: string;
  budgetInitial: string;
  monthlyRetainer: string;
  timeframe: string;
  roadmap: {
    step: string;
    title: string;
    desc: string;
  }[];
  deliverables: {
    socialGoals: string[];
    weeklyActivity: string[];
    monthlyDeliverables: string[];
  };
  scheduleTable?: {
    day: string;
    task: string;
    description: string;
  }[];
  weeklyVideos?: string[];
  extraNotes: string[];
  support: {
    manager: string;
    hours: string;
    remote: string;
  };
  requirements: string[];
  externalLinks?: {
    label: string;
    url: string;
  }[];
}

const PROPOSALS_DATA: ProposalItem[] = [
  {
    id: "nourishing-schools",
    tag: "01 // NON-PROFIT ACCELERATION",
    clientName: "Nourishing Schools Foundation",
    shortName: "Nourishing Schools",
    badge: "Nutrition & Education Non-Profit",
    domain: "Nutrition Education & Community Health",
    location: "Bengaluru, India",
    objective:
      "Promoting nutrition awareness, school stakeholder engagement (Govt, Schools, Corporates), and student toolkit empowerment.",
    background:
      "Nourishing Schools Foundation is a registered Not-for-Profit organization based in Bengaluru working in the nutrition space. The foundation empowers school children aged 9–14 years to improve their own and their communities' nutrition through an engaging problem-solving toolkit.",
    summary:
      "Bharat DigiGuru designed a comprehensive 4-month digital media marketing strategy to elevate brand visibility, amplify the foundation's core messaging, and cultivate long-term partnerships across government bodies, schools, and CSR corporate sponsors.",
    budgetInitial: "₹25,000 INR",
    monthlyRetainer: "₹30,000 INR / Month",
    timeframe: "4 Months Phased Execution",
    roadmap: [
      {
        step: "Phase 01",
        title: "Platform Setup & Audit",
        desc: "Social handles setup, brand identity alignment, and audience segmentation.",
      },
      {
        step: "Phase 02",
        title: "Content & Storytelling",
        desc: "Humanized storytelling highlighting children using toolkits in local schools.",
      },
      {
        step: "Phase 03",
        title: "Stakeholder Campaigns",
        desc: "Targeted outreach to government bodies, school leaders, and CSR heads.",
      },
      {
        step: "Phase 04",
        title: "Performance Review",
        desc: "Quarterly ROI evaluation, KPI reporting, and scaling roadmap.",
      },
    ],
    deliverables: {
      socialGoals: [
        "Create, schedule, and publish consistent daily multi-channel content",
        "Continuous online brand sentiment monitoring and message tracking",
        "Active community dialogue, polls, and response management",
        "Detailed monthly progress metrics and quarterly stakeholder reviews",
      ],
      weeklyActivity: [
        "1 Post per day across Facebook, X (Twitter), Instagram & LinkedIn",
        "1 High-Impact YouTube Short / Reel per week",
        "Event specials (e.g. National Nutrition Week campaigns)",
        "Social Media Optimization (SMO) for maximum search discoverability",
        "Targeted paid boosts on high-intent campaigns (on actuals)",
      ],
      monthlyDeliverables: [
        "Online Reputation & Brand Perception Management",
        "Google Ads & Multi-Channel Campaign Funnels",
        "Facebook, Instagram, LinkedIn & X Targeted Advertising",
        "Search Engine Optimization (SEO) for social profiles",
        "Comprehensive Monthly KPI Tracker & Email Reports",
      ],
    },
    extraNotes: [
      "Storytelling & Humanized Content: Capturing real-world impact of school kids using the toolkit to solve community health challenges.",
      "Stakeholder Targeting: Segmented campaigns tailored for educators, corporate CSR heads, and government agencies.",
      "Interactive Engagement: Challenges, contests, and awareness polls to drive high community involvement.",
    ],
    support: {
      manager: "1 Dedicated Account Manager",
      hours: "Mon – Fri, 10:00 AM – 06:00 PM IST",
      remote: "24/7 Remote Live Coverage during flagship events",
    },
    requirements: [
      "Social Media Handles & Analytics Access",
      "Website & Blog CMS Access",
      "Google Ads & Meta Business Manager Access",
      "Brand Assets & Activity Imagery",
    ],
    externalLinks: [
      {
        label: "View Proposal Deck Presentation",
        url: "https://docs.google.com/presentation/d/1RbWpmw1_vYWEJGRc_EMrbWt_6BSdl1vf2uClMORYXeo/edit#slide=id.g18d2180c16c_34_366",
      },
      {
        label: "Digital Marketing Proposal Format (PDF)",
        url: "https://www.smsindiahub.in/assets/doc/Digital%20Marketing%20Proposal.pdf",
      },
    ],
  },
  {
    id: "rise-bionics",
    tag: "02 // DEEP-TECH HEALTHCARE",
    clientName: "Rise Bionics",
    shortName: "Rise Bionics",
    badge: "Assistive Tech & Prosthetics",
    domain: "Affordable Prosthetics & 3D Digital Scanning",
    location: "Bengaluru, India",
    objective:
      "Scaling market awareness for customized cane-based prosthetic legs, polio braces, and accessible 3D digital scanning technology.",
    background:
      "Rise Bionics is a Bengaluru-based assistive technology startup dedicated to offering customized polio braces and lightweight, flexible cane prosthetic legs at accessible price points, breaking traditional healthcare cost barriers.",
    summary:
      "Bharat DigiGuru deployed a patient-centric, clinical storytelling digital strategy to build doctor credibility, showcase real patient mobility milestones, and drive direct patient consultation inquiries.",
    budgetInitial: "₹50,000 INR",
    monthlyRetainer: "₹50,000 INR / Month",
    timeframe: "4 Months Phased Execution",
    roadmap: [
      {
        step: "Phase 01",
        title: "Clinical Brand Foundation",
        desc: "Profile optimization, medical authority setup, and 3D scanner showcase.",
      },
      {
        step: "Phase 02",
        title: "Patient Impact Stories",
        desc: "Documenting life transformations (e.g. Navna's story) and mobility milestones.",
      },
      {
        step: "Phase 03",
        title: "Doctor & Clinic Outreach",
        desc: "Medical bytes, orthotic workshops, and targeted patient lead funnels.",
      },
      {
        step: "Phase 04",
        title: "Consultation Scaling",
        desc: "Direct WhatsApp booking automation and multi-city patient reach.",
      },
    ],
    deliverables: {
      socialGoals: [
        "Patient success story storytelling (e.g. Navna's transformation)",
        "3D digital scanning technology awareness and educational series",
        "Direct doctor and clinical network engagement",
        "Lead acquisition engine for device consultations",
      ],
      weeklyActivity: [
        "1 High-converting post per day on LinkedIn, Instagram, FB, and X",
        "1 Cinematic YouTube Short / Reel per week",
        "Event-focused broadcasts (e.g., National Doctors' Day)",
        "SMO & Organic profile authority ranking",
      ],
      monthlyDeliverables: [
        "Brand reputation & medical authority management",
        "Targeted Google Ads & Meta patient acquisition funnels",
        "Dedicated SEO for prosthetic & orthotic queries",
        "Comprehensive KPI tracker and monthly performance review",
      ],
    },
    scheduleTable: [
      {
        day: "Monday",
        task: "Content Creation",
        description:
          "Develop engaging blog posts and social content highlighting cane-based prosthetics and real patient success stories (e.g. Navna).",
      },
      {
        day: "Tuesday",
        task: "Social Media Campaign",
        description:
          "Launch visual campaigns highlighting custom-made assistive devices, affordability benchmarks, and personalized patient solutions.",
      },
      {
        day: "Wednesday",
        task: "Video Marketing",
        description:
          "Produce video content showcasing the 3D digital scanning process and emphasizing seamless universal accessibility.",
      },
      {
        day: "Thursday",
        task: "Community Engagement",
        description:
          "Direct community outreach, answering inquiries, and engaging with healthcare professionals.",
      },
      {
        day: "Friday",
        task: "Email Newsletter",
        description:
          "Send curated weekly wrap-up newsletter to subscribers highlighting clinical breakthroughs and user testimonials.",
      },
    ],
    weeklyVideos: [
      "Product Description & Behind-the-Scenes Making",
      "On-site Patient Fitting & Body Alignment",
      "User Reviews, Patient Impact & Life Transformations",
      "Clinical Insights & Bytes from Medical Doctors",
    ],
    extraNotes: [
      "Clinical Trust Architecture: Combining doctor testimonials with patient mobility footage.",
      "High-Conversion Inquiries: Direct WhatsApp & landing page funnels for prosthetic consultations.",
      "Agile Optimization: Bi-weekly ad adjustments based on cost-per-consultation metrics.",
    ],
    support: {
      manager: "1 Dedicated Account Manager",
      hours: "Mon – Fri, 10:00 AM – 06:00 PM IST",
      remote: "24/7 Remote Live Support during medical camps",
    },
    requirements: [
      "Website & Blog CMS Access",
      "Analytics & Search Console Access",
      "Google Ads & Meta Ads Manager",
      "Patient Fit-Out Footage & Imagery",
    ],
    externalLinks: [
      {
        label: "View SlideShare Proposal Deck",
        url: "https://www.slideshare.net/KenKhan6/complete-digital-marketing-proposal-format-1pdf",
      },
      {
        label: "Full Presentation Slides",
        url: "https://docs.google.com/presentation/d/1RbWpmw1_vYWEJGRc_EMrbWt_6BSdl1vf2uClMORYXeo/edit#slide=id.g18d2180c16c_34_366",
      },
    ],
  },
];

export const ClientProposals: React.FC = () => {
  const [activeProposalId, setActiveProposalId] = useState<"nourishing-schools" | "rise-bionics">(
    "nourishing-schools"
  );
  const [activeScheduleDay, setActiveScheduleDay] = useState<string>("Monday");

  const proposal = PROPOSALS_DATA.find((p) => p.id === activeProposalId) || PROPOSALS_DATA[0];

  return (
    <section
      id="proposals-section"
      className="relative z-10 bg-transparent text-white w-full px-6 sm:px-10 md:px-12 lg:px-16 py-16 sm:py-24 overflow-hidden font-['Plus_Jakarta_Sans',-apple-system,BlinkMacSystemFont,'Segoe_UI',Roboto,sans-serif]"
    >
      {/* Subtle ambient lighting */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/3 w-[550px] h-[550px] bg-white/[0.02] blur-[150px] rounded-full" />
        <div className="absolute bottom-1/4 right-1/4 w-[450px] h-[450px] bg-red-600/[0.02] blur-[140px] rounded-full" />
      </div>

      <div className="relative z-10 w-full max-w-8xl mx-auto flex flex-col gap-12 sm:gap-16">
        {/* =========================================================================
            HEADER SECTION: Clean Minimal Headline
           ========================================================================= */}
        <div className="flex flex-col gap-4 max-w-3xl">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-white/70" />
            <span className="text-xs font-semibold tracking-widest uppercase text-neutral-400 font-['Plus_Jakarta_Sans',sans-serif]">
              Strategy & Blueprints
            </span>
          </div>

          <h2 className="font-neuropol text-3xl sm:text-4xl lg:text-5xl uppercase tracking-wider text-white leading-none select-none">
            <LensText text="CLIENT PROPOSALS" strokeWidth="2px" strokeColor="#ffffff" />
          </h2>

          <p className="text-sm sm:text-base text-neutral-400 leading-relaxed max-w-2xl font-['Plus_Jakarta_Sans',sans-serif]">
            Explore our real-world marketing proposals, phased execution plans, and transparent retainer structures engineered for sustainable brand growth.
          </p>
        </div>

        {/* =========================================================================
            INTERACTIVE DUAL CLIENT SELECTOR CARDS
           ========================================================================= */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 font-['Plus_Jakarta_Sans',sans-serif]">
          {PROPOSALS_DATA.map((item) => {
            const isActive = activeProposalId === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setActiveProposalId(item.id);
                  if (item.scheduleTable) {
                    setActiveScheduleDay(item.scheduleTable[0].day);
                  }
                }}
                className={`relative p-6 sm:p-7 rounded-2xl text-left transition-all duration-300 cursor-pointer border flex flex-col justify-between gap-4 font-['Plus_Jakarta_Sans',sans-serif] ${
                  isActive
                    ? "bg-[#111111] border-white/40 shadow-[0_10px_30px_rgba(0,0,0,0.8)]"
                    : "bg-[#090909] border-neutral-800/80 hover:border-neutral-700 hover:bg-[#0c0c0c] text-neutral-400"
                }`}
              >
                <div className="flex items-start justify-between gap-2 w-full">
                  <div className="flex flex-col gap-1">
                    <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500 font-['Plus_Jakarta_Sans',sans-serif]">
                      {item.tag}
                    </span>
                    <h3 className={`text-xl sm:text-2xl font-bold font-['Plus_Jakarta_Sans',sans-serif] ${isActive ? "text-white" : "text-neutral-300"}`}>
                      {item.clientName}
                    </h3>
                  </div>

                  <span
                    className={`text-xs font-semibold px-2.5 py-1 rounded-full shrink-0 border font-['Plus_Jakarta_Sans',sans-serif] ${
                      isActive
                        ? "bg-white text-black border-white font-bold"
                        : "bg-neutral-900 text-neutral-400 border-neutral-800"
                    }`}
                  >
                    {item.badge}
                  </span>
                </div>

                <div className="flex items-center justify-between w-full pt-3 border-t border-neutral-800/80 text-xs font-['Plus_Jakarta_Sans',sans-serif]">
                  <div className="flex items-center gap-2">
                    <span className="text-neutral-500 font-medium">Retainer:</span>
                    <span className={`font-semibold ${isActive ? "text-white" : "text-neutral-300"}`}>
                      {item.monthlyRetainer}
                    </span>
                  </div>

                  <span className="flex items-center gap-1 text-xs font-medium text-neutral-400 group">
                    <span>{isActive ? "Viewing Blueprint" : "Inspect Scope"}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* =========================================================================
            MAIN PROPOSAL BENTO GRID (Clean readable sans-serif typography)
           ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start font-['Plus_Jakarta_Sans',sans-serif]">
          {/* LEFT: Core Blueprint & Execution Scope (8 Cols) */}
          <div className="lg:col-span-8 flex flex-col gap-6 font-['Plus_Jakarta_Sans',sans-serif]">
            {/* 1. Executive Brief & Strategic Objective */}
            <div className="bg-[#0b0b0b] border border-neutral-800/80 rounded-2xl p-6 sm:p-8 flex flex-col gap-5">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <span className="text-xs font-semibold tracking-wider text-neutral-400 uppercase font-['Plus_Jakarta_Sans',sans-serif]">
                  Executive Briefing
                </span>
                <span className="text-xs font-medium text-neutral-300 bg-neutral-900 border border-neutral-800 px-3 py-1 rounded-full font-['Plus_Jakarta_Sans',sans-serif]">
                  {proposal.location} • {proposal.domain}
                </span>
              </div>

              <p className="text-sm sm:text-base text-neutral-200 leading-relaxed font-['Plus_Jakarta_Sans',sans-serif]">
                {proposal.background}
              </p>

              <div className="p-4 rounded-xl bg-neutral-900/70 border border-neutral-800 flex items-start gap-3">
                <Target className="w-5 h-5 text-white shrink-0 mt-0.5" />
                <div className="flex flex-col gap-1">
                  <span className="text-xs uppercase tracking-wider text-neutral-400 font-bold font-['Plus_Jakarta_Sans',sans-serif]">
                    Core Campaign Mission
                  </span>
                  <span className="text-xs sm:text-sm text-neutral-200 leading-relaxed font-['Plus_Jakarta_Sans',sans-serif]">
                    {proposal.objective}
                  </span>
                </div>
              </div>
            </div>

            {/* 2. 4-Phase Implementation Roadmap */}
            <div className="bg-[#0b0b0b] border border-neutral-800/80 rounded-2xl p-6 sm:p-8 flex flex-col gap-5">
              <div className="flex items-center justify-between">
                <h4 className="text-sm sm:text-base font-bold text-white uppercase tracking-wider flex items-center gap-2 font-['Plus_Jakarta_Sans',sans-serif]">
                  <TrendingUp className="w-4 h-4 text-white" />
                  4-Month Phased Execution Roadmap
                </h4>
                <span className="text-xs font-medium uppercase text-neutral-400 bg-neutral-900 border border-neutral-800 px-2.5 py-1 rounded font-['Plus_Jakarta_Sans',sans-serif]">
                  {proposal.timeframe}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {proposal.roadmap.map((r, i) => (
                  <div
                    key={i}
                    className="p-4 rounded-xl bg-neutral-900/60 border border-neutral-800/80 flex flex-col gap-1.5 font-['Plus_Jakarta_Sans',sans-serif]"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase text-neutral-400 font-['Plus_Jakarta_Sans',sans-serif]">
                        {r.step}
                      </span>
                      <span className="w-2 h-2 rounded-full bg-white/70" />
                    </div>
                    <span className="text-sm font-bold text-white font-['Plus_Jakarta_Sans',sans-serif]">
                      {r.title}
                    </span>
                    <p className="text-xs text-neutral-300 leading-relaxed font-['Plus_Jakarta_Sans',sans-serif]">
                      {r.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* 3. Deliverables & Activity Rhythm */}
            <div className="bg-[#0b0b0b] border border-neutral-800/80 rounded-2xl p-6 sm:p-8 flex flex-col gap-6 font-['Plus_Jakarta_Sans',sans-serif]">
              <h4 className="text-sm sm:text-base font-bold text-white uppercase tracking-wider flex items-center gap-2 font-['Plus_Jakarta_Sans',sans-serif]">
                <Layers className="w-4 h-4 text-white" />
                Action Plan & Scope Breakdown
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Social Goals */}
                <div className="flex flex-col gap-3 font-['Plus_Jakarta_Sans',sans-serif]">
                  <span className="text-xs font-bold uppercase tracking-wider text-neutral-400 border-b border-neutral-800 pb-2 font-['Plus_Jakarta_Sans',sans-serif]">
                    Social & Campaign Objectives
                  </span>
                  <ul className="flex flex-col gap-2.5 text-xs text-neutral-200 font-['Plus_Jakarta_Sans',sans-serif]">
                    {proposal.deliverables.socialGoals.map((g, i) => (
                      <li key={i} className="flex items-start gap-2.5 font-['Plus_Jakarta_Sans',sans-serif]">
                        <CheckCircle2 className="w-4 h-4 text-white shrink-0 mt-0.5" />
                        <span>{g}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Weekly Rhythm */}
                <div className="flex flex-col gap-3 font-['Plus_Jakarta_Sans',sans-serif]">
                  <span className="text-xs font-bold uppercase tracking-wider text-neutral-400 border-b border-neutral-800 pb-2 font-['Plus_Jakarta_Sans',sans-serif]">
                    Weekly Publishing Rhythm
                  </span>
                  <ul className="flex flex-col gap-2.5 text-xs text-neutral-200 font-['Plus_Jakarta_Sans',sans-serif]">
                    {proposal.deliverables.weeklyActivity.map((w, i) => (
                      <li key={i} className="flex items-start gap-2.5 font-['Plus_Jakarta_Sans',sans-serif]">
                        <CheckCircle2 className="w-4 h-4 text-white shrink-0 mt-0.5" />
                        <span>{w}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Monthly Retainer Commitments */}
              <div className="pt-4 border-t border-neutral-800/80 flex flex-col gap-3 font-['Plus_Jakarta_Sans',sans-serif]">
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-400 font-['Plus_Jakarta_Sans',sans-serif]">
                  Monthly Retainer Commitments
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-neutral-200 font-['Plus_Jakarta_Sans',sans-serif]">
                  {proposal.deliverables.monthlyDeliverables.map((m, i) => (
                    <div
                      key={i}
                      className="p-3 rounded-xl bg-neutral-900/70 border border-neutral-800/90 flex items-center gap-2.5 font-['Plus_Jakarta_Sans',sans-serif]"
                    >
                      <Sparkles className="w-4 h-4 text-neutral-400 shrink-0" />
                      <span>{m}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 4. Weekly Content Schedule (Interactive 5-Day Matrix for Rise Bionics) */}
            {proposal.scheduleTable && (
              <div className="bg-[#0b0b0b] border border-neutral-800/80 rounded-2xl p-6 sm:p-8 flex flex-col gap-5 font-['Plus_Jakarta_Sans',sans-serif]">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm sm:text-base font-bold text-white uppercase tracking-wider flex items-center gap-2 font-['Plus_Jakarta_Sans',sans-serif]">
                    <Calendar className="w-4 h-4 text-white" />
                    Weekly Content Schedule Matrix
                  </h4>
                  <span className="text-xs font-medium uppercase text-neutral-400 bg-neutral-900 border border-neutral-800 px-2.5 py-1 rounded font-['Plus_Jakarta_Sans',sans-serif]">
                    Mon – Fri Sprint
                  </span>
                </div>

                {/* Day selector pills */}
                <div className="flex flex-wrap gap-2 font-['Plus_Jakarta_Sans',sans-serif]">
                  {proposal.scheduleTable.map((row) => {
                    const isSelected = activeScheduleDay === row.day;
                    return (
                      <button
                        key={row.day}
                        type="button"
                        onClick={() => setActiveScheduleDay(row.day)}
                        className={`px-4 py-2 rounded-lg text-xs font-semibold uppercase transition-all cursor-pointer border font-['Plus_Jakarta_Sans',sans-serif] ${
                          isSelected
                            ? "bg-white text-black border-white font-bold shadow-sm"
                            : "bg-neutral-900 text-neutral-300 border-neutral-800 hover:text-white hover:bg-neutral-800"
                        }`}
                      >
                        {row.day}
                      </button>
                    );
                  })}
                </div>

                {/* Active Day Detail Box */}
                {(() => {
                  const activeRow =
                    proposal.scheduleTable.find((r) => r.day === activeScheduleDay) ||
                    proposal.scheduleTable[0];
                  return (
                    <div className="p-4 sm:p-5 rounded-xl bg-neutral-900/80 border border-neutral-800 flex flex-col gap-2 font-['Plus_Jakarta_Sans',sans-serif]">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white uppercase font-['Plus_Jakarta_Sans',sans-serif]">
                          {activeRow.day} • {activeRow.task}
                        </span>
                        <span className="text-xs text-neutral-400 font-medium font-['Plus_Jakarta_Sans',sans-serif]">
                          Weekly Focus
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-neutral-200 leading-relaxed font-['Plus_Jakarta_Sans',sans-serif]">
                        {activeRow.description}
                      </p>
                    </div>
                  );
                })()}
              </div>
            )}

            {/* 5. Weekly Video Production Focus if applicable */}
            {proposal.weeklyVideos && (
              <div className="bg-[#0b0b0b] border border-neutral-800/80 rounded-2xl p-6 sm:p-8 flex flex-col gap-4 font-['Plus_Jakarta_Sans',sans-serif]">
                <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 font-['Plus_Jakarta_Sans',sans-serif]">
                  <Video className="w-4 h-4 text-white" />
                  Weekly Video Production Themes
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-['Plus_Jakarta_Sans',sans-serif]">
                  {proposal.weeklyVideos.map((v, i) => (
                    <div
                      key={i}
                      className="p-3 rounded-xl bg-neutral-900/70 border border-neutral-800 flex items-start gap-2.5 text-xs text-neutral-200 font-['Plus_Jakarta_Sans',sans-serif]"
                    >
                      <span className="text-neutral-400 font-bold">0{i + 1}</span>
                      <span>{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT: Financials, Support SLA & Documentation (4 Cols) */}
          <div className="lg:col-span-4 flex flex-col gap-6 font-['Plus_Jakarta_Sans',sans-serif]">
            {/* Retainer & Setup Card */}
            <div className="bg-[#0b0b0b] border border-neutral-800/80 rounded-2xl p-6 sm:p-7 flex flex-col gap-4 font-['Plus_Jakarta_Sans',sans-serif]">
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-400 font-['Plus_Jakarta_Sans',sans-serif]">
                Retainer & Setup
              </span>

              <div className="flex flex-col gap-3 pt-1 font-['Plus_Jakarta_Sans',sans-serif]">
                <div className="p-4 rounded-xl bg-neutral-900/90 border border-neutral-800 flex flex-col gap-1 font-['Plus_Jakarta_Sans',sans-serif]">
                  <span className="text-xs text-neutral-400 uppercase font-semibold font-['Plus_Jakarta_Sans',sans-serif]">
                    Monthly Retainer Fee
                  </span>
                  <span className="text-xl font-bold text-white font-['Plus_Jakarta_Sans',sans-serif]">
                    {proposal.monthlyRetainer}
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-neutral-900/90 border border-neutral-800 flex flex-col gap-1 font-['Plus_Jakarta_Sans',sans-serif]">
                  <span className="text-xs text-neutral-400 uppercase font-semibold font-['Plus_Jakarta_Sans',sans-serif]">
                    Initial Phase Budget
                  </span>
                  <span className="text-base font-bold text-neutral-200 font-['Plus_Jakarta_Sans',sans-serif]">
                    {proposal.budgetInitial}
                  </span>
                </div>
              </div>
            </div>

            {/* Support SLA Card */}
            <div className="bg-[#0b0b0b] border border-neutral-800/80 rounded-2xl p-6 sm:p-7 flex flex-col gap-4 font-['Plus_Jakarta_Sans',sans-serif]">
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5 font-['Plus_Jakarta_Sans',sans-serif]">
                <ShieldCheck className="w-4 h-4 text-white" />
                Dedicated Account SLA
              </span>

              <div className="flex flex-col gap-3 text-xs text-neutral-200 font-['Plus_Jakarta_Sans',sans-serif]">
                <div className="flex items-center gap-2.5">
                  <Users className="w-4 h-4 text-neutral-400 shrink-0" />
                  <span>{proposal.support.manager}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Clock className="w-4 h-4 text-neutral-400 shrink-0" />
                  <span>{proposal.support.hours}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-white shrink-0" />
                  <span>{proposal.support.remote}</span>
                </div>
              </div>
            </div>

            {/* Requirements Card */}
            <div className="bg-[#0b0b0b] border border-neutral-800/80 rounded-2xl p-6 sm:p-7 flex flex-col gap-3 font-['Plus_Jakarta_Sans',sans-serif]">
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-400 font-['Plus_Jakarta_Sans',sans-serif]">
                Onboarding Requirements
              </span>
              <ul className="flex flex-col gap-2 text-xs text-neutral-300 font-['Plus_Jakarta_Sans',sans-serif]">
                {proposal.requirements.map((req, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-neutral-500">•</span>
                    <span>{req}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* External Proposal References */}
            {proposal.externalLinks && proposal.externalLinks.length > 0 && (
              <div className="bg-[#0b0b0b] border border-neutral-800/80 rounded-2xl p-6 sm:p-7 flex flex-col gap-3 font-['Plus_Jakarta_Sans',sans-serif]">
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5 font-['Plus_Jakarta_Sans',sans-serif]">
                  <FileText className="w-4 h-4 text-white" />
                  Proposal Documents
                </span>
                <div className="flex flex-col gap-2 pt-1 font-['Plus_Jakarta_Sans',sans-serif]">
                  {proposal.externalLinks.map((link, i) => (
                    <a
                      key={i}
                      href={link.url}
                      target="_blank"
                      rel="noreferrer"
                      className="p-3 rounded-xl bg-neutral-900/80 hover:bg-neutral-800 border border-neutral-800 hover:border-neutral-600 transition-all flex items-center justify-between text-xs text-neutral-200 hover:text-white font-['Plus_Jakarta_Sans',sans-serif]"
                    >
                      <span className="truncate pr-2 font-medium">{link.label}</span>
                      <ExternalLink className="w-3.5 h-3.5 shrink-0 text-neutral-400" />
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* CTA Request Proposal Card */}
            <div className="bg-white text-black rounded-2xl p-6 sm:p-7 flex flex-col gap-3 shadow-xl font-['Plus_Jakarta_Sans',sans-serif]">
              <div className="flex items-center gap-1.5">
                <Award className="w-4 h-4 text-black" />
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-600 font-['Plus_Jakarta_Sans',sans-serif]">
                  Enterprise Sprints
                </span>
              </div>
              <h4 className="font-bold text-lg leading-tight font-['Plus_Jakarta_Sans',sans-serif]">
                Ready to build a tailored proposal for your brand?
              </h4>
              <p className="text-xs text-neutral-600 leading-relaxed font-['Plus_Jakarta_Sans',sans-serif]">
                Our specialists craft multi-channel growth proposals with fixed milestone pricing and guaranteed execution SLA.
              </p>
              <a
                href="#contact-section"
                className="mt-2 w-full py-3.5 rounded-lg bg-black hover:bg-neutral-800 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-colors cursor-pointer font-['Plus_Jakarta_Sans',sans-serif]"
              >
                <span>Request Custom Proposal</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ClientProposals;
