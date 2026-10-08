import { Request, Response } from "express";
import { db } from "../data/db.js";
import { emitEvent } from "../services/socketService.js";

export const getStories = async (req: Request, res: Response): Promise<void> => {
  try {
    const { page, limit, search } = req.query;

    // If page or limit or search query parameters are provided, return paginated payload
    if (page || limit || search) {
      const result = await db.getStories({
        page: page ? Number(page) : 1,
        limit: limit ? Number(limit) : 10,
        search: search ? String(search) : undefined,
      });
      res.status(200).json(result);
      return;
    }

    // Default: return all active stories
    const allStories = await db.getAllStories();
    res.status(200).json(allStories);
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getStoryById = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const item = await db.getStoryById(id);
    if (!item) {
      res.status(404).json({ success: false, message: "Story not found" });
      return;
    }
    res.status(200).json(item);
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const createStory = async (req: Request, res: Response): Promise<void> => {
  try {
    const created = await db.createStory(req.body);
    emitEvent("story:created", created);
    res.status(201).json({ success: true, data: created });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const updateStory = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const updated = await db.updateStory(id, req.body);
    if (!updated) {
      res.status(404).json({ success: false, message: "Story not found" });
      return;
    }
    emitEvent("story:updated", updated);
    res.status(200).json({ success: true, data: updated });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const deleteStory = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const success = await db.deleteStory(id);
    if (!success) {
      res.status(404).json({ success: false, message: "Story not found" });
      return;
    }
    emitEvent("story:deleted", id);
    res.status(200).json({ success: true, message: "Story deleted successfully" });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};
