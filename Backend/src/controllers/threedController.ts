import { Request, Response } from "express";
import { db } from "../data/db.js";
import { emitEvent } from "../services/socketService.js";

export const getThreeD = async (req: Request, res: Response): Promise<void> => {
  try {
    const { page, limit, search, category } = req.query;

    if (page || limit || search || category) {
      const result = await db.getThreeD({
        page: page ? Number(page) : 1,
        limit: limit ? Number(limit) : 10,
        search: search ? String(search) : undefined,
        category: category ? String(category) : undefined,
      });
      res.status(200).json(result);
      return;
    }

    const allItems = await db.getAllThreeD();
    res.status(200).json(allItems);
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getThreeDById = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const project = await db.getThreeDById(id);
    if (!project) {
      res.status(404).json({ success: false, message: "3D Project not found" });
      return;
    }
    res.status(200).json(project);
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const createThreeD = async (req: Request, res: Response): Promise<void> => {
  try {
    const created = await db.createThreeD(req.body);
    emitEvent("threed:created", created);
    res.status(201).json({ success: true, data: created });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const updateThreeD = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const updated = await db.updateThreeD(id, req.body);
    if (!updated) {
      res.status(404).json({ success: false, message: "3D Project not found" });
      return;
    }
    emitEvent("threed:updated", updated);
    res.status(200).json({ success: true, data: updated });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const deleteThreeD = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const success = await db.deleteThreeD(id);
    if (!success) {
      res.status(404).json({ success: false, message: "3D Project not found" });
      return;
    }
    emitEvent("threed:deleted", id);
    res.status(200).json({ success: true, message: "3D Project deleted successfully" });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};
