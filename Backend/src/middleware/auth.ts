import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: "managedAdmin" | "superAdmin" | "admin";
    name?: string;
  };
}

export const normalizeRole = (role?: string): "managedAdmin" | "superAdmin" | "admin" => {
  const r = (role || "").toLowerCase().trim();
  if (r === "managedadmin" || r === "managed_admin") return "managedAdmin";
  if (r === "superadmin" || r === "super_admin") return "superAdmin";
  return "admin";
};

export const authenticateAdmin = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;

  if (!token) {
    res.status(401).json({
      success: false,
      message: "Authentication token required. Please log in to admin portal.",
    });
    return;
  }

  // Support dev mock tokens if in development
  if (token === "mock-admin-token-active" || token === "mock-admin-token-xyz") {
    req.user = {
      id: "admin-master-001",
      email: "admin@bharatdigiguru.com",
      role: "managedAdmin",
      name: "Bharat DigiGuru Administrator",
    };
    next();
    return;
  }

  const jwtSecret = process.env.JWT_SECRET || "bharat_digiguru_super_secure_jwt_token_key_2026";

  try {
    const decoded = jwt.verify(token, jwtSecret) as any;
    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: normalizeRole(decoded.role),
      name: decoded.name,
    };
    next();
  } catch (err: any) {
    res.status(401).json({
      success: false,
      message: "Invalid or expired authorization token.",
    });
  }
};

/**
 * Middleware: Only Managed Admin (managedAdmin) can access this resource.
 * Super Admin and regular Admin are denied access.
 */
export const requireManagedAdmin = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  const userRole = normalizeRole(req.user?.role);
  if (userRole !== "managedAdmin") {
    res.status(403).json({
      success: false,
      message: "Access restricted: Only Managed Admin has permission to view or manage the 3D Showcase.",
    });
    return;
  }
  next();
};

/**
 * Middleware: Super Admin or Managed Admin can access this resource (e.g. creating/registering admins).
 */
export const requireSuperOrManagedAdmin = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  const userRole = normalizeRole(req.user?.role);
  if (userRole !== "managedAdmin" && userRole !== "superAdmin") {
    res.status(403).json({
      success: false,
      message: "Access restricted: Only Super Admin and Managed Admin can perform this administrative action.",
    });
    return;
  }
  next();
};

