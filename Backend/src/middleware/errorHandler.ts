import { Request, Response, NextFunction } from "express";

export const errorHandler = (
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  console.error("❌ [SERVER ERROR]:", err);

  if (err.code === "LIMIT_FILE_SIZE") {
    res.status(400).json({
      success: false,
      message: "File exceeds maximum upload size limit of 1 MB (1,000,000 bytes).",
    });
    return;
  }

  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  res.status(status).json({
    success: false,
    message,
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
};
