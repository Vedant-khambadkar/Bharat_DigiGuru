import React, { useState } from "react";
import {
  Mail,
  MapPin,
  Clock,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Phone,
  Globe,
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

  const clientEmail = "contactbharatdigiguru@gmail.com";

  const toggleService = React.useCallback((service: string) => {
    setSelectedServices((prev) => {
      if (prev.includes(service)) {
        return prev.length > 1 ? prev.filter((s) => s !== service) : prev;
      }
      return [...prev, service];
    });
  }, []);

  const handleSubmit = React.useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      await userService.submitInquiry({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        company: formData.company || "Not Specified",
        services: selectedServices.join(", "),
        message: formData.message,
      });

      socket.emit("inquiry:new", {
        id: `inq-${Date.now()}`,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        company: formData.company,
        services: selectedServices.join(", "),
        message: formData.message,
        createdAt: new Date().toISOString(),
        status: "NEW",
      });

      setIsSubmitting(false);
      setIsSubmitted(true);
    } catch (err: any) {
      console.error("Inquiry submission error:", err);
      setIsSubmitting(false);
      setIsSubmitted(true);
    }
  }, [formData, selectedServices]);

  const handleCopyEmail = React.useCallback(() => {
    navigator.clipboard.writeText(clientEmail);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  }, []);

  return (
    <section
      id="contact-section"
      className="relative font-['monospace'] z-10 bg-transparent text-white w-full px-6 sm:px-10 md:px-12 lg:px-16 py-16 sm:py-20 lg:py-24 overflow-hidden"
    >
      <div className="relative z-10 w-full max-w-7xl mx-auto flex flex-col gap-12 sm:gap-16">
        {/* =========================================================================
            HEADER SECTION: Simple, Crisp Editorial
           ========================================================================= */}
        <div className="flex flex-col gap-4 max-w-3xl">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-white/70" />
            <span className="text-[11px] font-mono tracking-[0.2em] uppercase text-neutral-400">
              Get in Touch
            </span>
          </div>

          <h2 className="font-neuropol text-3xl sm:text-4xl lg:text-5xl uppercase tracking-wider text-white leading-none select-none">
            <LensText text="CONTACT US" strokeWidth="2px" strokeColor="#ffffff" />
          </h2>

          <p className="text-sm sm:text-base text-neutral-400 leading-relaxed max-w-2xl font-['Space_Grotesk',sans-serif]">
            Have an ambitious project or looking to scale your brand presence?
            Tell us about your goals and our team will get back to you with a tailored roadmap.
          </p>
        </div>

        {/* =========================================================================
            MAIN SECTION: Minimalist 2-Column Split
           ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* LEFT: Clean Simple Form (lg:col-span-7) */}
          <div className="lg:col-span-7 bg-[#0b0b0b] border border-neutral-800/80 rounded-2xl p-6 sm:p-8 md:p-10 shadow-xl">
            {isSubmitted ? (
              <div className="py-12 flex flex-col items-center justify-center text-center gap-4">
                <div className="w-12 h-12 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white mb-2">
                  <CheckCircle2 className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-bold text-2xl text-white uppercase tracking-tight font-['Space_Grotesk',sans-serif]">
                  Message Received
                </h3>
                <p className="text-sm text-neutral-400 max-w-md leading-relaxed">
                  Thank you for reaching out. We have received your project details and our team will review your brief within 2 hours.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setIsSubmitted(false);
                    setFormData({ name: "", email: "", phone: "", company: "", message: "" });
                  }}
                  className="mt-4 px-6 py-2.5 rounded-lg border border-neutral-700 bg-neutral-900 text-xs uppercase tracking-wider text-neutral-200 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer font-medium"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                {/* 1. Services Selector */}
                <div className="flex flex-col gap-2.5">
                  <label className="text-xs uppercase tracking-wider text-neutral-400 font-medium">
                    What services do you need?
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {SERVICES_OPTIONS.map((srv) => {
                      const active = selectedServices.includes(srv);
                      return (
                        <button
                          key={srv}
                          type="button"
                          onClick={() => toggleService(srv)}
                          className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 cursor-pointer border ${
                            active
                              ? "bg-white text-black border-white shadow-sm"
                              : "bg-neutral-900/60 text-neutral-400 border-neutral-800 hover:text-white hover:border-neutral-600"
                          }`}
                        >
                          {srv}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Form Inputs */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs uppercase tracking-wider text-neutral-400 font-medium">
                      Your Name <span className="text-neutral-500">*</span>
                    </label>
                    <input
                      required
                      type="text"
                      placeholder="e.g. Rahul Sharma"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg bg-neutral-900/80 border border-neutral-800 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-neutral-400 transition-colors"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs uppercase tracking-wider text-neutral-400 font-medium">
                      Work Email <span className="text-neutral-500">*</span>
                    </label>
                    <input
                      required
                      type="email"
                      placeholder="name@company.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg bg-neutral-900/80 border border-neutral-800 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-neutral-400 transition-colors"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs uppercase tracking-wider text-neutral-400 font-medium">
                      Phone / WhatsApp <span className="text-neutral-500">*</span>
                    </label>
                    <input
                      required
                      type="tel"
                      placeholder="+91 98765 43210"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg bg-neutral-900/80 border border-neutral-800 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-neutral-400 transition-colors"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs uppercase tracking-wider text-neutral-400 font-medium">
                      Brand / Company
                    </label>
                    <input
                      type="text"
                      placeholder="Company Name"
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg bg-neutral-900/80 border border-neutral-800 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-neutral-400 transition-colors"
                    />
                  </div>
                </div>

                {/* 3. Message */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs uppercase tracking-wider text-neutral-400 font-medium">
                    Project Overview <span className="text-neutral-500">*</span>
                  </label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Tell us about your vision, key requirements, timeline, or current goals..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg bg-neutral-900/80 border border-neutral-800 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-neutral-400 transition-colors resize-none leading-relaxed"
                  />
                </div>

                {errorMessage && (
                  <div className="p-3 rounded-lg bg-neutral-900 border border-red-500/40 text-xs text-red-400 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="mt-2 w-full py-3.5 rounded-lg bg-white hover:bg-neutral-200 text-black font-semibold text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all duration-150 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <span>Sending...</span>
                  ) : (
                    <>
                      <span>Submit Inquiry</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>

          {/* RIGHT: Direct Channels & Information (lg:col-span-5) */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            {/* Direct Email Card */}
            <div className="bg-[#0b0b0b] border border-neutral-800/80 rounded-2xl p-6 sm:p-7 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono uppercase tracking-widest text-neutral-400 font-medium">
                  Direct Contact
                </span>
                <button
                  type="button"
                  onClick={handleCopyEmail}
                  className="px-3 py-1 rounded-md bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 hover:text-white text-xs font-mono flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Copy email address"
                >
                  {copiedEmail ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-white" />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-neutral-400" />
                      <span>Copy Email</span>
                    </>
                  )}
                </button>
              </div>

              <div className="flex flex-col gap-3 pt-1 border-t border-neutral-800/80 mt-1">
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center justify-center text-white shrink-0">
                    <Mail className="w-4 h-4 text-neutral-300" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs text-neutral-500">Email us directly</span>
                    <a
                      href={`mailto:${clientEmail}`}
                      className="font-medium text-xs sm:text-sm text-white hover:underline truncate"
                    >
                      {clientEmail}
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center justify-center text-white shrink-0">
                    <Phone className="w-4 h-4 text-[#ff3b30]" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs text-neutral-500">India Contact</span>
                    <a
                      href="tel:+918682858584"
                      className="font-mono font-medium text-xs sm:text-sm text-white hover:text-[#ff3b30] transition-colors"
                    >
                      +91 86828 58584
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center justify-center text-white shrink-0">
                    <Globe className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs text-neutral-500">Global Contact</span>
                    <a
                      href="tel:+5927667700"
                      className="font-mono font-medium text-xs sm:text-sm text-white hover:text-emerald-400 transition-colors"
                    >
                      +592 766 7700
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Reach & Hours Card */}
            <div className="bg-[#0b0b0b] border border-neutral-800/80 rounded-2xl p-6 sm:p-7 flex flex-col gap-5">
              {/* Location */}
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center justify-center text-white shrink-0">
                  <MapPin className="w-4 h-4 text-neutral-300" />
                </div>
                <div className="flex flex-col gap-1 min-w-0">
                  <span className="text-xs font-mono uppercase tracking-wider text-neutral-400">
                    Location & Reach
                  </span>
                  <p className="text-sm text-neutral-200">
                    Pan-India Operations & Global Remote Delivery
                  </p>
                  <p className="text-xs text-neutral-500">
                    Mumbai • Delhi NCR • Bengaluru • International
                  </p>
                </div>
              </div>

              <div className="h-[1px] w-full bg-neutral-800/80" />

              {/* SLA / Response */}
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center justify-center text-white shrink-0">
                  <Clock className="w-4 h-4 text-neutral-300" />
                </div>
                <div className="flex flex-col gap-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono uppercase tracking-wider text-neutral-400">
                      Response Time
                    </span>
                    <span className="text-[10px] font-mono uppercase text-neutral-300 bg-neutral-900 border border-neutral-800 px-2 py-0.5 rounded">
                      &lt; 2 Hours
                    </span>
                  </div>
                  <p className="text-xs text-neutral-400 leading-relaxed">
                    We review all incoming project requests promptly and schedule an initial discovery discussion.
                  </p>
                </div>
              </div>
            </div>

            {/* Simple Next Steps Card */}
            <div className="bg-[#0b0b0b] border border-neutral-800/80 rounded-2xl p-6 sm:p-7 flex flex-col gap-3">
              <span className="text-xs font-mono uppercase tracking-wider text-neutral-400 font-medium">
                How We Collaborate
              </span>
              <div className="flex flex-col gap-3 pt-1 text-xs text-neutral-400">
                <div className="flex items-start gap-3">
                  <span className="font-mono text-neutral-500">01</span>
                  <span><strong className="text-neutral-200 font-normal">Initial Brief:</strong> We understand your brand goals and requirements.</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="font-mono text-neutral-500">02</span>
                  <span><strong className="text-neutral-200 font-normal">Strategy Blueprint:</strong> We propose a clear production timeline & scope.</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="font-mono text-neutral-500">03</span>
                  <span><strong className="text-neutral-200 font-normal">Launch & Growth:</strong> Seamless execution with continuous performance optimization.</span>
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

