import { Request, Response } from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import {
  uploadFileToS3,
  getPresignedUploadUrl,
  isS3Configured,
  processFileForUpload,
  getS3Client,
  getCloudFrontUrl,
} from "../services/s3Service.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const UPLOADS_DIR = path.join(__dirname, "../../uploads");

/**
 * Handles multipart file uploads:
 * In S3 mode: Streams to private S3 bucket and returns clean CloudFront CDN URL.
 * In local mode: Saves to ./uploads and returns local URL.
 */
export const uploadMedia = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({
        success: false,
        message: "No file was uploaded.",
      });
      return;
    }

    // 1. Direct AWS S3 Private Upload + CloudFront CDN Delivery
    if (isS3Configured()) {
      const s3Result = await uploadFileToS3(req.file, "uploads");

      res.status(200).json({
        success: true,
        message: "File uploaded securely to AWS S3 and served via CloudFront CDN.",
        storage: "s3",
        key: s3Result.key,
        filename: path.basename(s3Result.key),
        originalName: req.file.originalname,
        size: s3Result.size,
        mimetype: s3Result.mimetype,
        url: s3Result.url, // Clean permanent CloudFront URL: https://d1mou18mn47yy7.cloudfront.net/uploads/...
        data: {
          key: s3Result.key,
          url: s3Result.url,
          bucket: s3Result.bucket,
          filename: path.basename(s3Result.key),
          mimetype: s3Result.mimetype,
          size: s3Result.size,
        },
      });
      return;
    }

    // 2. Local Fallback (Only if AWS_BUCKET_NAME is completely unset in .env)
    const processed = await processFileForUpload(req.file);

    if (!fs.existsSync(UPLOADS_DIR)) {
      try {
        fs.mkdirSync(UPLOADS_DIR, { recursive: true });
      } catch (_e) {
        // Handle read-only filesystem
      }
    }

    const cleanBase = path.basename(req.file.originalname, path.extname(req.file.originalname)).replace(/[^a-zA-Z0-9_-]/g, "_");
    const filename = `${cleanBase}-${Date.now()}-${Math.round(Math.random() * 1e9)}${processed.ext}`;
    const filePath = path.join(UPLOADS_DIR, filename);

    fs.writeFileSync(filePath, processed.buffer);

    const host = req.get("host");
    const protocol = req.protocol;
    const fileUrl = `${protocol}://${host}/uploads/${filename}`;

    res.status(200).json({
      success: true,
      message: "File uploaded to local storage successfully.",
      storage: "local",
      key: `uploads/${filename}`,
      filename,
      originalName: req.file.originalname,
      size: processed.size,
      mimetype: processed.mimetype,
      url: fileUrl,
      data: {
        key: `uploads/${filename}`,
        url: fileUrl,
        filename,
      },
    });
  } catch (err: any) {
    console.error("❌ [UPLOAD ERROR]:", err);
    res.status(500).json({
      success: false,
      message: err.message || "Failed to upload file to AWS S3.",
    });
  }
};

/**
 * Returns CloudFront URL or Presigned GET URL on demand for any stored asset key.
 * GET /api/media/url?key=uploads/...
 */
export const getPresignedUrlHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const keyParam = (req.query.key as string) || (req.params.key as string);
    if (!keyParam) {
      res.status(400).json({
        success: false,
        message: "Object 'key' query parameter is required.",
      });
      return;
    }

    // Generate clean CloudFront CDN URL by default
    const cloudFrontUrl = getCloudFrontUrl(keyParam);

    res.status(200).json({
      success: true,
      url: cloudFrontUrl,
      key: keyParam,
    });
  } catch (err: any) {
    console.error("❌ [MEDIA URL ERROR]:", err.message);
    const status = err.message.includes("not found") ? 404 : 500;
    res.status(status).json({
      success: false,
      message: err.message,
    });
  }
};

/**
 * Generates a Presigned PUT URL for direct client-to-S3 uploads if needed.
 * POST /api/admin/media/presigned-upload
 */
export const getPresignedUploadUrlHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const { filename, contentType, folder } = req.body;

    if (!filename || !contentType) {
      res.status(400).json({
        success: false,
        message: "'filename' and 'contentType' are required in request body.",
      });
      return;
    }

    const expiresIn = parseInt(req.body.expiresIn as string, 10) || 900;
    const result = await getPresignedUploadUrl(filename, contentType, folder || "uploads", expiresIn);

    res.status(200).json({
      success: true,
      uploadUrl: result.uploadUrl,
      key: result.key,
      expiresIn: result.expiresIn,
    });
  } catch (err: any) {
    console.error("❌ [PRESIGNED PUT ERROR]:", err.message);
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

/**
 * Streams private S3 video/media assets directly with HTTP 206 Partial Content (Range requests)
 * for instant fallback and seeking in HTML5 video players.
 * GET /api/media/stream?key=uploads/...
 */
export const streamMediaHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const keyParam = (req.query.key as string) || (req.params.key as string);
    if (!keyParam) {
      res.status(400).json({ success: false, message: "Missing 'key' query parameter." });
      return;
    }

    if (!isS3Configured()) {
      // Local fallback
      const localPath = path.join(__dirname, "../../", keyParam);
      if (fs.existsSync(localPath)) {
        res.sendFile(localPath);
      } else {
        res.status(404).json({ success: false, message: "File not found locally." });
      }
      return;
    }

    const { client, bucket } = getS3Client();
    let key = keyParam;
    if (key.startsWith("http://") || key.startsWith("https://")) {
      try {
        const urlObj = new URL(key);
        key = urlObj.pathname.replace(/^\/+/, "");
        if (key.startsWith(`${bucket}/`)) key = key.replace(`${bucket}/`, "");
      } catch {
        key = keyParam;
      }
    }

    const rangeHeader = req.headers.range;

    const command = new GetObjectCommand({
      Bucket: bucket,
      Key: key,
      Range: rangeHeader,
      ResponseContentDisposition: "inline",
    });

    const s3Response = await client.send(command);

    // Set appropriate streaming headers
    if (s3Response.ContentType) {
      res.setHeader("Content-Type", s3Response.ContentType);
    } else {
      res.setHeader("Content-Type", "video/webm");
    }

    res.setHeader("Accept-Ranges", "bytes");
    res.setHeader("Content-Disposition", "inline");
    res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
    if (s3Response.ETag) {
      res.setHeader("ETag", s3Response.ETag);
    }

    if (s3Response.ContentRange) {
      res.status(206);
      res.setHeader("Content-Range", s3Response.ContentRange);
    }
    if (s3Response.ContentLength !== undefined) {
      res.setHeader("Content-Length", s3Response.ContentLength);
    }

    if (s3Response.Body) {
      (s3Response.Body as any).pipe(res);
    } else {
      res.status(404).end();
    }
  } catch (err: any) {
    console.error("❌ [STREAM ERROR]:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};
