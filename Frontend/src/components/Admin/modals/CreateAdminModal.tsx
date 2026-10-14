import React from "react";
import { UserPlus, X, KeyRound, Mail, Loader2, Check } from "lucide-react";

export interface NewAdminFormState {
  name: string;
  email: string;
  role: "admin" | "superAdmin" | "managedAdmin";
  password: string;
}

interface CreateAdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: {
    role?: string;
  };
  newAdminForm: NewAdminFormState;
  setNewAdminForm: React.Dispatch<React.SetStateAction<NewAdminFormState>>;
  isRegisteringAdmin: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onGenerateRandomPassword: () => void;
}

export const CreateAdminModal: React.FC<CreateAdminModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  newAdminForm,
  setNewAdminForm,
  isRegisteringAdmin,
  onSubmit,
  onGenerateRandomPassword,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-[#11131b] border border-white/15 rounded-2xl sm:rounded-3xl p-5 sm:p-7 shadow-2xl flex flex-col gap-4 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <UserPlus size={18} />
            </div>
            <div>
              <h3 className="font-['Syne',sans-serif] font-bold text-base sm:text-lg text-white">
                Register New Administrator
              </h3>
              <p className="font-mono text-[10px] text-neutral-400">
                Assign role permissions & email secure credentials
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={onSubmit} className="flex flex-col gap-3.5">
          {/* Full Name */}
          <div>
            <label className="font-mono text-[10px] text-neutral-400 uppercase tracking-wider mb-1 block">
              Full Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              required
              value={newAdminForm.name}
              onChange={(e) =>
                setNewAdminForm({ ...newAdminForm, name: e.target.value })
              }
              placeholder="e.g. Alex Morgan"
              className="w-full bg-[#181a24] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-mono text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>

          {/* Email Address */}
          <div>
            <label className="font-mono text-[10px] text-neutral-400 uppercase tracking-wider mb-1 block">
              Registered Email Address <span className="text-red-400">*</span>
            </label>
            <input
              type="email"
              required
              value={newAdminForm.email}
              onChange={(e) =>
                setNewAdminForm({ ...newAdminForm, email: e.target.value })
              }
              placeholder="admin@example.com"
              className="w-full bg-[#181a24] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-mono text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>

          {/* Role Selection */}
          <div>
            <label className="font-mono text-[10px] text-neutral-400 uppercase tracking-wider mb-1 block">
              Assign Administrative Role <span className="text-red-400">*</span>
            </label>
            <select
              value={newAdminForm.role}
              onChange={(e) =>
                setNewAdminForm({
                  ...newAdminForm,
                  role: e.target.value as any,
                })
              }
              className="w-full bg-[#181a24] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-mono text-white focus:outline-none focus:border-emerald-500 transition-colors cursor-pointer"
            >
              <option value="admin">Admin — Portfolio & Inquiries Manager</option>
              <option value="superAdmin">
                Super Admin — Core Admin + Administrator Management
              </option>
              {currentUser.role === "managedAdmin" && (
                <option value="managedAdmin">
                  Managed Admin — Full Master Authority & 3D Showcase Access
                </option>
              )}
            </select>
            <p className="font-mono text-[10px] text-neutral-500 mt-1">
              {newAdminForm.role === "admin" &&
                "• Can view/edit Portfolio and Inquiries. Cannot see 3D Studio or manage admins."}
              {newAdminForm.role === "superAdmin" &&
                "• Can manage Portfolio, Inquiries, and register/manage Admins. Cannot see 3D Studio."}
              {newAdminForm.role === "managedAdmin" &&
                "• Full master privileges including 3D Studio Showcase and RBAC management."}
            </p>
          </div>

          {/* Password & Generator */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-mono text-[10px] text-neutral-400 uppercase tracking-wider">
                Initial Password
              </label>
              <button
                type="button"
                onClick={onGenerateRandomPassword}
                className="text-[10px] font-mono text-emerald-400 hover:text-emerald-300 flex items-center gap-1 cursor-pointer transition-colors"
              >
                <KeyRound size={11} /> Auto Generate Strong
              </button>
            </div>
            <div className="relative">
              <input
                type="text"
                value={newAdminForm.password}
                onChange={(e) =>
                  setNewAdminForm({ ...newAdminForm, password: e.target.value })
                }
                placeholder="Leave blank to auto-generate, or enter custom"
                className="w-full bg-[#181a24] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-mono text-emerald-300 placeholder-neutral-500 focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>
          </div>

          {/* Email dispatch notice */}
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-start gap-2.5 text-[11px] font-mono text-emerald-200">
            <Mail size={15} className="text-emerald-400 shrink-0 mt-0.5" />
            <span>
              <strong>Email Delivery:</strong> Credentials, role level, and portal sign-in link will be automatically dispatched to{" "}
              <strong>{newAdminForm.email || "the registered email"}</strong> formatted professionally.
            </span>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 mt-2 pt-3 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white text-xs font-mono transition-colors cursor-pointer"
            >
              CANCEL
            </button>
            <button
              type="submit"
              disabled={isRegisteringAdmin}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-mono font-bold uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] flex items-center gap-2 cursor-pointer active:scale-95"
            >
              {isRegisteringAdmin ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>CREATING & SENDING...</span>
                </>
              ) : (
                <>
                  <Check size={14} />
                  <span>CREATE & DISPATCH EMAIL</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
