import React, { useState } from "react";
import { UserCheck, Copy, CheckCheck } from "lucide-react";

export interface CreatedCredentialData {
  name: string;
  email: string;
  role: string;
  password: string;
}

interface AdminCredentialsModalProps {
  credentials: CreatedCredentialData | null;
  onClose: () => void;
}

export const AdminCredentialsModal: React.FC<AdminCredentialsModalProps> = ({
  credentials,
  onClose,
}) => {
  const [hasCopiedPassword, setHasCopiedPassword] = useState(false);

  if (!credentials) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-[#11131b] border border-emerald-500/40 rounded-2xl sm:rounded-3xl p-5 sm:p-7 shadow-[0_0_50px_rgba(16,185,129,0.2)] flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
            <UserCheck size={24} />
          </div>
          <div>
            <h3 className="font-['Syne',sans-serif] font-bold text-lg text-white">
              Admin Registered!
            </h3>
            <p className="font-mono text-xs text-emerald-400">
              Credentials successfully dispatched via Email
            </p>
          </div>
        </div>

        {/* Credentials details card */}
        <div className="bg-[#181a24] border border-white/10 rounded-2xl p-4 flex flex-col gap-3 font-mono text-xs">
          <div className="flex flex-col">
            <span className="text-[10px] text-neutral-400 uppercase">
              Administrator Name
            </span>
            <span className="text-white font-semibold">{credentials.name}</span>
          </div>

          <div className="flex flex-col">
            <span className="text-[10px] text-neutral-400 uppercase">
              Registered Email
            </span>
            <span className="text-white font-semibold">{credentials.email}</span>
          </div>

          <div className="flex flex-col">
            <span className="text-[10px] text-neutral-400 uppercase">
              Assigned Role
            </span>
            <span className="text-emerald-400 font-bold capitalize">
              {credentials.role}
            </span>
          </div>

          <div className="flex flex-col pt-1 border-t border-white/10">
            <span className="text-[10px] text-neutral-400 uppercase">
              Temporary Password
            </span>
            <div className="flex items-center justify-between bg-black/40 border border-emerald-500/30 rounded-xl px-3 py-2 mt-1">
              <span className="text-emerald-300 font-bold tracking-wider">
                {credentials.password}
              </span>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(credentials.password);
                  setHasCopiedPassword(true);
                  setTimeout(() => setHasCopiedPassword(false), 2000);
                }}
                className="text-neutral-400 hover:text-white p-1 rounded transition-colors cursor-pointer"
                title="Copy Password"
              >
                {hasCopiedPassword ? (
                  <CheckCheck size={14} className="text-emerald-400" />
                ) : (
                  <Copy size={14} />
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={() => {
              const payload = `Bharat DigiGuru Admin Credentials:\nPortal: ${window.location.origin}/admin-portal\nEmail: ${credentials.email}\nPassword: ${credentials.password}\nRole: ${credentials.role}`;
              navigator.clipboard.writeText(payload);
              setHasCopiedPassword(true);
              setTimeout(() => setHasCopiedPassword(false), 2000);
            }}
            className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white text-xs font-mono flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Copy size={13} />
            <span>{hasCopiedPassword ? "COPIED ALL!" : "COPY ALL"}</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-mono font-bold uppercase tracking-wider shadow-lg transition-all cursor-pointer active:scale-95"
          >
            DONE
          </button>
        </div>
      </div>
    </div>
  );
};
