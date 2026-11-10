import { Request, Response, NextFunction } from "express";

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

const rateLimitMap = new Map<string, RateLimitRecord>();

// Clean up expired entries every 10 minutes to prevent memory leaks
const cleanupInterval = setInterval(() => {
  const now = Date.now();
  for (const [key, value] of rateLimitMap.entries()) {
    if (now > value.resetTime) {
      rateLimitMap.delete(key);
    }
  }
}, 10 * 60 * 1000);

if (cleanupInterval.unref) {
  cleanupInterval.unref();
}

/**
 * IP-based rate limiter middleware.
 * @param maxRequests Maximum requests allowed in the time window (default: 5)
 * @param windowMinutes Time window in minutes (default: 15)
 */
export const inquiryRateLimiter = (
  maxRequests: number = 5,
  windowMinutes: number = 15
) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    // Extract client IP (handle proxies, CloudFront, Nginx reverse proxy, etc.)
    const forwarded = req.headers["x-forwarded-for"];
    const clientIp =
      (typeof forwarded === "string" ? forwarded.split(",")[0].trim() : undefined) ||
      req.socket.remoteAddress ||
      "unknown-ip";

    const now = Date.now();
    const windowMs = windowMinutes * 60 * 1000;
    const record = rateLimitMap.get(clientIp);

    if (!record || now > record.resetTime) {
      rateLimitMap.set(clientIp, {
        count: 1,
        resetTime: now + windowMs,
      });
      return next();
    }

    if (record.count >= maxRequests) {
      const waitMinutes = Math.max(1, Math.ceil((record.resetTime - now) / (60 * 1000)));
      res.status(429).json({
        success: false,
        message: `Too many submissions from this connection. Please try again in ${waitMinutes} minute(s).`,
      });
      return;
    }

    record.count += 1;
    next();
  };
};

