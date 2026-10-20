import sharp, { Metadata } from "sharp";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { isS3Configured, getS3Client, getCloudFrontUrl, deleteFileFromS3 } from "./s3Service.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const UPLOADS_DIR = path.join(__dirname, "../../uploads");
const BRAND_UPLOADS_DIR = path.join(UPLOADS_DIR, "brand-collaborations");

// Strict 1 MB size limit (1,000,000 bytes)
export const MAX_IMAGE_SIZE_BYTES = 1_000_000;
export const MAX_PIXEL_DIMENSION = 8192;
export const ALLOWED_IMAGE_FORMATS = new Set(["png", "jpeg", "jpg", "webp", "avif", "tiff"]);

export interface ConvertedImageResult {
  buffer: Buffer;
  size: number;
  originalFormat: string;
  format: "webp";
  width?: number;
  height?: number;
}

export interface StoredAssetResult {
  url: string;
  key: string;
  format: "webp";
  originalFormat: string;
  size: number;
  width?: number;
  height?: number;
}

/**
 * Validates image content, dimensions, and converts to optimized WebP.
 * Preserves alpha transparency and respects EXIF orientation.
 */
export async function validateAndConvertToWebP(
  file: Express.Multer.File
): Promise<ConvertedImageResult> {
  if (!file || !file.buffer || file.buffer.length === 0) {
    throw new Error("No image data provided for processing.");
  }

  // 1. Strict 1 MB file size validation (original upload)
  if (file.size > MAX_IMAGE_SIZE_BYTES || file.buffer.length > MAX_IMAGE_SIZE_BYTES) {
    throw new Error(
      `File exceeds maximum upload size limit of 1 MB (${MAX_IMAGE_SIZE_BYTES.toLocaleString()} bytes). Current size: ${file.size.toLocaleString()} bytes.`
    );
  }

  // 2. Inspect actual image content using Sharp metadata (not trusting MIME or extension)
  let metadata: Metadata;
  try {
    metadata = await sharp(file.buffer).metadata();
  } catch (err: any) {
    throw new Error(
      "Corrupted or invalid image file. The uploaded file is not a readable image."
    );
  }

  const format = (metadata.format || "").toLowerCase();
  if (!format || !ALLOWED_IMAGE_FORMATS.has(format)) {
    throw new Error(
      `Unsupported image format "${format || "unknown"}". Supported formats are PNG, JPG, JPEG, and WebP.`
    );
  }

  // 3. Prevent decompression-bomb attacks via excessive pixel dimensions
  if (
    (metadata.width && metadata.width > MAX_PIXEL_DIMENSION) ||
    (metadata.height && metadata.height > MAX_PIXEL_DIMENSION)
  ) {
    throw new Error(
      `Image dimensions (${metadata.width}x${metadata.height}) exceed maximum allowed limit of ${MAX_PIXEL_DIMENSION}x${MAX_PIXEL_DIMENSION} pixels.`
    );
  }

  // 4. Safely transcode image to WebP with orientation fix & transparency preservation
  try {
    const webpBuffer = await sharp(file.buffer)
      .rotate() // auto-orient based on EXIF
      .webp({
        quality: 95,
        effort: 4,
        alphaQuality: 100,
        lossless: format === "png",
      })
      .toBuffer();

    return {
      buffer: webpBuffer,
      size: webpBuffer.length,
      originalFormat: format,
      format: "webp",
      width: metadata.width,
      height: metadata.height,
    };
  } catch (err: any) {
    throw new Error(`Failed to convert image to WebP: ${err.message}`);
  }
}

/**
 * Stores the converted WebP image using the project's media architecture
 * (AWS S3 + CloudFront CDN when configured, or local static uploads fallback).
 */
export async function storeBrandLogo(
  file: Express.Multer.File,
  brandName: string,
  reqHostInfo?: { protocol: string; host: string }
): Promise<StoredAssetResult> {
  // 1. Validate & Convert
  const converted = await validateAndConvertToWebP(file);

  // 2. Clean base filename
  const cleanBase = brandName
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9_-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40) || "brand";

  const uniqueId = `${Date.now()}-${Math.round(Math.random() * 1e6)}`;
  const filename = `${cleanBase}-${uniqueId}.webp`;
  const storageKey = `brand-collaborations/${filename}`;

  // 3. AWS S3 Upload
  if (isS3Configured()) {
    const { client, bucket } = getS3Client();

    const putCmd = new PutObjectCommand({
      Bucket: bucket,
      Key: storageKey,
      Body: converted.buffer,
      ContentType: "image/webp",
      ContentDisposition: "inline",
      CacheControl: "public, max-age=31536000, immutable",
    });

    await client.send(putCmd);
    const cdnUrl = getCloudFrontUrl(storageKey);

    return {
      url: cdnUrl,
      key: storageKey,
      format: "webp",
      originalFormat: converted.originalFormat,
      size: converted.size,
      width: converted.width,
      height: converted.height,
    };
  }

  // 4. Local Filesystem Fallback
  if (!fs.existsSync(BRAND_UPLOADS_DIR)) {
    try {
      fs.mkdirSync(BRAND_UPLOADS_DIR, { recursive: true });
    } catch (_e) {
      // Ignore in read-only environments
    }
  }

  const localFilePath = path.join(BRAND_UPLOADS_DIR, filename);
  fs.writeFileSync(localFilePath, converted.buffer);

  let fileUrl = `/uploads/brand-collaborations/${filename}`;
  if (reqHostInfo?.host) {
    fileUrl = `${reqHostInfo.protocol}://${reqHostInfo.host}/uploads/brand-collaborations/${filename}`;
  }

  return {
    url: fileUrl,
    key: `uploads/brand-collaborations/${filename}`,
    format: "webp",
    originalFormat: converted.originalFormat,
    size: converted.size,
    width: converted.width,
    height: converted.height,
  };
}

/**
 * Safely cleans up a deleted or replaced brand logo asset from S3 or local storage.
 */
export async function cleanupBrandLogoAsset(logoUrlOrKey: string): Promise<boolean> {
  if (!logoUrlOrKey || typeof logoUrlOrKey !== "string") return false;

  try {
    // 1. Handle S3 / CloudFront asset
    if (
      isS3Configured() ||
      logoUrlOrKey.includes("cloudfront.net") ||
      logoUrlOrKey.includes("amazonaws.com") ||
      logoUrlOrKey.startsWith("brand-collaborations/")
    ) {
      return await deleteFileFromS3(logoUrlOrKey);
    }

    // 2. Handle Local Storage asset
    let localRelative = logoUrlOrKey;
    if (logoUrlOrKey.startsWith("http://") || logoUrlOrKey.startsWith("https://")) {
      try {
        const u = new URL(logoUrlOrKey);
        localRelative = u.pathname;
      } catch {}
    }

    if (localRelative.startsWith("/uploads/")) {
      localRelative = localRelative.replace(/^\/uploads\//, "");
      const fullPath = path.join(UPLOADS_DIR, localRelative);
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
        return true;
      }
    }

    return false;
  } catch (err: any) {
    console.warn("⚠️ [ASSET CLEANUP WARNING]:", err.message);
    return false;
  }
}
