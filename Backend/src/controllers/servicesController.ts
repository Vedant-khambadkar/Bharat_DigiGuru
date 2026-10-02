import { Request, Response } from "express";
import { db } from "../data/db.js";
import { emitEvent } from "../services/socketService.js";

export const getServices = async (req: Request, res: Response): Promise<void> => {
  try {
    const { page, limit, search } = req.query;

    // If page or limit or search query parameters are provided, return paginated payload
    if (page || limit || search) {
      const result = await db.getServices({
        page: page ? Number(page) : 1,
        limit: limit ? Number(limit) : 10,
        search: search ? String(search) : undefined,
      });
      res.status(200).json(result);
      return;
    }

    // Default: return all services
    const allServices = await db.getAllServices();
    res.status(200).json(allServices);
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getServiceById = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const item = await db.getServiceById(id);
    if (!item) {
      res.status(404).json({ success: false, message: "Service not found" });
      return;
    }
    res.status(200).json(item);
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const createService = async (req: Request, res: Response): Promise<void> => {
  try {
    const created = await db.createService(req.body);
    emitEvent("service:created", created);
    res.status(201).json({ success: true, data: created });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const updateService = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const updated = await db.updateService(id, req.body);
    if (!updated) {
      res.status(404).json({ success: false, message: "Service not found" });
      return;
    }
    emitEvent("service:updated", updated);
    res.status(200).json({ success: true, data: updated });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const deleteService = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const success = await db.deleteService(id);
    if (!success) {
      res.status(404).json({ success: false, message: "Service not found" });
      return;
    }
    emitEvent("service:deleted", id);
    res.status(200).json({ success: true, message: "Service deleted successfully" });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};
