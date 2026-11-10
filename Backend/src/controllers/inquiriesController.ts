import { Request, Response } from "express";
import { db } from "../data/db.js";
import { emitEvent } from "../services/socketService.js";
import { sendInquiryNotificationEmail } from "../services/emailService.js";

// Helper to verify external captcha if configured
async function verifyCaptcha(token?: string, ip?: string): Promise<boolean> {
  const turnstileSecret = process.env.TURNSTILE_SECRET_KEY;
  if (turnstileSecret && token) {
    try {
      const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          secret: turnstileSecret,
          response: token,
          remoteip: ip || "",
        }),
      });
      const data: any = await response.json();
      return !!data.success;
    } catch (_e) {
      return false;
    }
  }

  const recaptchaSecret = process.env.RECAPTCHA_SECRET_KEY;
  if (recaptchaSecret && token) {
    try {
      const response = await fetch("https://www.google.com/recaptcha/api/siteverify", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          secret: recaptchaSecret,
          response: token,
          remoteip: ip || "",
        }),
      });
      const data: any = await response.json();
      return !!data.success;
    } catch (_e) {
      return false;
    }
  }

  return true;
}

// Bot heuristics & Honeypot detection
function evaluateSpamHeuristics(data: {
  name?: string;
  fullName?: string;
  email: string;
  message: string;
  honeypot?: string;
  formRenderTime?: number;
}): { isSpam: boolean; reason?: string } {
  // 1. Honeypot check: Hidden field filled by bots
  if (data.honeypot && data.honeypot.trim().length > 0) {
    return { isSpam: true, reason: "Honeypot field filled" };
  }

  // 2. Time-trap check: Humans take at least 2.5 seconds to fill the form
  if (data.formRenderTime) {
    const elapsed = Date.now() - Number(data.formRenderTime);
    if (elapsed < 2500) {
      return { isSpam: true, reason: "Submitted too quickly (<2.5s)" };
    }
  }

  const candidateName = (data.name || data.fullName || "").trim();
  const candidateMsg = (data.message || "").trim();

  // 3. Name check: Bot random alphanumeric strings without whitespace (e.g. LgPHIBhdQNOCQvMzWEAUKhNh)
  if (candidateName.length > 18 && !candidateName.includes(" ")) {
    return { isSpam: true, reason: "Random alphanumeric string name" };
  }

  // 4. Message check: Bots submitting purely digits or quotes around numbers (e.g. "8672433794")
  if (/^["']?\d{7,15}["']?$/.test(candidateMsg)) {
    return { isSpam: true, reason: "Numeric-only phone number message payload" };
  }

  return { isSpam: false };
}

export const submitInquiry = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      name,
      fullName,
      email,
      phone,
      company,
      services,
      budget,
      timeline,
      message,
      website_url_check,
      _gotcha,
      formRenderTime,
      captchaToken,
    } = req.body;

    if (!email || (!name && !fullName) || !message) {
      res.status(400).json({
        success: false,
        message: "Please provide your name, email, and message.",
      });
      return;
    }

    // Client IP for rate-limiting and captcha verification
    const forwarded = req.headers["x-forwarded-for"];
    const clientIp =
      (typeof forwarded === "string" ? forwarded.split(",")[0].trim() : undefined) ||
      req.socket.remoteAddress ||
      "";

    // 1. Captcha validation (if configured on backend)
    const captchaValid = await verifyCaptcha(captchaToken, clientIp);
    if (!captchaValid) {
      res.status(400).json({
        success: false,
        message: "CAPTCHA verification failed. Please try again.",
      });
      return;
    }

    // 2. Honeypot & Bot Heuristics Evaluation
    const spamCheck = evaluateSpamHeuristics({
      name,
      fullName,
      email,
      message,
      honeypot: website_url_check || _gotcha,
      formRenderTime: formRenderTime ? Number(formRenderTime) : undefined,
    });

    if (spamCheck.isSpam) {
      console.warn(`🛡️ [SPAM BOT BLOCKED]: Reason: "${spamCheck.reason}" | Email: "${email}" | IP: "${clientIp}"`);
      // Return 200 OK silent discard so bots don't adapt or retry
      res.status(200).json({
        success: true,
        message: "Inquiry submitted successfully. Our team will contact you shortly.",
      });
      return;
    }

    const newInquiry = await db.createInquiry({
      name: name || fullName,
      fullName: fullName || name,
      email,
      phone: phone || "Not Provided",
      company: company || "Not Specified",
      services: Array.isArray(services) ? services : (services ? [services] : []),
      budget: budget || "Custom Scope",
      timeline: timeline || "Flexible",
      message,
      status: "NEW",
    });

    // Real-time broadcast to connected admin clients
    emitEvent("inquiry:new", newInquiry);

    // Send email notification in the background
    sendInquiryNotificationEmail(newInquiry).catch((err) => {
      console.warn("⚠️ Background email notification failed:", err.message);
    });

    res.status(201).json({
      success: true,
      message: "Inquiry submitted successfully. Our team will contact you shortly.",
      data: newInquiry,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getInquiries = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status, page, limit, search } = req.query;

    const result = await db.getInquiries({
      status: status ? String(status) : undefined,
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 10,
      search: search ? String(search) : undefined,
    });

    res.status(200).json(result);
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const updateInquiryStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const { status } = req.body;
    if (!status || !["NEW", "CONTACTED", "ARCHIVED"].includes(status.toUpperCase())) {
      res.status(400).json({
        success: false,
        message: "Status must be one of: 'NEW', 'CONTACTED', 'ARCHIVED'",
      });
      return;
    }

    const updated = await db.updateInquiryStatus(id, status.toUpperCase() as any);
    if (!updated) {
      res.status(404).json({ success: false, message: "Inquiry not found" });
      return;
    }

    emitEvent("inquiry:updated", updated);
    res.status(200).json({ success: true, data: updated });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const deleteInquiry = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const success = await db.deleteInquiry(id);
    if (!success) {
      res.status(404).json({ success: false, message: "Inquiry not found" });
      return;
    }

    emitEvent("inquiry:deleted", id);
    res.status(200).json({ success: true, message: "Inquiry deleted successfully" });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};
