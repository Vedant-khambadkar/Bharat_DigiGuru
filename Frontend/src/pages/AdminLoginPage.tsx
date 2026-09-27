import React, { useState, useEffect, useRef } from "react";
import {
  Mail,
  Key,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Eye,
  EyeOff,
  CheckCircle,
  Lock,
  RefreshCw,
  ShieldAlert,
} from "lucide-react";
import { adminService } from "../services/service/adminService";

type AuthViewMode =
  | "login"
  | "forgot_email"
  | "forgot_otp"
  | "enter_new_password"
  | "reset_success";

export const AdminLoginPage: React.FC = () => {
  // Login State
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Forgot Password / OTP State
  const [viewMode, setViewMode] = useState<AuthViewMode>("login");
  const [forgotEmail, setForgotEmail] = useState("");
  const [otpDigits, setOtpDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Check if already authenticated -> redirect to /admin
  useEffect(() => {
    const token = localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken");
    if (token) {
      window.location.href = "/admin";
    }
  }, []);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown((prev) => prev - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  // Handle Login Submit
  const handleLoginSubmit = async (e: React.FormEvent) => {
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
      window.location.href = "/admin";
    } catch (err: any) {
      setIsLoading(false);
      setErrorMsg(err?.response?.data?.message || err?.message || "Invalid credentials. Please verify your email and password.");
    }
  };

  // Step 1: Send OTP to Admin Email
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetEmail = forgotEmail.trim() || email.trim();
    if (!targetEmail) {
      setErrorMsg("Please enter your administrator email.");
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await adminService.forgotPassword(targetEmail);
      setForgotEmail((res as any)?.email || targetEmail);
      setSuccessMsg((res as any)?.message || "Verification code sent to your email!");
      setViewMode("forgot_otp");
      setResendCooldown(60);
      setIsLoading(false);
      setOtpDigits(["", "", "", "", "", ""]);
      setTimeout(() => otpInputRefs.current[0]?.focus(), 100);
    } catch (err: any) {
      setIsLoading(false);
      setErrorMsg(err?.response?.data?.message || "Failed to send reset code. Verify your admin email.");
    }
  };

  // Handle OTP digit changes
  const handleOtpChange = (index: number, val: string) => {
    if (!/^[0-9]?$/.test(val)) return;

    const newOtp = [...otpDigits];
    newOtp[index] = val;
    setOtpDigits(newOtp);

    // Auto-focus next input
    if (val && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData("text").trim();
    if (/^[0-9]{6}$/.test(pasteData)) {
      const digits = pasteData.split("");
      setOtpDigits(digits);
      otpInputRefs.current[5]?.focus();
    }
  };

  // Step 2: VERIFY OTP ONLY (FIRST)
  const handleVerifyOtpOnly = async (e: React.FormEvent) => {
    e.preventDefault();
    const fullOtp = otpDigits.join("");

    if (fullOtp.length !== 6) {
      setErrorMsg("Please enter the complete 6-digit verification code.");
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await adminService.verifyOtp({
        email: forgotEmail,
        otp: fullOtp,
      });

      setIsLoading(false);
      setSuccessMsg((res as any)?.message || "OTP verified! Please create your new password.");
      setViewMode("enter_new_password");
    } catch (err: any) {
      setIsLoading(false);
      setErrorMsg(err?.response?.data?.message || "Invalid or expired OTP code. Please check and try again.");
    }
  };

  // Step 3: ENTER & SAVE NEW PASSWORD (AFTER OTP IS VERIFIED)
  const handleSaveNewPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const fullOtp = otpDigits.join("");

    if (!newPassword || newPassword.length < 6) {
      setErrorMsg("New password must be at least 6 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg("New password and confirm password do not match.");
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await adminService.verifyOtpAndResetPassword({
        email: forgotEmail,
        otp: fullOtp,
        newPassword,
      });

      setIsLoading(false);
      setSuccessMsg((res as any)?.message || "Password updated successfully!");
      setViewMode("reset_success");
    } catch (err: any) {
      setIsLoading(false);
      setErrorMsg(err?.response?.data?.message || "Failed to update password. Please request a new OTP.");
    }
  };

  const handleBackToSite = () => {
    window.location.href = "/";
  };

  const resetFlowToLogin = () => {
    setViewMode("login");
    setErrorMsg(null);
    setSuccessMsg(null);
    setOtpDigits(["", "", "", "", "", ""]);
    setNewPassword("");
    setConfirmPassword("");
  };

  return (
    <div className="admin-scope min-h-screen w-full bg-[#07080c] text-white flex flex-col justify-between items-center relative overflow-hidden font-sans select-none">
      {/* Dynamic Background Effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[650px] bg-gradient-to-br from-[#ff3b30]/15 via-[#b91c1c]/10 to-transparent rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-10 right-10 w-72 h-72 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Subtle Grid Lines Overlay */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
          backgroundSize: "32px 32px",
        }}
      />

      {/* Top Navigation Bar */}
      <header className="relative z-10 w-full max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
        <button
          onClick={handleBackToSite}
          className="flex items-center gap-2 text-xs font-mono tracking-wider text-neutral-400 hover:text-white transition-colors group cursor-pointer bg-white/5 hover:bg-white/10 px-4 py-2 rounded-full border border-white/10"
        >
          <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
          <span>BACK TO MAIN WEBSITE</span>
        </button>
      </header>

      {/* Center Auth Container */}
      <main className="relative z-10 w-full max-w-md px-4 sm:px-6 my-auto">
        <div className="relative w-full bg-[#0e1017]/90 border border-white/15 rounded-3xl p-6 sm:p-10 shadow-[0_30px_90px_rgba(0,0,0,0.95),0_0_50px_rgba(255,59,48,0.12)] backdrop-blur-2xl transition-all duration-300">
          {/* Logo & Header */}
          <div className="flex flex-col items-center text-center gap-3 mb-6">
            <div className="flex items-center justify-center p-2">
              <img
                src="/Logo/BDG Extended.png"
                alt="Bharat DigiGuru Logo"
                className="h-9 sm:h-11 w-auto object-contain drop-shadow-[0_4px_16px_rgba(255,59,48,0.4)]"
              />
            </div>

            <div>
              <h1 className="font-['Syne',sans-serif] font-bold text-2xl sm:text-3xl text-white tracking-tight">
                {viewMode === "login" && "Admin Console"}
                {viewMode === "forgot_email" && "Recover Access"}
                {viewMode === "forgot_otp" && "Verify OTP Code"}
                {viewMode === "enter_new_password" && "New Password"}
                {viewMode === "reset_success" && "Password Reset"}
              </h1>
              <p className="font-mono text-xs text-neutral-400 mt-1 uppercase tracking-wider">
                {viewMode === "login" && "Bharat DigiGuru Management Portal"}
                {viewMode === "forgot_email" && "Send OTP to Admin Email"}
                {viewMode === "forgot_otp" && "Step 1: Enter 6-Digit Code"}
                {viewMode === "enter_new_password" && "Step 2: Set New Password"}
                {viewMode === "reset_success" && "Account Security Updated"}
              </p>
            </div>
          </div>

          {/* Alert Messages */}
          {errorMsg && (
            <div className="mb-5 p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center gap-2.5 text-xs text-red-300 animate-in fade-in duration-200 text-left">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-5 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-2.5 text-xs text-emerald-300 animate-in fade-in duration-200 text-left">
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* =========================================================================
              VIEW 1: REGULAR LOGIN
             ========================================================================= */}
          {viewMode === "login" && (
            <form onSubmit={handleLoginSubmit} className="flex flex-col gap-4">
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
                    className="w-full bg-[#151722] border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-[#ff3b30] focus:ring-1 focus:ring-[#ff3b30] transition-all font-sans"
                    required
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5 text-left">
                <div className="flex items-center justify-between">
                  <label className="font-mono text-[11px] text-neutral-400 uppercase tracking-wider">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setForgotEmail(email);
                      setErrorMsg(null);
                      setSuccessMsg(null);
                      setViewMode("forgot_email");
                    }}
                    className="font-mono text-[11px] text-neutral-400 hover:text-[#ff3b30] transition-colors cursor-pointer"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative flex items-center">
                  <Key className="absolute left-3.5 w-4 h-4 text-neutral-500" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full bg-[#151722] border border-white/10 rounded-xl pl-10 pr-10 py-3 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-[#ff3b30] focus:ring-1 focus:ring-[#ff3b30] transition-all font-sans"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 text-neutral-500 hover:text-neutral-300 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="mt-2 w-full py-3.5 rounded-xl bg-white hover:bg-neutral-200 text-black font-mono text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 shadow-xl hover:shadow-2xl transition-all cursor-pointer disabled:opacity-50 active:scale-[0.99]"
              >
                {isLoading ? (
                  <span>AUTHENTICATING WITH ATLAS...</span>
                ) : (
                  <>
                    <span>SIGN IN TO DASHBOARD</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* =========================================================================
              VIEW 2: FORGOT PASSWORD - REQUEST OTP
             ========================================================================= */}
          {viewMode === "forgot_email" && (
            <form onSubmit={handleSendOtp} className="flex flex-col gap-4 text-left">
              <p className="text-xs text-neutral-400 font-sans leading-relaxed">
                Enter your registered administrator email address. We will dispatch a 6-digit OTP verification code to verify your identity.
              </p>

              <div className="flex flex-col gap-1.5">
                <label className="font-mono text-[11px] text-neutral-400 uppercase tracking-wider">
                  Admin Email
                </label>
                <div className="relative flex items-center">
                  <Mail className="absolute left-3.5 w-4 h-4 text-neutral-500" />
                  <input
                    type="email"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="admin@bharatdigiguru.com"
                    className="w-full bg-[#151722] border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-[#ff3b30] focus:ring-1 focus:ring-[#ff3b30] transition-all font-sans"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="mt-2 w-full py-3.5 rounded-xl bg-[#ff3b30] hover:bg-[#b91c1c] text-white font-mono text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 shadow-xl transition-all cursor-pointer disabled:opacity-50 active:scale-[0.99]"
              >
                {isLoading ? (
                  <span>SENDING OTP CODE...</span>
                ) : (
                  <>
                    <span>SEND VERIFICATION CODE</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={resetFlowToLogin}
                className="w-full py-2.5 text-center font-mono text-xs text-neutral-400 hover:text-white transition-colors cursor-pointer"
              >
                ← Back to Sign In
              </button>
            </form>
          )}

          {/* =========================================================================
              VIEW 3: VERIFY OTP ONLY (FIRST STEP)
             ========================================================================= */}
          {viewMode === "forgot_otp" && (
            <form onSubmit={handleVerifyOtpOnly} className="flex flex-col gap-4 text-left">
              <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-xs text-purple-300 flex items-start gap-2">
                <ShieldAlert className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                <span>
                  Enter the 6-digit code sent to <strong className="text-white">{forgotEmail}</strong>. Code valid for 10 minutes.
                </span>
              </div>

              {/* 6-Digit OTP Boxes */}
              <div className="flex flex-col gap-2">
                <label className="font-mono text-[11px] text-neutral-400 uppercase tracking-wider text-center">
                  6-Digit Verification Code
                </label>
                <div className="flex items-center justify-center gap-2 sm:gap-2.5 my-1" onPaste={handleOtpPaste}>
                  {otpDigits.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={(el) => {
                        otpInputRefs.current[idx] = el;
                      }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(idx, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                      className="w-10 h-12 sm:w-11 sm:h-13 text-center bg-[#151722] border border-white/15 focus:border-[#ff3b30] focus:ring-1 focus:ring-[#ff3b30] rounded-xl text-lg sm:text-xl font-mono font-bold text-white transition-all outline-none"
                    />
                  ))}
                </div>
              </div>

              {/* Resend OTP Link */}
              <div className="flex items-center justify-between text-xs font-mono pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setErrorMsg(null);
                    setSuccessMsg(null);
                    setViewMode("forgot_email");
                  }}
                  className="text-neutral-400 hover:text-white transition-colors cursor-pointer"
                >
                  Change Email
                </button>
                {resendCooldown > 0 ? (
                  <span className="text-neutral-500">Resend in {resendCooldown}s</span>
                ) : (
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    className="text-[#ff3b30] hover:underline cursor-pointer flex items-center gap-1"
                  >
                    <RefreshCw className="w-3 h-3" /> Resend Code
                  </button>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading || otpDigits.join("").length !== 6}
                className="mt-2 w-full py-3.5 rounded-xl bg-[#ff3b30] hover:bg-[#b91c1c] text-white font-mono text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 shadow-xl transition-all cursor-pointer disabled:opacity-40 active:scale-[0.99]"
              >
                {isLoading ? (
                  <span>VERIFYING CODE...</span>
                ) : (
                  <>
                    <span>VERIFY OTP CODE</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={resetFlowToLogin}
                className="w-full py-2 text-center font-mono text-xs text-neutral-400 hover:text-white transition-colors cursor-pointer"
              >
                ← Cancel & Return to Sign In
              </button>
            </form>
          )}

          {/* =========================================================================
              VIEW 4: ENTER NEW PASSWORD (SHOWN ONLY AFTER OTP IS VERIFIED)
             ========================================================================= */}
          {viewMode === "enter_new_password" && (
            <form onSubmit={handleSaveNewPassword} className="flex flex-col gap-4 text-left">
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  OTP verified successfully! Now set your new secure administrator password.
                </span>
              </div>

              {/* New Password */}
              <div className="flex flex-col gap-1.5">
                <label className="font-mono text-[11px] text-neutral-400 uppercase tracking-wider">
                  New Admin Password
                </label>
                <div className="relative flex items-center">
                  <Lock className="absolute left-3.5 w-4 h-4 text-neutral-500" />
                  <input
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Min. 6 characters"
                    className="w-full bg-[#151722] border border-white/10 rounded-xl pl-10 pr-10 py-3 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-[#ff3b30] focus:ring-1 focus:ring-[#ff3b30] transition-all font-sans"
                    required
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 text-neutral-500 hover:text-neutral-300 transition-colors"
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="flex flex-col gap-1.5">
                <label className="font-mono text-[11px] text-neutral-400 uppercase tracking-wider">
                  Confirm New Password
                </label>
                <div className="relative flex items-center">
                  <Lock className="absolute left-3.5 w-4 h-4 text-neutral-500" />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter new password"
                    className="w-full bg-[#151722] border border-white/10 rounded-xl pl-10 pr-10 py-3 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-[#ff3b30] focus:ring-1 focus:ring-[#ff3b30] transition-all font-sans"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 text-neutral-500 hover:text-neutral-300 transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="mt-2 w-full py-3.5 rounded-xl bg-[#ff3b30] hover:bg-[#b91c1c] text-white font-mono text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 shadow-xl transition-all cursor-pointer disabled:opacity-50 active:scale-[0.99]"
              >
                {isLoading ? (
                  <span>SAVING PASSWORD...</span>
                ) : (
                  <>
                    <span>SAVE NEW PASSWORD</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={resetFlowToLogin}
                className="w-full py-2 text-center font-mono text-xs text-neutral-400 hover:text-white transition-colors cursor-pointer"
              >
                ← Cancel & Return to Sign In
              </button>
            </form>
          )}

          {/* =========================================================================
              VIEW 5: RESET SUCCESS STATE
             ========================================================================= */}
          {viewMode === "reset_success" && (
            <div className="flex flex-col items-center text-center gap-4 py-4 animate-in zoom-in-95 duration-200">
              <div className="w-16 h-16 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shadow-lg">
                <CheckCircle className="w-8 h-8" />
              </div>

              <div>
                <h2 className="font-bold text-lg text-white font-['Syne',sans-serif]">
                  Password Successfully Changed
                </h2>
                <p className="text-xs text-neutral-400 mt-1">
                  Your administrator account has been secured with the new password.
                </p>
              </div>

              <button
                type="button"
                onClick={resetFlowToLogin}
                className="mt-2 w-full py-3.5 rounded-xl bg-white hover:bg-neutral-200 text-black font-mono text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 shadow-xl transition-all cursor-pointer active:scale-[0.99]"
              >
                <span>SIGN IN WITH NEW PASSWORD</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Bottom Footer */}
      <footer className="relative z-10 py-6 text-center text-neutral-600 text-xs font-mono">
        © 2026 Bharat DigiGuru. All Rights Reserved.
      </footer>
    </div>
  );
};

export default AdminLoginPage;
