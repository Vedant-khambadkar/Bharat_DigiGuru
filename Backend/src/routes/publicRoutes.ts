import { Router } from "express";
import { getPortfolio, getPortfolioById } from "../controllers/portfolioController.js";
import { getThreeD, getThreeDById } from "../controllers/threedController.js";
import { submitInquiry } from "../controllers/inquiriesController.js";

const router = Router();

// 1. Portfolio Endpoints
router.get("/portfolio", getPortfolio);
router.get("/portfolio/:id", getPortfolioById);

// 2. 3D Studio Endpoints
router.get("/threed", getThreeD);
router.get("/threed/:id", getThreeDById);

// 3. Client Inquiries / Contact Form Submission
router.post("/inquiries/submit", submitInquiry);

export default router;
