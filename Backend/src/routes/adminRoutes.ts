import { Router } from "express";
import {
  adminLogin,
  forgotPassword,
  verifyOtp,
  verifyOtpAndResetPassword,
  getAdminProfile,
} from "../controllers/authController.js";
import {
  getPortfolio,
  createPortfolio,
  updatePortfolio,
  deletePortfolio,
} from "../controllers/portfolioController.js";
import {
  getThreeD,
  createThreeD,
  updateThreeD,
  deleteThreeD,
} from "../controllers/threedController.js";
import {
  getInquiries,
  updateInquiryStatus,
  deleteInquiry,
} from "../controllers/inquiriesController.js";
import { uploadMedia } from "../controllers/uploadController.js";
import { authenticateAdmin } from "../middleware/auth.js";
import { upload } from "../middleware/upload.js";

const router = Router();

// Public Admin Auth & Password Recovery
router.post("/login", adminLogin);
router.post("/forgot-password", forgotPassword);
router.post("/verify-otp", verifyOtp);
router.post("/verify-otp-reset-password", verifyOtpAndResetPassword);

// Protected Admin Routes
router.use(authenticateAdmin);

// Admin Profile
router.get("/me", getAdminProfile);

// 1. Portfolio CRUD
router.get("/portfolio", getPortfolio);
router.post("/portfolio", createPortfolio);
router.put("/portfolio/:id", updatePortfolio);
router.delete("/portfolio/:id", deletePortfolio);

// 2. 3D Studio CRUD
router.get("/threed", getThreeD);
router.post("/threed", createThreeD);
router.put("/threed/:id", updateThreeD);
router.delete("/threed/:id", deleteThreeD);

// 3. Inquiries Management
router.get("/inquiries", getInquiries);
router.patch("/inquiries/:id/status", updateInquiryStatus);
router.delete("/inquiries/:id", deleteInquiry);

// File / Media Upload
router.post("/upload", upload.single("file"), uploadMedia);

export default router;
