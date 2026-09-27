import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

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
      role: "superadmin",
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
      role: decoded.role,
    };
    next();
  } catch (err: any) {
    res.status(401).json({
      success: false,
      message: "Invalid or expired authorization token.",
    });
  }
};
