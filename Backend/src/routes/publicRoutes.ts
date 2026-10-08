import { Router } from "express";
import { getPortfolio, getPortfolioById } from "../controllers/portfolioController.js";
import { getThreeD, getThreeDById } from "../controllers/threedController.js";
import { getServices, getServiceById } from "../controllers/servicesController.js";
import { getTeamMembers, getTeamMemberById } from "../controllers/teamController.js";
import { getStories, getStoryById } from "../controllers/storyController.js";
import { getBlogs, getBlogById } from "../controllers/blogsController.js";
import { submitInquiry } from "../controllers/inquiriesController.js";
import { getPresignedUrlHandler, streamMediaHandler } from "../controllers/uploadController.js";

const router = Router();

// 1. Portfolio Endpoints
router.get("/portfolio", getPortfolio);
router.get("/portfolio/:id", getPortfolioById);

// 2. 3D Studio Endpoints
router.get("/threed", getThreeD);
router.get("/threed/:id", getThreeDById);

// 3. Services Endpoints
router.get("/services", getServices);
router.get("/services/:id", getServiceById);

// 4. Team Members Endpoints
router.get("/team", getTeamMembers);
router.get("/team/:id", getTeamMemberById);

// 5. Stories Endpoints
router.get("/stories", getStories);
router.get("/stories/:id", getStoryById);

// 6. Blogs Endpoints
router.get("/blogs", getBlogs);
router.get("/blogs/:id", getBlogById);

// 7. Client Inquiries / Contact Form Submission
router.post("/inquiries/submit", submitInquiry);


// 4. Secure Media Access / Presigned URLs & Instant Streaming for Private S3 Objects
router.get("/media/url", getPresignedUrlHandler);
router.get("/files/:key/url", getPresignedUrlHandler);
router.get("/media/stream", streamMediaHandler);
router.get("/files/stream", streamMediaHandler);

export default router;
