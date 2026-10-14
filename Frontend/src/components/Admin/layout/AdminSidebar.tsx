import React from "react";
import {
  BarChart3,
  Briefcase,
  Layers,
  Sparkles,
  UserCheck,
  BookOpen,
  Film,
  Mail,
  Users,
} from "lucide-react";

export type TabType =
  | "overview"
  | "admins"
  | "portfolio"
  | "services"
  | "brands"
  | "team"
  | "blogs"
  | "threed"
  | "inquiries"

interface AdminSidebarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  currentUser: {
    role: "managedAdmin" | "superAdmin" | "admin";
  };
  stats: {
    totalPortfolio: number;
    totalServices: number;
    totalTeam: number;
    totalBlogs: number;
    totalThreeD: number;
    totalInquiries: number;
    newInquiries: number;
  };
  teamTotal?: number;
  blogsTotal?: number;
  adminUsersCount?: number;
  onFetchPortfolio?: () => void;
  onFetchServices?: () => void;
  onFetchTeam?: () => void;
  onFetchBlogs?: () => void;
  onFetchThreeD?: () => void;
  onFetchInquiries?: () => void;
  onFetchAdminUsers?: () => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  activeTab,
  setActiveTab,
  currentUser,
  stats,
  teamTotal = 0,
  blogsTotal = 0,
  adminUsersCount = 1,
  onFetchPortfolio,
  onFetchServices,
  onFetchTeam,
  onFetchBlogs,
  onFetchThreeD,
  onFetchInquiries,
  onFetchAdminUsers,
}) => {
  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-60 border-r border-white/10 bg-[#0b0c12]/95 p-4 flex-col gap-2 shrink-0">
        {/* Overview */}
        <button
          onClick={() => setActiveTab("overview")}
          className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-mono tracking-wider transition-all cursor-pointer ${activeTab === "overview"
              ? "bg-[#ff3b30] text-white font-bold shadow-[0_0_15px_rgba(255,59,48,0.35)]"
              : "text-neutral-400 hover:text-white hover:bg-white/5 bg-white/[0.02] border border-white/5"
            }`}
        >
          <BarChart3 size={15} className="shrink-0" />
          <span>OVERVIEW</span>
        </button>

        {/* Portfolio */}
        <button
          onClick={() => {
            setActiveTab("portfolio");
            onFetchPortfolio?.();
          }}
          className={`flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-xl text-xs font-mono tracking-wider transition-all cursor-pointer ${activeTab === "portfolio"
              ? "bg-[#ff3b30] text-white font-bold shadow-[0_0_15px_rgba(255,59,48,0.35)]"
              : "text-neutral-400 hover:text-white hover:bg-white/5 bg-white/[0.02] border border-white/5"
            }`}
        >
          <div className="flex items-center gap-2 min-w-0">
            <Briefcase size={15} className="shrink-0" />
            <span>PORTFOLIO</span>
          </div>
          <span
            className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold font-mono ${activeTab === "portfolio"
                ? "bg-white/20 text-white"
                : "bg-white/10 text-neutral-300"
              }`}
          >
            {stats.totalPortfolio}
          </span>
        </button>

        {/* Services */}
        <button
          onClick={() => {
            setActiveTab("services");
            onFetchServices?.();
          }}
          className={`flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-xl text-xs font-mono tracking-wider transition-all cursor-pointer ${activeTab === "services"
              ? "bg-[#ff3b30] text-white font-bold shadow-[0_0_15px_rgba(255,59,48,0.35)]"
              : "text-neutral-400 hover:text-white hover:bg-white/5 bg-white/[0.02] border border-white/5"
            }`}
        >
          <div className="flex items-center gap-2 min-w-0">
            <Layers size={15} className="shrink-0" />
            <span>SERVICES</span>
          </div>
          <span
            className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold font-mono ${activeTab === "services"
                ? "bg-white/20 text-white"
                : "bg-white/10 text-neutral-300"
              }`}
          >
            {stats.totalServices}
          </span>
        </button>

        {/* Brand Collaborations */}
        <button
          onClick={() => {
            setActiveTab("brands");
          }}
          className={`flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-xl text-xs font-mono tracking-wider transition-all cursor-pointer ${activeTab === "brands"
              ? "bg-gradient-to-r from-red-600 to-rose-600 text-white font-bold shadow-[0_0_15px_rgba(239,68,68,0.35)]"
              : "text-neutral-400 hover:text-white hover:bg-white/5 bg-white/[0.02] border border-white/5"
            }`}
        >
          <div className="flex items-center gap-2 min-w-0">
            <Sparkles size={15} className="shrink-0 text-rose-400" />
            <span>BRAND COLLABS</span>
          </div>
        </button>

        {/* Team */}
        <button
          onClick={() => {
            setActiveTab("team");
            onFetchTeam?.();
          }}
          className={`flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-xl text-xs font-mono tracking-wider transition-all cursor-pointer ${activeTab === "team"
              ? "bg-white text-black font-bold shadow-[0_0_15px_rgba(255,255,255,0.35)]"
              : "text-neutral-400 hover:text-white hover:bg-white/5 bg-white/[0.02] border border-white/5"
            }`}
        >
          <div className="flex items-center gap-2 min-w-0">
            <UserCheck size={15} className="shrink-0 text-neutral-300" />
            <span>OUR TEAM</span>
          </div>
          <span
            className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold font-mono ${activeTab === "team"
                ? "bg-black/20 text-black font-bold"
                : "bg-white/10 text-neutral-300"
              }`}
          >
            {stats.totalTeam || teamTotal}
          </span>
        </button>

        {/* Blogs & Articles */}
        <button
          onClick={() => {
            setActiveTab("blogs");
            onFetchBlogs?.();
          }}
          className={`flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-xl text-xs font-mono tracking-wider transition-all cursor-pointer ${activeTab === "blogs"
              ? "bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-bold shadow-[0_0_15px_rgba(6,182,212,0.35)]"
              : "text-neutral-400 hover:text-white hover:bg-white/5 bg-white/[0.02] border border-white/5"
            }`}
        >
          <div className="flex items-center gap-2 min-w-0">
            <BookOpen size={15} className="shrink-0 text-cyan-400" />
            <span>BLOGS</span>
          </div>
          <span
            className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold font-mono ${activeTab === "blogs"
                ? "bg-white/20 text-white"
                : "bg-white/10 text-neutral-300"
              }`}
          >
            {stats.totalBlogs || blogsTotal}
          </span>
        </button>

        {/* 3D SHOWCASE - ONLY VISIBLE TO MANAGED ADMIN */}
        {currentUser.role === "managedAdmin" && (
          <button
            onClick={() => {
              setActiveTab("threed");
              onFetchThreeD?.();
            }}
            className={`flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-xl text-xs font-mono tracking-wider transition-all cursor-pointer ${activeTab === "threed"
                ? "bg-purple-600 text-white font-bold shadow-[0_0_15px_rgba(147,51,234,0.35)]"
                : "text-neutral-400 hover:text-white hover:bg-white/5 bg-white/[0.02] border border-white/5"
              }`}
          >
            <div className="flex items-center gap-2 min-w-0">
              <Film size={15} className="shrink-0 text-purple-400" />
              <span>3D SHOWCASE</span>
            </div>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold font-mono ${activeTab === "threed"
                  ? "bg-white/20 text-white"
                  : "bg-white/10 text-neutral-300"
                }`}
            >
              {stats.totalThreeD}
            </span>
          </button>
        )}

        {/* Inquiries */}
        <button
          onClick={() => {
            setActiveTab("inquiries");
            onFetchInquiries?.();
          }}
          className={`flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-xl text-xs font-mono tracking-wider transition-all cursor-pointer relative ${activeTab === "inquiries"
              ? "bg-[#ff3b30] text-white font-bold shadow-[0_0_15px_rgba(255,59,48,0.35)]"
              : "text-neutral-400 hover:text-white hover:bg-white/5 bg-white/[0.02] border border-white/5"
            }`}
        >
          <div className="flex items-center gap-2 min-w-0">
            <Mail size={15} className="shrink-0" />
            <span>INQUIRIES</span>
          </div>
          <div className="flex items-center gap-1">
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold font-mono ${activeTab === "inquiries"
                  ? "bg-white/20 text-white"
                  : "bg-white/10 text-neutral-300"
                }`}
            >
              {stats.totalInquiries}
            </span>
            {stats.newInquiries > 0 && (
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            )}
          </div>
        </button>

        {/* ADMIN MANAGEMENT - VISIBLE TO MANAGED ADMIN & SUPER ADMIN */}
        {(currentUser.role === "managedAdmin" || currentUser.role === "superAdmin") && (
          <button
            onClick={() => {
              setActiveTab("admins");
              onFetchAdminUsers?.();
            }}
            className={`flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-xl text-xs font-mono tracking-wider transition-all cursor-pointer ${activeTab === "admins"
                ? "bg-emerald-600 text-white font-bold shadow-[0_0_15px_rgba(16,185,129,0.35)]"
                : "text-neutral-400 hover:text-white hover:bg-white/5 bg-white/[0.02] border border-white/5"
              }`}
          >
            <div className="flex items-center gap-2 min-w-0">
              <Users size={15} className="shrink-0 text-emerald-400" />
              <span>ADMINS</span>
            </div>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold font-mono ${activeTab === "admins"
                  ? "bg-white/20 text-white"
                  : "bg-white/10 text-neutral-300"
                }`}
            >
              {adminUsersCount}
            </span>
          </button>
        )}
      </aside>

      {/* Mobile Bottom Navigation Dock */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#0c0d14]/95 backdrop-blur-2xl border-t border-white/15 px-2 py-1.5 flex items-center justify-around shadow-[0_-10px_35px_rgba(0,0,0,0.85)]">
        {/* 1. Overview */}
        <button
          onClick={() => setActiveTab("overview")}
          className={`flex flex-col items-center justify-center gap-1 py-1.5 px-2 rounded-2xl transition-all cursor-pointer relative ${activeTab === "overview"
              ? "text-white font-bold"
              : "text-neutral-400 hover:text-white"
            }`}
        >
          <div
            className={`p-1.5 rounded-xl transition-all ${activeTab === "overview"
                ? "bg-[#ff3b30] text-white shadow-[0_0_15px_rgba(255,59,48,0.5)]"
                : "bg-transparent"
              }`}
          >
            <BarChart3 size={16} />
          </div>
          <span className="text-[9px] font-mono tracking-tight">Overview</span>
        </button>

        {/* 2. Portfolio */}
        <button
          onClick={() => {
            setActiveTab("portfolio");
            onFetchPortfolio?.();
          }}
          className={`flex flex-col items-center justify-center gap-1 py-1.5 px-2 rounded-2xl transition-all cursor-pointer relative ${activeTab === "portfolio"
              ? "text-white font-bold"
              : "text-neutral-400 hover:text-white"
            }`}
        >
          <div
            className={`p-1.5 rounded-xl relative transition-all ${activeTab === "portfolio"
                ? "bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.5)]"
                : "bg-transparent"
              }`}
          >
            <Briefcase size={16} />
            <span className="absolute -top-1 -right-1 px-1 py-0.2 rounded-full bg-blue-500 text-[8px] font-mono text-white font-bold leading-none">
              {stats.totalPortfolio}
            </span>
          </div>
          <span className="text-[9px] font-mono tracking-tight">Portfolio</span>
        </button>

        {/* 3. Services */}
        <button
          onClick={() => {
            setActiveTab("services");
            onFetchServices?.();
          }}
          className={`flex flex-col items-center justify-center gap-1 py-1.5 px-2 rounded-2xl transition-all cursor-pointer relative ${activeTab === "services"
              ? "text-white font-bold"
              : "text-neutral-400 hover:text-white"
            }`}
        >
          <div
            className={`p-1.5 rounded-xl relative transition-all ${activeTab === "services"
                ? "bg-[#ff3b30] text-white shadow-[0_0_15px_rgba(255,59,48,0.5)]"
                : "bg-transparent"
              }`}
          >
            <Layers size={16} />
            <span className="absolute -top-1 -right-1 px-1 py-0.2 rounded-full bg-red-500 text-[8px] font-mono text-white font-bold leading-none">
              {stats.totalServices}
            </span>
          </div>
          <span className="text-[9px] font-mono tracking-tight">Services</span>
        </button>

        {/* Brands (Mobile) */}
        <button
          onClick={() => setActiveTab("brands")}
          className={`flex flex-col items-center justify-center gap-1 py-1.5 px-2 rounded-2xl transition-all cursor-pointer relative ${activeTab === "brands"
              ? "text-white font-bold"
              : "text-neutral-400 hover:text-white"
            }`}
        >
          <div
            className={`p-1.5 rounded-xl relative transition-all ${activeTab === "brands"
                ? "bg-rose-600 text-white shadow-[0_0_15px_rgba(244,63,94,0.5)]"
                : "bg-transparent"
              }`}
          >
            <Sparkles size={16} />
          </div>
          <span className="text-[9px] font-mono tracking-tight">Brands</span>
        </button>

        {/* 4. Team */}
        <button
          onClick={() => {
            setActiveTab("team");
            onFetchTeam?.();
          }}
          className={`flex flex-col items-center justify-center gap-1 py-1.5 px-2 rounded-2xl transition-all cursor-pointer relative ${activeTab === "team"
              ? "text-white font-bold"
              : "text-neutral-400 hover:text-white"
            }`}
        >
          <div
            className={`p-1.5 rounded-xl relative transition-all ${activeTab === "team"
                ? "bg-white text-black shadow-[0_0_15px_rgba(255,255,255,0.5)]"
                : "bg-transparent"
              }`}
          >
            <UserCheck size={16} />
            <span className="absolute -top-1 -right-1 px-1 py-0.2 rounded-full bg-neutral-300 text-[8px] font-mono text-black font-bold leading-none">
              {stats.totalTeam || teamTotal}
            </span>
          </div>
          <span className="text-[9px] font-mono tracking-tight">Team</span>
        </button>

        {/* 5. Blogs */}
        <button
          onClick={() => {
            setActiveTab("blogs");
            onFetchBlogs?.();
          }}
          className={`flex flex-col items-center justify-center gap-1 py-1.5 px-2 rounded-2xl transition-all cursor-pointer relative ${activeTab === "blogs"
              ? "text-white font-bold"
              : "text-neutral-400 hover:text-white"
            }`}
        >
          <div
            className={`p-1.5 rounded-xl relative transition-all ${activeTab === "blogs"
                ? "bg-cyan-600 text-white shadow-[0_0_15px_rgba(6,182,212,0.5)]"
                : "bg-transparent"
              }`}
          >
            <BookOpen size={16} />
            <span className="absolute -top-1 -right-1 px-1 py-0.2 rounded-full bg-cyan-500 text-[8px] font-mono text-white font-bold leading-none">
              {stats.totalBlogs || blogsTotal}
            </span>
          </div>
          <span className="text-[9px] font-mono tracking-tight">Blogs</span>
        </button>

        {/* 6. Inquiries */}
        <button
          onClick={() => {
            setActiveTab("inquiries");
            onFetchInquiries?.();
          }}
          className={`flex flex-col items-center justify-center gap-1 py-1.5 px-2 rounded-2xl transition-all cursor-pointer relative ${activeTab === "inquiries"
              ? "text-white font-bold"
              : "text-neutral-400 hover:text-white"
            }`}
        >
          <div
            className={`p-1.5 rounded-xl relative transition-all ${activeTab === "inquiries"
                ? "bg-amber-500 text-black shadow-[0_0_15px_rgba(245,158,11,0.5)]"
                : "bg-transparent"
              }`}
          >
            <Mail size={16} />
            <span className="absolute -top-1 -right-1 px-1 py-0.2 rounded-full bg-amber-400 text-black text-[8px] font-mono font-bold leading-none">
              {stats.totalInquiries}
            </span>
          </div>
          <span className="text-[9px] font-mono tracking-tight">Inquiries</span>
        </button>
      </nav>
    </>
  );
};
