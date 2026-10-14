import React from "react";
import {
  ShieldCheck,
  ShieldAlert,
  Crown,
  RefreshCw,
  UserPlus,
  Users,
  Loader2,
  Trash2,
} from "lucide-react";

export interface AdminUserItem {
  _id?: string;
  id?: string;
  name?: string;
  email?: string;
  role?: string;
  createdBy?: string;
  createdAt?: string;
}

interface AdminsSectionProps {
  adminUsersList: AdminUserItem[];
  adminUsersLoading: boolean;
  currentUser: {
    name?: string;
    email?: string;
    role?: string;
  };
  onRefresh: () => void;
  onOpenCreateAdmin: () => void;
  onDeleteAdminUser: (userId: string, userName: string) => void;
}

export const AdminsSection: React.FC<AdminsSectionProps> = ({
  adminUsersList,
  adminUsersLoading,
  currentUser,
  onRefresh,
  onOpenCreateAdmin,
  onDeleteAdminUser,
}) => {
  return (
    <div className="flex flex-col gap-4 sm:gap-6 animate-in fade-in duration-200">
      {/* Header section with Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 bg-[#11131b]/80 backdrop-blur-md p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-white/10 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck size={12} /> Access Control & RBAC
            </span>
          </div>
          <h2 className="font-['Syne',sans-serif] font-bold text-xl sm:text-2xl text-white">
            Administrator Accounts
          </h2>
          <p className="font-mono text-xs text-neutral-400 mt-0.5">
            Register, manage, and provision credentials for portal administrators with role-based permissions.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={onRefresh}
            disabled={adminUsersLoading}
            className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-neutral-300 hover:text-white transition-colors cursor-pointer"
            title="Refresh administrator list"
          >
            <RefreshCw size={15} className={adminUsersLoading ? "animate-spin text-emerald-400" : ""} />
          </button>

          {(currentUser.role === "managedAdmin" || currentUser.role === "superAdmin") && (
            <button
              onClick={onOpenCreateAdmin}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.35)] transition-all cursor-pointer active:scale-95"
            >
              <UserPlus size={15} />
              <span>Register Admin</span>
            </button>
          )}
        </div>
      </div>

      {/* Administrators Table / List Card */}
      <div className="bg-[#11131b]/90 border border-white/10 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-2xl flex flex-col gap-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <Users size={16} className="text-emerald-400" />
            <span className="font-['Syne',sans-serif] font-bold text-sm sm:text-base text-white">
              Registered Accounts ({adminUsersList.length})
            </span>
          </div>
        </div>

        {adminUsersLoading && adminUsersList.length === 0 ? (
          <div className="py-16 flex flex-col items-center justify-center gap-3 text-neutral-400 font-mono text-xs">
            <Loader2 size={24} className="animate-spin text-emerald-400" />
            <span>Loading administrator accounts...</span>
          </div>
        ) : adminUsersList.length === 0 ? (
          <div className="py-12 text-center text-neutral-400 font-mono text-xs">
            No administrators registered yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {adminUsersList.map((user) => {
              const isMasterUser =
                user.role === "managedAdmin" &&
                (!user.createdBy || user.createdBy === "system_seed");
              const isSelf = Boolean(
                currentUser.email &&
                  user.email &&
                  user.email.toLowerCase() === currentUser.email.toLowerCase()
              );

              return (
                <div
                  key={user._id || user.id || user.email}
                  className="p-4 rounded-2xl bg-gradient-to-br from-[#161822] to-[#0f1118] border border-white/10 hover:border-emerald-500/30 transition-all flex flex-col justify-between gap-3 shadow-md"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-10 h-10 rounded-2xl flex items-center justify-center font-mono font-bold text-sm shrink-0 ${
                          user.role === "managedAdmin"
                            ? "bg-purple-600/20 text-purple-300 border border-purple-500/30"
                            : user.role === "superAdmin"
                            ? "bg-red-600/20 text-red-300 border border-red-500/30"
                            : "bg-blue-600/20 text-blue-300 border border-blue-500/30"
                        }`}
                      >
                        {user.name ? user.name.charAt(0).toUpperCase() : "A"}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-white text-sm truncate">
                            {user.name}
                          </span>
                          {isSelf && (
                            <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[9px] font-mono font-bold">
                              YOU
                            </span>
                          )}
                        </div>
                        <span className="font-mono text-xs text-neutral-400 truncate">
                          {user.email}
                        </span>
                      </div>
                    </div>

                    {/* Role Badge */}
                    <div>
                      {user.role === "managedAdmin" ? (
                        <span className="px-2.5 py-1 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-300 text-[10px] font-mono font-bold flex items-center gap-1">
                          <Crown size={11} /> Managed Admin
                        </span>
                      ) : user.role === "superAdmin" ? (
                        <span className="px-2.5 py-1 rounded-full bg-red-500/15 border border-red-500/30 text-red-300 text-[10px] font-mono font-bold flex items-center gap-1">
                          <ShieldAlert size={11} /> Super Admin
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full bg-blue-500/15 border border-blue-500/30 text-blue-300 text-[10px] font-mono font-bold flex items-center gap-1">
                          <ShieldCheck size={11} /> Admin
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Footer Details */}
                  <div className="flex items-center justify-between pt-2.5 border-t border-white/5 text-[11px] font-mono text-neutral-500">
                    <span>
                      Created:{" "}
                      {user.createdAt
                        ? new Date(user.createdAt).toLocaleDateString()
                        : "Master Seed"}
                    </span>

                    {/* Delete Action Button */}
                    {!isMasterUser && !isSelf && (
                      <button
                        onClick={() =>
                          onDeleteAdminUser(
                            user._id || user.id || "",
                            `Admin: ${user.name}`
                          )
                        }
                        className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-colors flex items-center gap-1 text-[10px] font-mono cursor-pointer"
                        title="Revoke and delete admin account"
                      >
                        <Trash2 size={12} />
                        <span>Revoke</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
