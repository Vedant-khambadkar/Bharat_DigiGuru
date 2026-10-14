import React from "react";
import {
  ExternalLink,
  RefreshCw,
  LogOut,
  Crown,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react";

interface AdminHeaderProps {
  currentUser: {
    id?: string;
    email?: string;
    name?: string;
    role: "managedAdmin" | "superAdmin" | "admin";
  };
  isSocketOnline: boolean;
  onReload?: () => void;
  onReloadAll?: () => void;
  onLogout: () => void;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({
  currentUser,
  isSocketOnline,
  onReload,
  onReloadAll,
  onLogout,
}) => {
  const handleReload = onReload || onReloadAll || (() => {});

  return (
    <header className="px-3.5 sm:px-8 py-2.5 sm:py-3.5 border-b border-white/10 flex items-center justify-between bg-[#0e1017]/95 backdrop-blur-xl sticky top-0 z-40">
      <div className="flex items-center gap-2 sm:gap-3.5 min-w-0">
        <a href="/" className="flex items-center gap-2.5 shrink-0 group">
          <img
            src="/Logo/BDG Extended.webp"
            alt="Bharat DigiGuru"
            className="h-6 sm:h-7.5 w-auto object-contain drop-shadow-[0_2px_12px_rgba(255,59,48,0.35)] transition-transform group-hover:scale-105"
          />
        </a>

        {/* Dynamic Role Badge */}
        {currentUser.role === "managedAdmin" && (
          <span className="text-[9px] sm:text-[10px] px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-mono font-bold tracking-wider border border-purple-500/40 shrink-0 flex items-center gap-1 shadow-[0_0_12px_rgba(168,85,247,0.3)]">
            <Crown size={11} className="text-purple-400" />
            <span>MANAGED ADMIN</span>
          </span>
        )}
        {currentUser.role === "superAdmin" && (
          <span className="text-[9px] sm:text-[10px] px-2.5 py-0.5 rounded-full bg-[#ff3b30]/20 text-red-300 font-mono font-bold tracking-wider border border-[#ff3b30]/40 shrink-0 flex items-center gap-1 shadow-[0_0_12px_rgba(255,59,48,0.3)]">
            <ShieldAlert size={11} className="text-[#ff3b30]" />
            <span>SUPER ADMIN</span>
          </span>
        )}
        {currentUser.role === "admin" && (
          <span className="text-[9px] sm:text-[10px] px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-mono font-bold tracking-wider border border-blue-500/40 shrink-0 flex items-center gap-1 shadow-[0_0_12px_rgba(59,130,246,0.3)]">
            <ShieldCheck size={11} className="text-blue-400" />
            <span>ADMIN</span>
          </span>
        )}
      </div>

      <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
        {/* View Main Site */}
        <a
          href="/"
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-1 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono text-neutral-300 hover:text-white transition-colors"
          title="View Site"
        >
          <span className="hidden md:inline">SITE</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>

        {/* Live Socket Status */}
        <div
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[10px] font-mono border ${
            isSocketOnline
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
              : "bg-amber-500/10 border-amber-500/30 text-amber-400"
          }`}
          title={isSocketOnline ? "Realtime Sync Online" : "Realtime Sync Connecting"}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              isSocketOnline
                ? "bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]"
                : "bg-amber-400"
            }`}
          />
          <span className="hidden sm:inline">
            {isSocketOnline ? "SYNC LIVE" : "OFFLINE"}
          </span>
        </div>

        {/* Refresh Data */}
        <button
          onClick={handleReload}
          className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer border border-white/10 active:scale-95"
          title="Reload Data"
        >
          <RefreshCw size={13} className="sm:w-3.5 sm:h-3.5" />
        </button>

        {/* Logout */}
        <button
          onClick={onLogout}
          className="w-7 h-7 sm:w-auto sm:px-3 py-1 sm:py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-xs font-mono transition-colors cursor-pointer flex items-center justify-center gap-1 active:scale-95"
          title="Logout"
        >
          <LogOut size={13} className="sm:w-3.5 sm:h-3.5" />
          <span className="hidden sm:inline">LOGOUT</span>
        </button>
      </div>
    </header>
  );
};
