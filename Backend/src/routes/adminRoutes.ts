import { Router } from "express";
import {
  adminLogin,
  forgotPassword,
  verifyOtp,
  verifyOtpAndResetPassword,
  getAdminProfile,
  listAdminUsers,
  registerAdminUser,
  deleteAdminUser,
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
  getServices,
  createService,
  updateService,
  deleteService,
} from "../controllers/servicesController.js";
import {
  getTeamMembersAdmin,
  createTeamMember,
  updateTeamMember,
  deleteTeamMember,
} from "../controllers/teamController.js";
import {
  getInquiries,
  updateInquiryStatus,
  deleteInquiry,
} from "../controllers/inquiriesController.js";
import {
  uploadMedia,
  getPresignedUrlHandler,
  getPresignedUploadUrlHandler,
} from "../controllers/uploadController.js";
import {
  authenticateAdmin,
  requireManagedAdmin,
  requireSuperOrManagedAdmin,
} from "../middleware/auth.js";
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

// Admin User Management (Super Admin and Managed Admin only)
router.get("/users", requireSuperOrManagedAdmin, listAdminUsers);
router.post("/users", requireSuperOrManagedAdmin, registerAdminUser);
router.delete("/users/:id", requireSuperOrManagedAdmin, deleteAdminUser);

// 1. Portfolio CRUD (Managed Admin, Super Admin, Admin)
router.get("/portfolio", getPortfolio);
router.post("/portfolio", createPortfolio);
router.put("/portfolio/:id", updatePortfolio);
router.delete("/portfolio/:id", deletePortfolio);

// 2. 3D Studio CRUD (ONLY Managed Admin - superAdmin and regular admin are restricted)
router.get("/threed", requireManagedAdmin, getThreeD);
router.post("/threed", requireManagedAdmin, createThreeD);
router.put("/threed/:id", requireManagedAdmin, updateThreeD);
router.delete("/threed/:id", requireManagedAdmin, deleteThreeD);

// 3. Services CRUD (Managed Admin, Super Admin, Admin)
router.get("/services", getServices);
router.post("/services", createService);
router.put("/services/:id", updateService);
router.delete("/services/:id", deleteService);

// 4. Team Members CRUD (Managed Admin, Super Admin, Admin)
router.get("/team", getTeamMembersAdmin);
router.post("/team", createTeamMember);
router.put("/team/:id", updateTeamMember);
router.delete("/team/:id", deleteTeamMember);

// 5. Inquiries Management
router.get("/inquiries", getInquiries);
router.patch("/inquiries/:id/status", updateInquiryStatus);
router.delete("/inquiries/:id", deleteInquiry);

// 5. File / Media Upload & Presigned URLs
router.post("/upload", upload.single("file"), uploadMedia);
router.get("/media/presigned-url", getPresignedUrlHandler);
router.post("/media/presigned-upload", getPresignedUploadUrlHandler);

export default router;

