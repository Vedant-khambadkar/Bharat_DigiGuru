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
const CORS_ORIGINS = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(",").map((s) => s.trim())
  : ["http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173","https://digiguru-mockup.netlify.app"];

// 1. CORS Middleware
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, or Postman)
      if (!origin) return callback(null, true);
      if (CORS_ORIGINS.includes("*") || CORS_ORIGINS.includes(origin)) {
        return callback(null, true);
      }
      return callback(null, true); // Dev fallback for flexible origin matching
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Accept"],
  })
);

// 2. Request Parsing Middleware
app.use(express.json({ limit: "25mb" }));
app.use(express.urlencoded({ extended: true, limit: "25mb" }));

// 3. Static Media Uploads Folder
const UPLOADS_DIR = path.join(__dirname, "../uploads");
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
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
initializeSocket(server, CORS_ORIGINS);

// 9. Connect to Database & Start Server
const startServer = async () => {
  // Connect to MongoDB Atlas (or fallback to local file db)
  await db.connectMongo();

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
};

startServer().catch((err) => {
  console.error("❌ Failed to start server:", err);
});

export { app, server };
