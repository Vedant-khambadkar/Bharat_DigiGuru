import { Request, Response } from "express";
import { db } from "../data/db.js";
import { emitEvent } from "../services/socketService.js";

export const getPortfolio = async (req: Request, res: Response): Promise<void> => {
  try {
    const { page, limit, search, category } = req.query;

    // If page or limit query parameters are provided, return paginated payload
    if (page || limit || search || category) {
      const result = await db.getPortfolio({
        page: page ? Number(page) : 1,
        limit: limit ? Number(limit) : 10,
        search: search ? String(search) : undefined,
        category: category ? String(category) : undefined,
      });
      res.status(200).json(result);
      return;
    }

    // Default: return all items
    const allItems = await db.getAllPortfolio();
    res.status(200).json(allItems);
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getPortfolioById = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const item = await db.getPortfolioById(id);
    if (!item) {
      res.status(404).json({ success: false, message: "Portfolio project not found" });
      return;
    }
    res.status(200).json(item);
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const createPortfolio = async (req: Request, res: Response): Promise<void> => {
  try {
    const created = await db.createPortfolio(req.body);
    emitEvent("portfolio:created", created);
    res.status(201).json({ success: true, data: created });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const updatePortfolio = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const updated = await db.updatePortfolio(id, req.body);
    if (!updated) {
      res.status(404).json({ success: false, message: "Portfolio project not found" });
      return;
    }
    emitEvent("portfolio:updated", updated);
    res.status(200).json({ success: true, data: updated });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const deletePortfolio = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const success = await db.deletePortfolio(id);
    if (!success) {
      res.status(404).json({ success: false, message: "Portfolio project not found" });
      return;
    }
    emitEvent("portfolio:deleted", id);
    res.status(200).json({ success: true, message: "Portfolio project deleted successfully" });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};
