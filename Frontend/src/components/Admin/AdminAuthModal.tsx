import React, { useState } from "react";
import { Lock, Mail, Key, X, AlertCircle, ArrowRight } from "lucide-react";
import { adminService } from "../../services/service/adminService";

interface AdminAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: () => void;
}

export const AdminAuthModal: React.FC<AdminAuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
}) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg("Please enter both email and password.");
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    try {
      const res = await adminService.login({ email, password });
      const token = (res as any)?.token || (res as any)?.accessToken;
      if (!token) {
        throw new Error("Authentication failed: No access token received.");
      }
      localStorage.setItem("accessToken", token);
      sessionStorage.setItem("accessToken", token);
      setIsLoading(false);
      onLoginSuccess();
    } catch (err: any) {
      setIsLoading(false);
      setErrorMsg(err?.response?.data?.message || err?.message || "Invalid credentials. Please verify and try again.");
    }
  };

  return (
    <div className="admin-scope fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-in fade-in duration-300">
      <div className="relative w-full max-w-md bg-[#0e0f14] border border-white/15 rounded-3xl p-6 sm:p-8 shadow-[0_25px_60px_rgba(0,0,0,0.95),0_0_40px_rgba(255,59,48,0.15)] overflow-hidden">
        {/* Ambient Corner Glow */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#ff3b30]/20 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
        >
          <X size={16} />
        </button>

        {/* Modal Header */}
        <div className="flex flex-col items-center text-center gap-2 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#ff3b30] to-[#b91c1c] p-0.5 shadow-[0_0_20px_rgba(255,59,48,0.5)] flex items-center justify-center">
            <div className="w-full h-full bg-[#0e0f14] rounded-[14px] flex items-center justify-center">
              <Lock className="w-5 h-5 text-[#ff3b30]" />
            </div>
          </div>

          <h3 className="font-['Syne',sans-serif] font-bold text-xl text-white tracking-tight">
            Admin Portal Access
          </h3>
          <p className="font-mono text-xs text-neutral-400">
            SECURE MANAGEMENT & REAL-TIME CRUD
          </p>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center gap-2.5 text-xs text-red-300">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5 text-left">
            <label className="font-mono text-[11px] text-neutral-400 uppercase tracking-wider">
              Admin Email / Username
            </label>
            <div className="relative flex items-center">
              <Mail className="absolute left-3.5 w-4 h-4 text-neutral-500" />
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@bharatdigiguru.com"
                className="w-full bg-[#151720] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-[#ff3b30] focus:ring-1 focus:ring-[#ff3b30] transition-all font-sans"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5 text-left">
            <label className="font-mono text-[11px] text-neutral-400 uppercase tracking-wider">
              Password
            </label>
            <div className="relative flex items-center">
              <Key className="absolute left-3.5 w-4 h-4 text-neutral-500" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-[#151720] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-[#ff3b30] focus:ring-1 focus:ring-[#ff3b30] transition-all font-sans"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="mt-2 w-full py-3 rounded-xl bg-white hover:bg-neutral-200 text-black font-mono text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer disabled:opacity-50"
          >
            {isLoading ? (
              <span>AUTHENTICATING...</span>
            ) : (
              <>
                <span>ENTER PORTAL</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Footer Security Badge */}
        
      </div>
    </div>
  );
};

export default AdminAuthModal;
