import multer from "multer";

// Use MemoryStorage so uploads work efficiently across serverless lambdas and S3 streaming
const storage = multer.memoryStorage();

export const upload = multer({
  storage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB max file size (supports HD 3D models and video assets)
  },
  fileFilter: (_req, file, cb) => {
    // Allowed media types (images, videos, documents, 3d models)
    const allowedMime = /image|video|pdf|model|gltf|glb|application\/octet-stream/;
    if (
      allowedMime.test(file.mimetype) ||
      /\.(glb|gltf|fbx|obj|mp4|webm|mov|jpg|jpeg|png|webp|svg)$/i.test(file.originalname)
    ) {
      cb(null, true);
    } else {
      cb(new Error("Unsupported media format. Please upload an image, video, or 3D asset."));
    }
  },
});
