import { Request, Response } from "express";
import { db } from "../data/db.js";
import { emitEvent } from "../services/socketService.js";

export const getTeamMembers = async (_req: Request, res: Response): Promise<void> => {
  try {
    const members = await db.getAllTeamMembers();
    res.status(200).json(members);
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getTeamMembersAdmin = async (req: Request, res: Response): Promise<void> => {
  try {
    const { page, limit, search, column } = req.query;
    const result = await db.getTeamMembersAdmin({
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 10,
      search: search ? String(search) : undefined,
      column: column ? (column as string) : undefined,
    });
    res.status(200).json(result);
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getTeamMemberById = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const member = await db.getTeamMemberById(id);
    if (!member) {
      res.status(404).json({ success: false, message: "Team member not found" });
      return;
    }
    res.status(200).json(member);
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const createTeamMember = async (req: Request, res: Response): Promise<void> => {
  try {
    const created = await db.createTeamMember(req.body);
    emitEvent("team:created", created);
    res.status(201).json({ success: true, data: created });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const updateTeamMember = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const updated = await db.updateTeamMember(id, req.body);
    if (!updated) {
      res.status(404).json({ success: false, message: "Team member not found" });
      return;
    }
    emitEvent("team:updated", updated);
    res.status(200).json({ success: true, data: updated });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const deleteTeamMember = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const success = await db.deleteTeamMember(id);
    if (!success) {
      res.status(404).json({ success: false, message: "Team member not found" });
      return;
    }
    emitEvent("team:deleted", id);
    res.status(200).json({ success: true, message: "Team member deleted successfully" });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ==========================================
// FOUNDER PROFILE CONTROLLERS
// ==========================================
export const getFounder = async (_req: Request, res: Response): Promise<void> => {
  try {
    const founder = await db.getFounder();
    res.status(200).json(founder);
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const updateFounder = async (req: Request, res: Response): Promise<void> => {
  try {
    const updated = await db.updateFounder(req.body);
    emitEvent("founder:updated", updated);
    res.status(200).json({ success: true, data: updated });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};
