import React from "react";
import {
  Eye,
  EyeOff,
  Loader2,
  Check,
  X,
  Crown,
  Users,
  Sparkles,
  Edit2,
  Trash2,
  ExternalLink,
  Plus,
  RefreshCw,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import CachedImage from "../../CachedImage";
import founderPhotoFallback from "../../../assets/Picture/Picture12.webp";

interface TeamSectionProps {
  teamItems: any[];
  teamTotal: number;
  teamPage: number;
  teamTotalPages: number;
  teamLimit: number;
  teamSearch: string;
  teamColumnFilter: string;
  teamLoading: boolean;
  setTeamSearch: (val: string) => void;
  setTeamColumnFilter: (val: string) => void;
  setTeamLimit: (val: number) => void;
  onFetchTeam: (page?: number, limit?: number, search?: string, col?: string, forceRefresh?: boolean) => void;
  founderProfile: any;
  founderLoading: boolean;
  onFetchFounder: (force?: boolean) => void;
  teamSubTab: "founder" | "members";
  setTeamSubTab: (tab: "founder" | "members") => void;
  teamSectionVisible: boolean;
  teamVisibilityLoading: boolean;
  onToggleTeamVisibility: (val: boolean) => void;
  onEditFounder: () => void;
  onOpenCreateMember: () => void;
  onOpenEditMember: (item: any) => void;
  onDeleteMember: (id: string | number, name?: string) => void;
}

export const TeamSection: React.FC<TeamSectionProps> = ({
  teamItems,
  teamTotal,
  teamPage,
  teamTotalPages,
  teamLimit,
  teamSearch,
  teamColumnFilter,
  teamLoading,
  setTeamSearch,
  setTeamColumnFilter,
  setTeamLimit,
  onFetchTeam,
  founderProfile,
  founderLoading,
  onFetchFounder,
  teamSubTab,
  setTeamSubTab,
  teamSectionVisible,
  teamVisibilityLoading,
  onToggleTeamVisibility,
  onEditFounder,
  onOpenCreateMember,
  onOpenEditMember,
  onDeleteMember,
}) => {
  return (
    <div className="flex flex-col gap-3.5 sm:gap-6 animate-in fade-in duration-200">
      {/* Client Requirement: Team & Founder Section Public Visibility Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-[#141824] via-[#11131b] to-[#141824] backdrop-blur-md p-4 sm:p-5 rounded-2xl border border-white/10 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-full bg-gradient-to-l from-white/5 to-transparent pointer-events-none" />
        <div className="flex items-start sm:items-center gap-3.5 relative z-10">
          <div
            className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border transition-all duration-300 ${
              teamSectionVisible
                ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.2)]"
                : "bg-amber-500/15 border-amber-500/30 text-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.2)]"
            }`}
          >
            {teamSectionVisible ? <Eye size={20} /> : <EyeOff size={20} />}
          </div>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="font-['Syne',sans-serif] font-bold text-sm sm:text-base text-white">
                Show Team / Founder Section on Website
              </span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider border ${
                  teamSectionVisible
                    ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-400"
                    : "bg-red-500/15 border-red-500/30 text-red-400"
                }`}
              >
                {teamSectionVisible ? "PUBLIC: VISIBLE" : "PUBLIC: HIDDEN"}
              </span>
            </div>
            <p className="font-mono text-xs text-neutral-400 max-w-xl">
              Toggle the public visibility of the entire Team &amp; Founder section (including 3D models, founder dossier, and editorial grid).
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 self-end sm:self-auto relative z-10 shrink-0">
          <button
            type="button"
            disabled={teamVisibilityLoading}
            onClick={() => onToggleTeamVisibility(!teamSectionVisible)}
            className={`relative inline-flex h-8 w-14 shrink-0 cursor-pointer rounded-full border-2 transition-colors duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#11131b] disabled:opacity-50 disabled:cursor-not-allowed ${
              teamSectionVisible
                ? "bg-emerald-500 border-emerald-400 focus:ring-emerald-500"
                : "bg-neutral-800 border-neutral-700 focus:ring-neutral-500"
            }`}
            role="switch"
            aria-checked={teamSectionVisible}
          >
            <span className="sr-only">Toggle Team Visibility</span>
            <span
              aria-hidden="true"
              className={`pointer-events-none inline-flex items-center justify-center h-7 w-7 transform rounded-full bg-white shadow-lg ring-0 transition duration-300 ease-in-out ${
                teamSectionVisible ? "translate-x-6 text-emerald-600" : "translate-x-0 text-neutral-500"
              }`}
            >
              {teamVisibilityLoading ? (
                <Loader2 size={12} className="animate-spin text-neutral-900" />
              ) : teamSectionVisible ? (
                <Check size={12} className="stroke-[3]" />
              ) : (
                <X size={12} className="stroke-[3]" />
              )}
            </span>
          </button>
          <span className="font-mono text-xs font-bold text-white w-10">
            {teamSectionVisible ? "ON" : "OFF"}
          </span>
        </div>
      </div>

      {/* Sub-tab Navigation between Founder Profile and Editorial Grid */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#11131b]/80 backdrop-blur-md p-2.5 sm:p-3 rounded-2xl border border-white/10 shadow-lg">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setTeamSubTab("founder")}
            className={`px-4 py-2 rounded-xl text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer ${
              teamSubTab === "founder"
                ? "bg-gradient-to-r from-[#ff3b30] to-[#ff5500] text-white shadow-[0_0_20px_rgba(255,59,48,0.35)]"
                : "bg-white/5 text-neutral-400 hover:text-white hover:bg-white/10"
            }`}
          >
            <Crown size={14} />
            <span>Founder Profile (Live on Site)</span>
          </button>

          <button
            type="button"
            onClick={() => setTeamSubTab("members")}
            className={`px-4 py-2 rounded-xl text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer ${
              teamSubTab === "members"
                ? "bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.35)]"
                : "bg-white/5 text-neutral-400 hover:text-white hover:bg-white/10"
            }`}
          >
            <Users size={14} />
            <span>Editorial Grid ({teamTotal})</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono text-neutral-400 hidden sm:inline">
            {teamSubTab === "founder" ? "Live Founder Dossier & Mobile Showcase" : "Editorial 5-Column Grid"}
          </span>
        </div>
      </div>

      {/* Founder Profile View */}
      {teamSubTab === "founder" && (
        <div className="flex flex-col gap-4 sm:gap-6 animate-in fade-in duration-200">
          {/* Top Bar Card */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 bg-[#11131b]/80 backdrop-blur-md p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-white/10 shadow-xl">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-full bg-[#ff3b30]/15 border border-[#ff3b30]/30 text-[#ff3b30] text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <Crown size={12} /> Active Live Profile
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-stone-300 text-[10px] font-mono uppercase tracking-wider">
                  Founder Dossier &amp; Mobile Showcase
                </span>
              </div>
              <h2 className="font-['Syne',sans-serif] font-bold text-xl sm:text-2xl text-white">
                Founder &amp; Leadership Management
              </h2>
              <p className="font-mono text-xs text-neutral-400 mt-0.5">
                Manage the founder credentials, bio, philosophy, specialties, and links displayed in the website modal and mobile showcase.
              </p>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              <button
                type="button"
                onClick={() => onFetchFounder(true)}
                disabled={founderLoading}
                className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-neutral-300 hover:text-white transition-colors cursor-pointer"
                title="Refresh founder profile from database"
              >
                <RefreshCw size={15} className={founderLoading ? "animate-spin text-[#ff3b30]" : ""} />
              </button>

              <button
                type="button"
                onClick={onEditFounder}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#ff3b30] to-[#ff5500] hover:from-[#ff3b30]/90 hover:to-[#ff5500]/90 text-white font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-[0_0_20px_rgba(255,59,48,0.35)] transition-all cursor-pointer active:scale-95"
              >
                <Edit2 size={14} />
                <span>Edit Profile</span>
              </button>
            </div>
          </div>

          {/* Founder Dossier Card */}
          <div className="bg-[#11131b]/90 border border-white/10 rounded-2xl sm:rounded-3xl p-5 sm:p-8 shadow-2xl relative overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 sm:gap-8 items-start">
              {/* Left: Founder Portrait */}
              <div className="md:col-span-5 relative rounded-2xl overflow-hidden border border-white/10 bg-black/50 aspect-[4/5] w-full max-w-sm mx-auto shadow-2xl group">
                <img
                  src={founderProfile?.image || founderPhotoFallback}
                  alt={founderProfile?.name || "Shubham Singh"}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                  style={{ objectPosition: "48% 36%" }}
                />
                <div className="absolute bottom-0 inset-x-0 h-28 bg-gradient-to-t from-black/95 via-black/40 to-transparent pointer-events-none" />

                {/* Floating Badge on Portrait */}
                <div className="absolute bottom-3 left-3 right-3 p-2.5 rounded-xl bg-black/80 backdrop-blur-md border border-white/10 flex items-center justify-between z-10 shadow-lg">
                  <div>
                    <span className="text-xs font-mono uppercase text-white font-bold tracking-wider block">
                      {founderProfile?.name || "SHUBHAM SINGH"}
                    </span>
                    <span className="text-[9px] font-mono text-neutral-400 block">
                      {founderProfile?.cityTag || "VARANASI × GLOBAL"}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-[#ff5500] uppercase tracking-widest font-bold px-2 py-0.5 rounded-md bg-[#ff5500]/15 border border-[#ff5500]/30">
                    {founderProfile?.photoTag || "FOUNDER"}
                  </span>
                </div>
              </div>

              {/* Right: Founder Editorial Dossier Content */}
              <div className="md:col-span-7 flex flex-col items-start space-y-3.5 sm:space-y-4">
                {/* Pill Badge & Subtitle */}
                <div className="flex flex-wrap items-center gap-2">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.05] border border-white/10">
                    <Sparkles className="w-3.5 h-3.5 text-[#ff3b30]" />
                    <span className="text-[10px] sm:text-xs font-mono text-white tracking-wide uppercase font-semibold">
                      {founderProfile?.badge || "MEET THE FOUNDER"}
                    </span>
                  </div>
                  <span className="text-[10px] sm:text-xs font-mono uppercase text-[#e06b3a] tracking-widest font-semibold">
                    {founderProfile?.role || "CREATIVE DIRECTOR & VISIONARY"}
                  </span>
                </div>

                {/* Header Subtitle tag */}
                <div className="text-[11px] font-mono text-neutral-400 uppercase tracking-widest">
                  {founderProfile?.subtitle || "LEADERSHIP & VISION"}
                </div>

                {/* Name */}
                <h3 className="font-['Syne',sans-serif] font-bold text-2xl sm:text-3xl text-white tracking-wide">
                  {founderProfile?.name || "SHUBHAM SINGH"}
                </h3>

                {/* Bio Paragraphs */}
                <div className="space-y-2 text-xs sm:text-sm text-stone-300 font-sans leading-relaxed">
                  <p>
                    {founderProfile?.bio ||
                      "Born in India and raised in the city of artists, Varanasi, Shubham has been capturing stories and crafting visuals for as long as he can remember."}
                  </p>
                  <p className="text-stone-400">
                    {founderProfile?.bioSecondary ||
                      "As an accomplished digital content creator and 3D visionary, he has collaborated with premier global mobile enterprises. His portfolio encompasses high-end commercial CGI, street photography stills, cinematic short films, and high-impact music videos."}
                  </p>
                </div>

                {/* Credo / Quote Card */}
                <div className="p-3.5 rounded-xl bg-white/[0.04] border border-white/10 w-full">
                  <p className="text-xs italic text-stone-300 m-0 leading-relaxed font-sans">
                    {founderProfile?.quote ||
                      '"His unique style, artistic training, and profound appreciation for light and architecture make every frame an unforgettable visual journey."'}
                  </p>
                </div>

                {/* Specialties Tags */}
                <div className="flex flex-wrap gap-2 pt-1">
                  {(
                    founderProfile?.specialties || [
                      "3D CGI & ArchViz",
                      "Commercial Stills",
                      "Cinematic Direction",
                      "Creative Strategy",
                    ]
                  ).map((tag: string) => (
                    <span
                      key={tag}
                      className="px-2.5 py-1 rounded-md bg-white/[0.06] border border-white/10 text-[10px] font-mono uppercase tracking-wider text-stone-300"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Social Links */}
                <div className="flex items-center gap-3 pt-2">
                  {founderProfile?.linkedinUrl && (
                    <a
                      href={founderProfile.linkedinUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-white font-mono text-[10px] tracking-widest uppercase bg-white/5 hover:bg-[#ff3b30]/15 border border-white/10 hover:border-[#ff3b30]/30 transition-all cursor-pointer"
                    >
                      <span>LinkedIn</span>
                      <ExternalLink size={11} />
                    </a>
                  )}
                  {founderProfile?.instagramUrl && (
                    <a
                      href={founderProfile.instagramUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-white font-mono text-[10px] tracking-widest uppercase bg-white/5 hover:bg-[#ff3b30]/15 border border-white/10 hover:border-[#ff3b30]/30 transition-all cursor-pointer"
                    >
                      <span>Instagram</span>
                      <ExternalLink size={11} />
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Editorial Grid View */}
      {teamSubTab === "members" && (
        <div className="flex flex-col gap-3.5 sm:gap-6 animate-in fade-in duration-200">
          {/* Top Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 bg-[#11131b]/80 backdrop-blur-md p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-white/10 shadow-xl">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-full bg-white/10 border border-white/20 text-white text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <Users size={12} /> Editorial Grid Layout
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-neutral-800 text-neutral-300 text-[10px] font-mono uppercase tracking-wider">
                  5-Columns Architecture
                </span>
              </div>
              <h2 className="font-['Syne',sans-serif] font-bold text-xl sm:text-2xl text-white">
                Team Members ({teamTotal})
              </h2>
              <p className="font-mono text-xs text-neutral-400 mt-0.5">
                Manage the team member cards mapped across 5 infinite marquee columns on the public website.
              </p>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              <button
                onClick={() => onFetchTeam(teamPage, teamLimit, teamSearch, teamColumnFilter, true)}
                disabled={teamLoading}
                className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-neutral-300 hover:text-white transition-colors cursor-pointer"
                title="Refresh team members"
              >
                <RefreshCw size={15} className={teamLoading ? "animate-spin text-white" : ""} />
              </button>

              <button
                onClick={onOpenCreateMember}
                className="px-4 py-2.5 rounded-xl bg-white hover:bg-neutral-200 text-black font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-[0_0_20px_rgba(255,255,255,0.35)] transition-all cursor-pointer active:scale-95"
              >
                <Plus size={15} />
                <span>Add Member</span>
              </button>
            </div>
          </div>

          {/* Search & Column Filter Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 p-3 sm:p-4 rounded-2xl bg-[#12141c] border border-white/10 shadow-xl">
            <div className="relative flex-1">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                value={teamSearch}
                onChange={(e) => {
                  setTeamSearch(e.target.value);
                  onFetchTeam(1, teamLimit, e.target.value, teamColumnFilter);
                }}
                placeholder="Search team members by name or role..."
                className="w-full bg-[#181a24] border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs font-mono text-white placeholder:text-neutral-500 focus:outline-none focus:border-white transition-colors"
              />
            </div>

            <div className="grid grid-cols-2 sm:flex items-center gap-2">
              <div className="flex items-center gap-1 bg-[#181a24] border border-white/10 rounded-xl px-2.5 py-1.5 min-w-0">
                <Filter size={13} className="text-neutral-400 shrink-0" />
                <select
                  value={teamColumnFilter}
                  onChange={(e) => {
                    setTeamColumnFilter(e.target.value);
                    onFetchTeam(1, teamLimit, teamSearch, e.target.value);
                  }}
                  className="w-full bg-transparent text-xs font-mono text-neutral-300 focus:outline-none cursor-pointer truncate"
                >
                  <option value="ALL" className="bg-[#181a24]">All Columns</option>
                  <option value="1" className="bg-[#181a24]">Column 1 (Col 1)</option>
                  <option value="2" className="bg-[#181a24]">Column 2 (Col 2)</option>
                  <option value="3" className="bg-[#181a24]">Column 3 (Col 3)</option>
                  <option value="4" className="bg-[#181a24]">Column 4 (Col 4)</option>
                  <option value="5" className="bg-[#181a24]">Column 5 (Col 5)</option>
                </select>
              </div>

              <div className="flex items-center justify-between gap-1 bg-[#181a24] border border-white/10 rounded-xl px-2.5 py-1.5 text-xs font-mono text-neutral-400">
                <span>Page:</span>
                <select
                  value={teamLimit}
                  onChange={(e) => {
                    const newLim = Number(e.target.value);
                    setTeamLimit(newLim);
                    onFetchTeam(1, newLim, teamSearch, teamColumnFilter);
                  }}
                  className="bg-transparent text-xs font-mono text-white focus:outline-none cursor-pointer"
                >
                  <option value="5" className="bg-[#181a24]">5</option>
                  <option value="10" className="bg-[#181a24]">10</option>
                  <option value="20" className="bg-[#181a24]">20</option>
                </select>
              </div>
            </div>
          </div>

          {/* Members Cards Grid */}
          {teamLoading && teamItems.length === 0 ? (
            <div className="py-16 text-center text-neutral-500 font-mono text-xs flex flex-col items-center gap-2">
              <RefreshCw className="w-5 h-5 animate-spin text-white" />
              <span>Loading team members...</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
              {teamItems.map((m) => (
                <div
                  key={m.id || m._id}
                  className="p-3.5 rounded-2xl bg-gradient-to-br from-[#13151f] to-[#0d0e15] border border-white/10 hover:border-white/20 flex flex-col justify-between gap-3 transition-all group shadow-md"
                >
                  <div className="flex flex-col gap-2">
                    <div className="w-full aspect-[4/5] rounded-xl overflow-hidden bg-black/40 relative border border-white/10">
                      <CachedImage
                        src={m.image}
                        alt={m.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/75 backdrop-blur-md text-[10px] font-mono text-white border border-white/10">
                        Col {m.column || 1}
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px] text-neutral-400 uppercase">
                        Order #{m.order ?? 0}
                      </span>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => onOpenEditMember(m)}
                          className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white transition-colors cursor-pointer active:scale-95"
                          title="Edit Member"
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          onClick={() => onDeleteMember(m.id || m._id, m.name)}
                          className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors cursor-pointer active:scale-95"
                          title="Delete Member"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>

                    <h4 className="font-['Syne',sans-serif] font-bold text-sm text-white truncate">
                      {m.name}
                    </h4>
                    <p className="font-mono text-xs text-neutral-400 truncate">{m.role}</p>
                  </div>
                </div>
              ))}

              {teamItems.length === 0 && (
                <div className="col-span-full py-16 text-center text-xs font-mono text-neutral-500">
                  No team members match your filters. Click "Add Member" to create one.
                </div>
              )}
            </div>
          )}

          {/* Pagination Footer */}
          <div className="p-3 sm:p-4 rounded-2xl bg-[#12141c] border border-white/10 flex items-center justify-between gap-2 text-xs font-mono shadow-xl">
            <span className="text-neutral-400 text-xs">
              Page <span className="text-white font-bold">{teamPage}</span> /{" "}
              <span className="text-white font-bold">{teamTotalPages}</span>
            </span>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => onFetchTeam(teamPage - 1, teamLimit, teamSearch, teamColumnFilter)}
                disabled={teamPage <= 1 || teamLoading}
                className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 disabled:opacity-30 text-white flex items-center gap-1 cursor-pointer active:scale-95"
              >
                <ChevronLeft size={13} />
                <span className="hidden sm:inline">PREV</span>
              </button>

              <div className="flex items-center gap-1">
                {Array.from({ length: teamTotalPages }, (_, i) => i + 1).map((num) => (
                  <button
                    key={num}
                    onClick={() => onFetchTeam(num, teamLimit, teamSearch, teamColumnFilter)}
                    className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl font-mono text-xs transition-all cursor-pointer ${
                      teamPage === num
                        ? "bg-white text-black font-bold shadow-[0_0_10px_rgba(255,255,255,0.4)]"
                        : "bg-white/5 text-neutral-400 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>

              <button
                onClick={() => onFetchTeam(teamPage + 1, teamLimit, teamSearch, teamColumnFilter)}
                disabled={teamPage >= teamTotalPages || teamLoading}
                className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 disabled:opacity-30 text-white flex items-center gap-1 cursor-pointer active:scale-95"
              >
                <span className="hidden sm:inline">NEXT</span>
                <ChevronRight size={13} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
