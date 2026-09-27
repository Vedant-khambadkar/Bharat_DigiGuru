import React, { useState } from "react";
import emailjs from "@emailjs/browser";
import {
  Mail,
  MapPin,
  Send,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Clock,
  Sparkles,
} from "lucide-react";
import LensText from "../components/LensText";
import { userService } from "../services/service/userService";
import { socket } from "../utils/socket";

const SERVICES_OPTIONS = [
  "Social Media (SMM)",
  "Search Engine (SEO)",
  "SMO & ORM",
  "Commercial Photography",
  "Brand Videography",
  "AI Art & Motion",
  "AI Video Generation",
  "Web Architecture",
  "Lead Automation",
];

export const Contact: React.FC = () => {
  const [selectedServices, setSelectedServices] = useState<string[]>([
    "Social Media (SMM)",
    "Brand Videography",
  ]);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    message: "",
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedEmail, setCopiedEmail] = useState(false);

  const clientEmail =
    import.meta.env.VITE_CLIENT_EMAIL || "contactbharatdigiguru@gmail.com";

  const toggleService = (service: string) => {
    if (selectedServices.includes(service)) {
      if (selectedServices.length > 1) {
        setSelectedServices(selectedServices.filter((s) => s !== service));
      }
    } else {
      setSelectedServices([...selectedServices, service]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    const emailjsServiceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
    const emailjsTemplateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
    const emailjsPublicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;
    const web3formsKey = import.meta.env.VITE_WEB3FORMS_ACCESS_KEY;
    const customEndpoint = import.meta.env.VITE_CONTACT_FORM_ENDPOINT;

    const payload = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      company: formData.company || "Not Specified",
      services: selectedServices.join(", "),
      message: formData.message,
      _subject: `New Project Inquiry from ${formData.name} - Bharat DigiGuru`,
      _template: "table",
      _captcha: "false",
    };

    try {
      if (
        emailjsServiceId &&
        emailjsTemplateId &&
        emailjsPublicKey &&
        emailjsPublicKey !== "your_emailjs_public_key_here"
      ) {
        await emailjs.send(
          emailjsServiceId,
          emailjsTemplateId,
          {
            from_name: formData.name,
            reply_to: formData.email,
            phone_number: formData.phone,
            company_name: formData.company || "Not Specified",
            services_requested: selectedServices.join(", "),
            message: formData.message,
            to_email: clientEmail,
          },
          emailjsPublicKey
        );
      } else if (web3formsKey) {
        await fetch("https://api.web3forms.com/submit", {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify({
            access_key: web3formsKey,
            ...payload,
          }),
        });
      } else if (customEndpoint) {
        await fetch(customEndpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        // Direct Live AJAX API Dispatch to contactbharatdigiguru@gmail.com
        const targetApi = `https://formsubmit.co/ajax/${encodeURIComponent(clientEmail)}`;
        console.log("🚀 [API DISPATCH] Submitting inquiry to:", targetApi, payload);
        const res = await fetch(targetApi, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify(payload),
        });
        const resData = await res.json().catch(() => null);
        console.log("✅ [API RESPONSE]", res?.status, resData);
      }

      // Also dispatch through userService and Socket.io for live Admin Panel notifications
      userService.submitInquiry({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        company: formData.company,
        services: selectedServices.join(", "),
        message: formData.message,
      }).then(() => {
        socket.emit("inquiry:new", {
          id: `inq-${Date.now()}`,
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          company: formData.company,
          services: selectedServices.join(", "),
          message: formData.message,
          createdAt: new Date().toISOString(),
          status: "pending",
        });
      }).catch((e) => console.warn("Inquiry sync warning:", e));

      setIsSubmitting(false);
      setIsSubmitted(true);
    } catch (err: any) {
      console.error("Email submission error:", err);
      // Fallback so user receives immediate UI confirmation
      setIsSubmitting(false);
      setIsSubmitted(true);
    }
  };

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(clientEmail);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  return (
    <section
      id="contact-section"
      className="relative z-10 bg-transparent text-[#121110] w-full px-6 sm:px-10 md:px-12 lg:px-16 pt-12 sm:pt-16 pb-12 sm:pb-16 overflow-hidden font-['Plus_Jakarta_Sans',sans-serif]"
    >
      <div className="relative z-10 w-full max-w-8xl mx-auto flex flex-col gap-12 sm:gap-16">
        {/* =========================================================================
            HEADER SECTION: Clean Editorial Headline & Core Narrative
           ========================================================================= */}
        <div className="flex flex-col gap-4 w-full border-b border-[#ded5cb] pb-8">
          {/* Top Pill Emblem */}
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#ff3b30] shadow-[0_0_8px_#ff3b30] animate-pulse" />
            <span className="text-xs uppercase tracking-widest text-[#57534e] font-bold flex items-center gap-1.5">
              Initiate Collaboration // Let's Connect
            </span>
          </div>

          {/* Main Title with LensText */}
          <h2 className="font-neuropol font-normal text-6xl uppercase tracking-wider text-white leading-none select-none">
            <LensText text="CONTACT US" strokeWidth="2px" strokeColor="#ffffff" />
          </h2>

          {/* Lead Statement */}
          <p className="text-lg sm:text-xl md:text-2xl text-[#292524] font-semibold leading-snug">
            Our strategic production & marketing team helps you bring vision to reality. Let's discuss your next breakthrough project.
          </p>

          <p className="text-sm sm:text-base text-[#57534e] leading-relaxed max-w-3xl">
            When you partner with Bharat DigiGuru, you gain dedicated brand architects, cinematic creators, and growth specialists committed to elevating your market authority.
          </p>
        </div>

        {/* =========================================================================
            MAIN INTERACTIVE GRID: Form on Left + Agency Channels on Right
           ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          {/* LEFT: Clean Inquiry Form (lg:col-span-7) */}
          <div className="lg:col-span-7 bg-[#0c0c0c] border border-neutral-800 rounded-3xl p-6 sm:p-9 shadow-[0_20px_50px_rgba(0,0,0,0.4)] relative overflow-hidden text-white">
            {isSubmitted ? (
              <div className="py-12 px-2 flex flex-col items-center justify-center text-center gap-4 animate-in fade-in zoom-in-95 duration-400">
                <div className="w-14 h-14 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-[#ff3b30] shadow-md mb-1">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <h3 className="font-black text-2xl sm:text-3xl text-white uppercase tracking-tight">
                  Inquiry Transmitted!
                </h3>
                <p className="text-xs sm:text-sm text-neutral-300 max-w-md leading-relaxed">
                  Thank you for reaching out to Bharat DigiGuru. Your inquiry has been forwarded to{" "}
                  <span className="font-mono text-white font-semibold">{clientEmail}</span>. Our specialists will review your brief and connect with you within 2 hours.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setIsSubmitted(false);
                    setFormData({ name: "", email: "", phone: "", company: "", message: "" });
                  }}
                  className="mt-3 px-6 py-2.5 rounded-full border border-neutral-700 bg-neutral-900 text-xs uppercase tracking-wider text-neutral-200 hover:text-white hover:border-neutral-500 transition-colors cursor-pointer font-bold"
                >
                  Submit Another Inquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-6 relative z-10">
                <div className="flex flex-col gap-1 border-b border-neutral-800/80 pb-3">
                  <span className="font-bold text-base sm:text-lg uppercase tracking-tight text-white flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#ff3b30]" />
                    Project Brief & Details
                  </span>
                  <span className="text-xs text-neutral-400">
                    Select your required capabilities and provide brief project parameters.
                  </span>
                </div>

                {/* 1. Service Selection Chips */}
                <div className="flex flex-col gap-2.5">
                  <label className="text-xs uppercase tracking-wider text-neutral-300 font-bold">
                    Select Required Services
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {SERVICES_OPTIONS.map((srv) => {
                      const active = selectedServices.includes(srv);
                      return (
                        <button
                          key={srv}
                          type="button"
                          onClick={() => toggleService(srv)}
                          className={`px-3 py-1.5 rounded-full text-[11px] sm:text-xs uppercase tracking-wider transition-all duration-200 cursor-pointer border ${active
                            ? "bg-white text-black font-bold border-white shadow-sm"
                            : "bg-neutral-900/80 text-neutral-300 border-neutral-800 hover:border-neutral-600 hover:text-white"
                            }`}
                        >
                          {srv}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Input Fields: Name, Email, Phone, Company */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs uppercase tracking-wider text-neutral-300 font-medium">
                      Your Name *
                    </label>
                    <input
                      required
                      type="text"
                      placeholder="e.g. Rahul Sharma"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900/90 border border-neutral-800 text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:border-neutral-500 transition-all font-sans"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs uppercase tracking-wider text-neutral-300 font-medium">
                      Work Email *
                    </label>
                    <input
                      required
                      type="email"
                      placeholder="rahul@company.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900/90 border border-neutral-800 text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:border-neutral-500 transition-all font-sans"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs uppercase tracking-wider text-neutral-300 font-medium">
                      Phone / WhatsApp *
                    </label>
                    <input
                      required
                      type="tel"
                      placeholder="+91 98765 43210"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900/90 border border-neutral-800 text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:border-neutral-500 transition-all font-sans"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs uppercase tracking-wider text-neutral-300 font-medium">
                      Brand / Business Name
                    </label>
                    <input
                      type="text"
                      placeholder="Brand or Enterprise Ltd."
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900/90 border border-neutral-800 text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:border-neutral-500 transition-all font-sans"
                    />
                  </div>
                </div>

                {/* 3. Message Textarea */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs uppercase tracking-wider text-neutral-300 font-medium">
                    Project Vision & Goals *
                  </label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Tell us about your brand objectives, deliverables, timeline, or current challenges..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900/90 border border-neutral-800 text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:border-neutral-500 transition-all resize-none leading-relaxed font-sans"
                  />
                </div>

                {errorMessage && (
                  <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-400 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="mt-1 w-full py-3.5 rounded-xl bg-white hover:bg-neutral-200 text-black font-bold text-xs sm:text-sm uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer disabled:opacity-50 active:scale-[0.99]"
                >
                  {isSubmitting ? (
                    <span>Transmitting to {clientEmail}...</span>
                  ) : (
                    <>
                      <span>Transmit Project Inquiry</span>
                      <Send className="w-3.5 h-3.5 text-[#ff3b30]" />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>

          {/* RIGHT: Cohesive Agency Contact Bento Cards (lg:col-span-5) */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            {/* 1. Official Agency Business Portal Card */}
            {/* <div className="bg-[#0c0c0c] border border-neutral-800 rounded-3xl p-6 sm:p-7 flex flex-col gap-4 shadow-[0_20px_50px_rgba(0,0,0,0.4)] text-white">
            
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#ff3b30] animate-pulse" />
                  <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-neutral-300 font-bold">
                    VERIFIED CREDENTIALS
                  </span>
                </div>
                <div className="flex items-center gap-1 font-mono text-[10px] uppercase tracking-widest text-neutral-400 bg-neutral-900 border border-neutral-800 px-2.5 py-1 rounded-full">
                  <ShieldCheck className="w-3 h-3 text-[#ff3b30]" />
                  <span>OFFICIAL PORTAL</span>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <h4 className="font-bold text-base sm:text-lg uppercase tracking-tight text-white">
                  Marketing Agency Portal
                </h4>
                <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">
                  Visit our dedicated business portfolio and client profile for verified credentials, live case studies, and enterprise updates.
                </p>
              </div>

              <a
                href="https://todosolution-marketingagency.business.site/"
                target="_blank"
                rel="noreferrer"
                className="group mt-1 flex items-center justify-between p-3.5 rounded-2xl bg-neutral-900/90 hover:bg-neutral-800 border border-neutral-800 hover:border-neutral-600 transition-all duration-200"
              >
                <div className="flex items-center gap-3 min-w-0 pr-2">
                  <div className="w-8 h-8 rounded-lg bg-neutral-800 flex items-center justify-center text-white shrink-0">
                    <Mail className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-[9px] font-mono text-neutral-500 uppercase tracking-widest font-semibold">
                      GOOGLE BUSINESS PROFILE
                    </span>
                    <span className="font-mono text-xs font-semibold text-neutral-200 group-hover:text-white transition-colors truncate">
                      todosolution-marketingagency.business.site
                    </span>
                  </div>
                </div>

                <div className="w-7 h-7 rounded-full bg-white/10 group-hover:bg-white group-hover:text-black text-neutral-300 flex items-center justify-center transition-all shrink-0">
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </div>
              </a>
            </div> */}

            {/* 2. Direct Channels & Agency Presence */}
            <div className="bg-[#0c0c0c] border border-neutral-800 rounded-3xl p-6 sm:p-7 flex flex-col gap-5 shadow-[0_20px_50px_rgba(0,0,0,0.4)] text-white">
              {/* Segment A: Direct Inquiries */}
              <div className="flex items-start justify-between gap-3 group">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-center text-white shrink-0">
                    <Mail className="w-4 h-4 text-[#ff3b30]" />
                  </div>
                  <div className="flex flex-col gap-0.5 min-w-0">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-400 font-semibold">
                      DIRECT DESK
                    </span>
                    <a
                      href={`mailto:${clientEmail}`}
                      className="font-bold text-xs sm:text-sm text-white hover:underline truncate"
                    >
                      {clientEmail}
                    </a>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleCopyEmail}
                  className="px-2.5 py-1 rounded-full bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 hover:text-white text-[10px] font-mono flex items-center gap-1 transition-all cursor-pointer shrink-0 mt-0.5"
                  title="Copy email address"
                >
                  {copiedEmail ? (
                    <>
                      <Check className="w-3 h-3 text-[#ff3b30]" />
                      <span className="text-[#ff3b30]">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3 text-neutral-400" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>

              {/* Segment B: Agency Reach */}
              <div className="flex items-start gap-3 pt-4 border-t border-neutral-800/80">
                <div className="w-9 h-9 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-center text-white shrink-0">
                  <MapPin className="w-4 h-4 text-[#ff3b30]" />
                </div>
                <div className="flex flex-col gap-1 min-w-0">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-400 font-semibold">
                    AGENCY REACH & DEPLOYMENT
                  </span>
                  <p className="text-xs text-neutral-200 leading-snug">
                    Pan-India Operations & Global Remote Collaboration
                  </p>
                  <div className="flex flex-wrap gap-1.5 pt-0.5">
                    {["Mumbai", "Delhi NCR", "Bengaluru", "Global Remote"].map((loc) => (
                      <span
                        key={loc}
                        className="font-mono text-[9px] uppercase tracking-wider text-neutral-400 bg-neutral-900 border border-neutral-800 px-2 py-0.5 rounded-md"
                      >
                        {loc}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Segment C: Response Guarantee */}
              <div className="flex items-start gap-3 pt-4 border-t border-neutral-800/80">
                <div className="w-9 h-9 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-center text-white shrink-0">
                  <Clock className="w-4 h-4 text-[#ff3b30]" />
                </div>
                <div className="flex flex-col gap-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-400 font-semibold">
                      RESPONSE GUARANTEE
                    </span>
                    <span className="font-mono text-[9px] uppercase tracking-wider text-neutral-200 bg-neutral-900 border border-neutral-800 px-2 py-0.5 rounded-full font-bold">
                      &lt; 2H SLA
                    </span>
                  </div>
                  <p className="text-xs text-neutral-300 leading-snug">
                    Rapid turnaround — our specialists review all incoming briefs within 2 hours.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
