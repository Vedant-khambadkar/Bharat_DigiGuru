import { Router } from "express";
import publicRoutes from "./publicRoutes.js";
import adminRoutes from "./adminRoutes.js";

const apiRouter = Router();

// Public Endpoints: /api/...
apiRouter.use("/", publicRoutes);

// Admin Endpoints: /api/admin/...
apiRouter.use("/admin", adminRoutes);

// Health Check: /api/health
apiRouter.get("/health", (_req, res) => {
  res.status(200).json({
    status: "healthy",
    service: "Bharat DigiGuru Backend API",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
  });
});

export default apiRouter;
