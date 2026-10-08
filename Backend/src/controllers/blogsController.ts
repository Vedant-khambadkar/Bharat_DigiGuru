import { Request, Response } from "express";
import { db } from "../data/db.js";
import { emitEvent } from "../services/socketService.js";

export const getBlogs = async (req: Request, res: Response): Promise<void> => {
  try {
    const { page, limit, search, category } = req.query;

    if (page || limit || search || category) {
      const result = await db.getBlogs({
        page: page ? Number(page) : 1,
        limit: limit ? Number(limit) : 20,
        search: search ? String(search) : undefined,
        category: category ? String(category) : undefined,
      });
      res.status(200).json(result);
      return;
    }

    const allBlogs = await db.getAllBlogs();
    res.status(200).json(allBlogs);
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getBlogById = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const item = await db.getBlogById(id);
    if (!item) {
      res.status(404).json({ success: false, message: "Blog not found" });
      return;
    }
    res.status(200).json(item);
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const createBlog = async (req: Request, res: Response): Promise<void> => {
  try {
    const created = await db.createBlog(req.body);
    emitEvent("blog:created", created);
    res.status(201).json({ success: true, data: created });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const updateBlog = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const updated = await db.updateBlog(id, req.body);
    if (!updated) {
      res.status(404).json({ success: false, message: "Blog not found" });
      return;
    }
    emitEvent("blog:updated", updated);
    res.status(200).json({ success: true, data: updated });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const deleteBlog = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const success = await db.deleteBlog(id);
    if (!success) {
      res.status(404).json({ success: false, message: "Blog not found" });
      return;
    }
    emitEvent("blog:deleted", id);
    res.status(200).json({ success: true, message: "Blog deleted successfully" });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};
