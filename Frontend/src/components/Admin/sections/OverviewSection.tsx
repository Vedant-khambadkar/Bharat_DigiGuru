import React from "react";
import {
  Briefcase,
  Layers,
  UserCheck,
  BookOpen,
  Mail,
  Film,
  Users,
  Eye,
} from "lucide-react";
import { type TabType } from "../layout/AdminSidebar";

interface OverviewSectionProps {
  stats: {
    totalPortfolio: number;
    totalServices: number;
    totalTeam: number;
    totalBlogs: number;
    totalThreeD: number;
    totalInquiries: number;
    newInquiries: number;
  };
  currentUser: {
    role: "managedAdmin" | "superAdmin" | "admin";
  };
  adminUsersList: any[];
  inquiriesList: any[];
  teamTotal: number;
  blogsTotal: number;
  onNavigateTab: (tab: TabType) => void;
  onViewInquiry: (inquiry: any) => void;
  onUpdateInquiryStatus: (id: string, status: "NEW" | "CONTACTED" | "ARCHIVED") => void;
}

export const OverviewSection: React.FC<OverviewSectionProps> = ({
  stats,
  currentUser,
  adminUsersList,
  inquiriesList,
  teamTotal,
  blogsTotal,
  onNavigateTab,
  onViewInquiry,
  onUpdateInquiryStatus,
}) => {
  return (
    <div className="flex flex-col gap-4 sm:gap-6 animate-in fade-in duration-200">
      {/* Stat KPI Cards - Sleek modern glassmorphic cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4">
        {/* 1. Portfolio Card */}
        <div
          onClick={() => onNavigateTab("portfolio")}
          className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-[#12141c] to-[#0c0d14] border border-blue-500/25 hover:border-blue-500/60 flex items-center justify-between transition-all cursor-pointer group active:scale-[0.98] shadow-lg"
        >
          <div className="flex flex-col gap-1">
            <span className="text-blue-400 font-mono text-xs font-bold uppercase tracking-wider">
              Portfolio
            </span>
            <div className="font-['Syne',sans-serif] font-bold text-2xl sm:text-3xl text-white">
              {stats.totalPortfolio}
            </div>
            <span className="text-neutral-400 text-[10px] font-mono">
              Projects →
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 group-hover:scale-110 group-hover:bg-blue-500/20 transition-all">
            <Briefcase size={20} />
          </div>
        </div>

        {/* 2. Services Card */}
        <div
          onClick={() => onNavigateTab("services")}
          className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-[#12141c] to-[#0c0d14] border border-[#ff3b30]/30 hover:border-[#ff3b30]/70 flex items-center justify-between transition-all cursor-pointer group active:scale-[0.98] shadow-lg"
        >
          <div className="flex flex-col gap-1">
            <span className="text-[#ff3b30] font-mono text-xs font-bold uppercase tracking-wider">
              Services
            </span>
            <div className="font-['Syne',sans-serif] font-bold text-2xl sm:text-3xl text-white">
              {stats.totalServices}
            </div>
            <span className="text-neutral-400 text-[10px] font-mono">
              Capabilities →
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#ff3b30]/10 border border-[#ff3b30]/20 flex items-center justify-center text-[#ff3b30] group-hover:scale-110 group-hover:bg-[#ff3b30]/20 transition-all">
            <Layers size={20} />
          </div>
        </div>

        {/* 3. Team Card */}
        <div
          onClick={() => onNavigateTab("team")}
          className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-[#12141c] to-[#0c0d14] border border-white/20 hover:border-white/50 flex items-center justify-between transition-all cursor-pointer group active:scale-[0.98] shadow-lg"
        >
          <div className="flex flex-col gap-1">
            <span className="text-white font-mono text-xs font-bold uppercase tracking-wider">
              Team Members
            </span>
            <div className="font-['Syne',sans-serif] font-bold text-2xl sm:text-3xl text-white">
              {stats.totalTeam || teamTotal}
            </div>
            <span className="text-neutral-400 text-[10px] font-mono">
              5 Columns Grid →
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-white group-hover:scale-110 group-hover:bg-white/20 transition-all">
            <UserCheck size={20} />
          </div>
        </div>

        {/* 4. Blogs & Articles Card */}
        <div
          onClick={() => onNavigateTab("blogs")}
          className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-[#12141c] to-[#0c0d14] border border-cyan-500/25 hover:border-cyan-500/60 flex items-center justify-between transition-all cursor-pointer group active:scale-[0.98] shadow-lg"
        >
          <div className="flex flex-col gap-1">
            <span className="text-cyan-400 font-mono text-xs font-bold uppercase tracking-wider">
              Blogs & Articles
            </span>
            <div className="font-['Syne',sans-serif] font-bold text-2xl sm:text-3xl text-white">
              {stats.totalBlogs || blogsTotal}
            </div>
            <span className="text-neutral-400 text-[10px] font-mono">
              Editorials →
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 group-hover:scale-110 group-hover:bg-cyan-500/20 transition-all">
            <BookOpen size={20} />
          </div>
        </div>

        {/* 5. Inquiries Card */}
        <div
          onClick={() => onNavigateTab("inquiries")}
          className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-[#12141c] to-[#0c0d14] border border-amber-500/25 hover:border-amber-500/60 flex items-center justify-between transition-all cursor-pointer group active:scale-[0.98] shadow-lg"
        >
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1.5">
              <span className="text-amber-400 font-mono text-xs font-bold uppercase tracking-wider">
                Client Leads
              </span>
              {stats.newInquiries > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-amber-400/20 border border-amber-400/40 text-amber-300 text-[8px] font-mono font-bold">
                  {stats.newInquiries} NEW
                </span>
              )}
            </div>
            <div className="font-['Syne',sans-serif] font-bold text-2xl sm:text-3xl text-white">
              {stats.totalInquiries}
            </div>
            <span className="text-neutral-400 text-[10px] font-mono">
              Inbound leads →
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 group-hover:scale-110 group-hover:bg-amber-500/20 transition-all">
            <Mail size={20} />
          </div>
        </div>

        {/* 6. 3D Studio or Admins Card */}
        {currentUser.role === "managedAdmin" ? (
          <div
            onClick={() => onNavigateTab("threed")}
            className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-[#12141c] to-[#0c0d14] border border-purple-500/25 hover:border-purple-500/60 flex items-center justify-between transition-all cursor-pointer group active:scale-[0.98] shadow-lg"
          >
            <div className="flex flex-col gap-1">
              <span className="text-purple-400 font-mono text-xs font-bold uppercase tracking-wider">
                3D Showcases
              </span>
              <div className="font-['Syne',sans-serif] font-bold text-2xl sm:text-3xl text-white">
                {stats.totalThreeD}
              </div>
              <span className="text-neutral-400 text-[10px] font-mono">
                CGI Reels →
              </span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 group-hover:scale-110 group-hover:bg-purple-500/20 transition-all">
              <Film size={20} />
            </div>
          </div>
        ) : (
          <div
            onClick={() => onNavigateTab("admins")}
            className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-[#12141c] to-[#0c0d14] border border-emerald-500/25 hover:border-emerald-500/60 flex items-center justify-between transition-all cursor-pointer group active:scale-[0.98] shadow-lg"
          >
            <div className="flex flex-col gap-1">
              <span className="text-emerald-400 font-mono text-xs font-bold uppercase tracking-wider">
                Admins
              </span>
              <div className="font-['Syne',sans-serif] font-bold text-2xl sm:text-3xl text-white">
                {adminUsersList.length || 1}
              </div>
              <span className="text-neutral-400 text-[10px] font-mono">
                Active Admins →
              </span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-110 group-hover:bg-emerald-500/20 transition-all">
              <Users size={20} />
            </div>
          </div>
        )}
      </div>

      {/* Recent Inquiries Quick Feed */}
      <div className="p-3.5 sm:p-6 rounded-2xl bg-[#12141c] border border-white/10 flex flex-col gap-3 sm:gap-4 shadow-xl">
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <h3 className="font-['Syne',sans-serif] font-bold text-sm sm:text-lg text-white truncate">
                Inquiries Feed
              </h3>
            </div>
            <p className="font-mono text-[10px] sm:text-xs text-neutral-400 truncate">
              Recent submissions from website contact form
            </p>
          </div>
          <button
            onClick={() => onNavigateTab("inquiries")}
            className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono text-[#ff3b30] hover:text-white cursor-pointer shrink-0 font-bold transition-colors active:scale-95"
          >
            View All →
          </button>
        </div>

        <div className="flex flex-col gap-2">
          {inquiriesList.slice(0, 5).map((inq) => (
            <div
              key={inq.id || inq._id}
              className="p-3 sm:p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/15 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 transition-colors"
            >
              <div className="flex flex-col gap-1 min-w-0">
                <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                  <span className="font-semibold text-xs sm:text-sm text-white truncate">
                    {inq.name || inq.fullName}
                  </span>
                  <span className="font-mono text-[11px] sm:text-xs text-neutral-400 truncate">
                    ({inq.email})
                  </span>
                  <span
                    className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold uppercase ${
                      inq.status === "NEW"
                        ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                        : inq.status === "CONTACTED"
                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                        : "bg-neutral-500/20 text-neutral-400"
                    }`}
                  >
                    {inq.status}
                  </span>
                </div>
                <p className="text-xs text-neutral-300 line-clamp-1">"{inq.message}"</p>
              </div>

              <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                <button
                  onClick={() => onViewInquiry(inq)}
                  className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-300 text-xs font-mono flex items-center gap-1 cursor-pointer active:scale-95"
                >
                  <Eye size={12} />
                  <span>DETAILS</span>
                </button>
                {inq.status === "NEW" && (
                  <button
                    onClick={() => onUpdateInquiryStatus(inq.id || inq._id, "CONTACTED")}
                    className="px-2.5 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-xs font-mono transition-colors cursor-pointer active:scale-95"
                  >
                    CONTACTED
                  </button>
                )}
              </div>
            </div>
          ))}

          {inquiriesList.length === 0 && (
            <div className="py-8 text-center text-xs font-mono text-neutral-500">
              No client inquiries recorded yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
