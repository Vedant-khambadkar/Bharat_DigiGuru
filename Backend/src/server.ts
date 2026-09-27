import express from "express";
import http from "http";
import cors from "cors";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import apiRouter from "./routes/index.js";
import { initializeSocket } from "./services/socketService.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { db } from "./data/db.js";

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 5000;

// Allowed Origins for CORS (Support both local development and production deployments)
const rawCorsOrigin = process.env.CORS_ORIGIN || "";
const envOrigins = rawCorsOrigin
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

const ALLOWED_ORIGINS = [
  "http://localhost:5173",
  "http://localhost:3000",
  "http://127.0.0.1:5173",
  "https://bharat-digi-guru-six.vercel.app",
  "https://bharat-digi-guru-s7ek.vercel.app",
  ...envOrigins,
];

// 1. CORS Middleware with Credentials support
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, or server-to-server)
      if (!origin) return callback(null, true);

      // Check against explicit allowed origins or .vercel.app domain
      const isAllowed =
        ALLOWED_ORIGINS.includes(origin) ||
        origin.endsWith(".vercel.app") ||
        process.env.NODE_ENV !== "production";

      if (isAllowed) {
        return callback(null, true);
      }
      return callback(new Error(`Origin ${origin} not allowed by CORS`));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Accept", "X-Requested-With"],
    optionsSuccessStatus: 200,
  })
);

// 2. Request Parsing Middleware
app.use(express.json({ limit: "25mb" }));
app.use(express.urlencoded({ extended: true, limit: "25mb" }));

// 3. Static Media Uploads Folder (Local environment / fallback)
const UPLOADS_DIR = path.join(__dirname, "../uploads");
if (!fs.existsSync(UPLOADS_DIR)) {
  try {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  } catch (_e) {
    // Ignore in read-only serverless filesystems
  }
}
app.use("/uploads", express.static(UPLOADS_DIR));

// 4. Request Logging (in development)
if (process.env.NODE_ENV !== "production") {
  app.use((req, _res, next) => {
    console.log(`📡 [${req.method}] ${req.url}`);
    next();
  });
}

// 5. Mount API Routes under /api
app.use("/api", apiRouter);

// 6. Root status endpoint
app.get("/", (_req, res) => {
  res.status(200).json({
    name: "Bharat DigiGuru Backend API",
    status: "online",
    port: PORT,
    database: process.env.MONGODB_URI ? "MongoDB Atlas" : "Local JSON",
    endpoints: {
      health: "/api/health",
      portfolio: "/api/portfolio",
      threed: "/api/threed",
      inquiries: "/api/inquiries/submit",
      admin: "/api/admin",
    },
  });
});

// 7. Error Handling Middleware
app.use(errorHandler);

// 8. Initialize Real-Time Socket.IO Server
initializeSocket(server, ALLOWED_ORIGINS);

// 9. Database Connection & Server Initialization
const startServer = async () => {
  await db.connectMongo();

  // In standalone server mode (not serverless lambda), bind to port
  if (!process.env.VERCEL) {
    server.listen(PORT, () => {
      console.log(`
=====================================================
🚀 Bharat DigiGuru Backend Server Running!
📡 REST API:      http://localhost:${PORT}/api
⚡ Socket.IO:     http://localhost:${PORT}
📁 Media Uploads: http://localhost:${PORT}/uploads
🍃 Database:      ${process.env.MONGODB_URI ? "MongoDB Atlas" : "Local JSON DB"}
🔐 Admin Email:   admin@bharatdigiguru.com
=====================================================
      `);
    });
  }
};

startServer().catch((err) => {
  console.error("❌ Failed to start server:", err);
});

export { app, server };
export default app;
