import { Request, Response } from "express";
import { db } from "../data/db.js";
import { emitEvent } from "../services/socketService.js";

export const getPublicSettings = async (_req: Request, res: Response): Promise<void> => {
  try {
    const settings = await db.getSiteSettings();
    res.status(200).json({
      teamSectionVisible: settings.teamSectionVisible ?? true,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getAdminSettings = async (_req: Request, res: Response): Promise<void> => {
  try {
    const settings = await db.getSiteSettings();
    res.status(200).json(settings);
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const updateTeamVisibility = async (req: Request, res: Response): Promise<void> => {
  try {
    const { teamSectionVisible } = req.body;
    if (typeof teamSectionVisible !== "boolean") {
      res.status(400).json({
        success: false,
        message: "teamSectionVisible must be a boolean (true or false).",
      });
      return;
    }

    const updated = await db.updateSiteSettings({ teamSectionVisible });
    emitEvent("settings:updated", updated);
    emitEvent("team:visibility:updated", { teamSectionVisible });

    res.status(200).json({
      success: true,
      message: `Team & Founder section visibility set to ${teamSectionVisible ? "ON" : "OFF"}`,
      settings: updated,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};
