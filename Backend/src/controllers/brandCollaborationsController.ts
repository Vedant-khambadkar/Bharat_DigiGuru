import { Request, Response } from "express";
import { db } from "../data/db.js";
import { emitEvent } from "../services/socketService.js";
import { storeBrandLogo, cleanupBrandLogoAsset } from "../services/imageService.js";

/**
 * GET /api/admin/brand-collaborations
 * Fetch brand collaborations with pagination, search, and status filters for Admin Panel.
 */
export const getAdminBrandCollaborations = async (req: Request, res: Response): Promise<void> => {
  try {
    const { page, limit, search, status } = req.query;

    if (page || limit || search || status) {
      const result = await db.getBrandCollaborations({
        page: page ? Number(page) : 1,
        limit: limit ? Number(limit) : 20,
        search: search ? String(search) : undefined,
        status: status ? String(status) : undefined,
      });
      res.status(200).json(result);
      return;
    }

    const allBrands = await db.getAllBrandCollaborations();
    res.status(200).json(allBrands);
  } catch (err: any) {
    console.error("❌ [GET ADMIN BRANDS ERROR]:", err);
    res.status(500).json({ success: false, message: err.message || "Failed to fetch brands." });
  }
};

/**
 * GET /api/brand-collaborations
 * Public endpoint: returns only active brands in ascending display order.
 */
export const getPublicBrandCollaborations = async (_req: Request, res: Response): Promise<void> => {
  try {
    const activeBrands = await db.getActiveBrandCollaborations();
    // Return only public display fields
    const publicData = activeBrands.map((b) => ({
      id: b.id,
      name: b.name,
      logoUrl: b.logoUrl,
      altText: b.altText || b.name,
      order: b.order,
    }));
    res.status(200).json(publicData);
  } catch (err: any) {
    console.error("❌ [GET PUBLIC BRANDS ERROR]:", err);
    res.status(500).json({ success: false, message: err.message || "Failed to fetch brand collaborations." });
  }
};

/**
 * GET /api/admin/brand-collaborations/:id
 */
export const getBrandCollaborationById = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const brand = await db.getBrandCollaborationById(id);
    if (!brand) {
      res.status(404).json({ success: false, message: "Brand collaboration not found." });
      return;
    }
    res.status(200).json(brand);
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * POST /api/admin/brand-collaborations
 * Validates 1MB size, verifies image content, converts to WebP, and stores brand.
 */
export const createBrandCollaboration = async (req: Request, res: Response): Promise<void> => {
  try {
    const name = (req.body.name || "").trim();
    if (!name) {
      res.status(400).json({
        success: false,
        message: "Brand name is required.",
      });
      return;
    }

    if (!req.file) {
      res.status(400).json({
        success: false,
        message: "Brand logo image file is required.",
      });
      return;
    }

    // 1. Process & Convert to WebP & Store
    const hostInfo = {
      protocol: req.protocol,
      host: req.get("host") || "localhost:5000",
    };
    const storedAsset = await storeBrandLogo(req.file, name, hostInfo);

    // 2. Parse status & order
    const isActive = req.body.isActive === undefined ? true : (req.body.isActive === "true" || req.body.isActive === true);
    const order = req.body.order !== undefined && !isNaN(Number(req.body.order))
      ? Number(req.body.order)
      : undefined;

    const altText = (req.body.altText || "").trim() || name;

    // 3. Persist in Database
    const created = await db.createBrandCollaboration({
      name,
      logoUrl: storedAsset.url,
      altText,
      order,
      isActive,
      originalFormat: storedAsset.originalFormat,
      format: storedAsset.format,
      size: storedAsset.size,
    });

    emitEvent("brand:created", created);
    res.status(201).json({
      success: true,
      message: "Brand collaboration created successfully with automatic WebP conversion.",
      data: created,
    });
  } catch (err: any) {
    console.error("❌ [CREATE BRAND ERROR]:", err.message);
    const statusCode = err.message.includes("exceeds maximum") || err.message.includes("Unsupported") || err.message.includes("Corrupted")
      ? 400
      : 500;
    res.status(statusCode).json({
      success: false,
      message: err.message || "Failed to create brand collaboration.",
    });
  }
};

/**
 * PUT /api/admin/brand-collaborations/:id
 * Updates brand details and/or replaces the logo with a new converted WebP image.
 */
