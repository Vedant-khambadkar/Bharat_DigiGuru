import { Request, Response } from "express";
import { db } from "../data/db.js";
import { emitEvent } from "../services/socketService.js";

export const submitInquiry = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, fullName, email, phone, company, services, budget, timeline, message } = req.body;

    if (!email || (!name && !fullName) || !message) {
      res.status(400).json({
        success: false,
        message: "Please provide your name, email, and message.",
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