export const updateBrandCollaboration = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const existing = await db.getBrandCollaborationById(id);
    if (!existing) {
      res.status(404).json({ success: false, message: "Brand collaboration not found." });
      return;
    }

    const updates: any = {};
    if (req.body.name !== undefined) {
      const name = String(req.body.name).trim();
      if (!name) {
        res.status(400).json({ success: false, message: "Brand name cannot be empty." });
        return;
      }
      updates.name = name;
    }

    if (req.body.altText !== undefined) {
      updates.altText = String(req.body.altText).trim();
    }

    if (req.body.order !== undefined && !isNaN(Number(req.body.order))) {
      updates.order = Number(req.body.order);
    }

    if (req.body.isActive !== undefined) {
      updates.isActive = req.body.isActive === "true" || req.body.isActive === true;
    }

    // If new logo uploaded, convert to WebP, store, and clean up previous logo
    if (req.file) {
      const hostInfo = {
        protocol: req.protocol,
        host: req.get("host") || "localhost:5000",
      };
      const brandName = updates.name || existing.name;
      const storedAsset = await storeBrandLogo(req.file, brandName, hostInfo);

      updates.logoUrl = storedAsset.url;
      updates.originalFormat = storedAsset.originalFormat;
      updates.format = storedAsset.format;
      updates.size = storedAsset.size;

      // Clean up previous logo asset safely
      if (existing.logoUrl && existing.logoUrl !== storedAsset.url) {
        cleanupBrandLogoAsset(existing.logoUrl).catch((cleanupErr) => {
          console.warn("⚠️ Old logo asset cleanup error:", cleanupErr.message);
        });
      }
    }

    const updated = await db.updateBrandCollaboration(id, updates);
    emitEvent("brand:updated", updated);

    res.status(200).json({
      success: true,
      message: "Brand collaboration updated successfully.",
      data: updated,
    });
  } catch (err: any) {
    console.error("❌ [UPDATE BRAND ERROR]:", err.message);
    const statusCode = err.message.includes("exceeds maximum") || err.message.includes("Unsupported") || err.message.includes("Corrupted")
      ? 400
      : 500;
    res.status(statusCode).json({
      success: false,
      message: err.message || "Failed to update brand collaboration.",
    });
  }
};

/**
 * PATCH /api/admin/brand-collaborations/:id/status
 * Toggle visibility status (active/inactive).
 */
export const updateBrandCollaborationStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const { isActive } = req.body;

    if (typeof isActive !== "boolean" && isActive !== "true" && isActive !== "false") {
      res.status(400).json({ success: false, message: "Field 'isActive' must be a boolean." });
      return;
    }

    const boolStatus = isActive === true || isActive === "true";
    const updated = await db.updateBrandCollaborationStatus(id, boolStatus);

    if (!updated) {
      res.status(404).json({ success: false, message: "Brand collaboration not found." });
      return;
    }

    emitEvent("brand:updated", updated);
    res.status(200).json({
      success: true,
      message: `Brand collaboration is now ${boolStatus ? "active" : "inactive"}.`,
      data: updated,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * PATCH /api/admin/brand-collaborations/reorder
 * Batch update display sequence of brand collaborations.
 */
export const reorderBrandCollaborations = async (req: Request, res: Response): Promise<void> => {
  try {
    const { items, orderedIds } = req.body;

    let orderedItems: { id: string; order: number }[] = [];

    if (Array.isArray(items) && items.length > 0) {
      orderedItems = items
        .filter((item: any) => item && item.id !== undefined && item.order !== undefined)
        .map((item: any) => ({
          id: String(item.id),
          order: Number(item.order),
        }));
    } else if (Array.isArray(orderedIds) && orderedIds.length > 0) {
      orderedItems = orderedIds.map((id: string, index: number) => ({
        id: String(id),
        order: index + 1,
      }));
    } else {
      res.status(400).json({
        success: false,
        message: "Invalid payload. Provide an 'items' array with id and order or 'orderedIds' array.",
      });
      return;
    }

    await db.reorderBrandCollaborations(orderedItems);
    emitEvent("brands:reordered", orderedItems);

    res.status(200).json({
      success: true,
      message: "Brand display orders updated successfully.",
      data: orderedItems,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * DELETE /api/admin/brand-collaborations/:id
 * Deletes brand collaboration and cleans up its stored logo asset.
 */
export const deleteBrandCollaboration = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const existing = await db.getBrandCollaborationById(id);

    if (!existing) {
      res.status(404).json({ success: false, message: "Brand collaboration not found." });
      return;
    }

    const deleted = await db.deleteBrandCollaboration(id);
    if (!deleted) {
      res.status(500).json({ success: false, message: "Failed to delete brand collaboration." });
      return;
    }

    // Safely remove the stored logo asset
    if (existing.logoUrl) {
      cleanupBrandLogoAsset(existing.logoUrl).catch((err) => {
        console.warn("⚠️ Asset cleanup error on brand delete:", err.message);
      });
    }

    emitEvent("brand:deleted", id);
    res.status(200).json({
      success: true,
      message: "Brand collaboration deleted successfully.",
      id,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};
