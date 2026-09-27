import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import path from "path";
import fs from "fs";
import os from "os";
import { execFile } from "child_process";
import sharp from "sharp";
import ffmpegPath from "ffmpeg-static";

/**
 * Returns the S3 Client.
 * Production (EC2): Resolves EC2 IAM Role automatically via IMDS.
 * Local Development: Uses AWS_ACCESS_KEY_ID / AWS_SECRET_ACCESS_KEY if present in .env.
 */
export function getS3Client(): { client: S3Client; bucket: string; region: string } {
  const region = (process.env.AWS_REGION || "us-east-1").trim();
  const bucket = (process.env.AWS_BUCKET_NAME || process.env.AWS_S3_BUCKET || "").trim();
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID?.trim();
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY?.trim();

  if (!bucket) {
    throw new Error("AWS_BUCKET_NAME is not defined in environment variables.");
  }

  const client = new S3Client({
    region,
    ...(accessKeyId && secretAccessKey
      ? {
          credentials: {
            accessKeyId,
            secretAccessKey,
          },
        }
      : {}),
  });

  return { client, bucket, region };
}

export const isS3Configured = (): boolean => {
  const bucket = (process.env.AWS_BUCKET_NAME || process.env.AWS_S3_BUCKET || "").trim();
  return Boolean(bucket);
};

/**
 * Generates a clean, cached CloudFront CDN URL for any public asset key or legacy S3 URL.
 * Example: uploads/photo.webp -> https://d1mou18mn47yy7.cloudfront.net/uploads/photo.webp
 */
export function getCloudFrontUrl(keyOrUrl: string): string {
  if (!keyOrUrl || typeof keyOrUrl !== "string") return "";
  const trimmed = keyOrUrl.trim();
  if (!trimmed) return "";

  const cloudFrontDomain = (
    process.env.CLOUDFRONT_URL || "https://d1mou18mn47yy7.cloudfront.net"
  ).replace(/\/+$/, "");

  // If already a CloudFront URL, strip query params and return clean URL
  if (trimmed.startsWith(cloudFrontDomain)) {
    return trimmed.split("?")[0];
  }

  let key = trimmed;
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    try {
      const urlObj = new URL(trimmed);
      key = urlObj.pathname.replace(/^\/+/, "");
      const bucket = (process.env.AWS_BUCKET_NAME || "bharat-digiguru-bucket").trim();
      if (key.startsWith(`${bucket}/`)) {
        key = key.replace(`${bucket}/`, "");
      }
    } catch {
      key = trimmed;
    }
  }

  // Normalize key: remove leading slashes and query strings
  const cleanKey = key.split("?")[0].replace(/^\/+/, "");
  return `${cloudFrontDomain}/${cleanKey}`;
}

export interface S3UploadResult {
  url: string;
  key: string;
  bucket: string;
  size: number;
  mimetype: string;
}

/**
 * Converts any video buffer (MP4, MOV, AVI, MKV) to optimized WebM format using ffmpeg-static.
 * WebM provides superior compression, low latency, and native HTML5 video streaming.
 */
export async function convertVideoToWebm(
  inputBuffer: Buffer,
  originalFilename: string
): Promise<{ buffer: Buffer; mimetype: string; ext: string; size: number }> {
  const origExt = path.extname(originalFilename).toLowerCase();

  // If already WebM, return directly
  if (origExt === ".webm") {
    return {
      buffer: inputBuffer,
      mimetype: "video/webm",
      ext: ".webm",
      size: inputBuffer.length,
    };
  }

  const tempDir = os.tmpdir();
  const inputTempPath = path.join(tempDir, `vid_in_${Date.now()}_${Math.round(Math.random() * 1e6)}${origExt}`);
  const outputTempPath = path.join(tempDir, `vid_out_${Date.now()}_${Math.round(Math.random() * 1e6)}.webm`);

  try {
    await fs.promises.writeFile(inputTempPath, inputBuffer);

    const ffmpegBinary = (typeof ffmpegPath === "string" ? ffmpegPath : (ffmpegPath as any)?.default || ffmpegPath) as unknown as string;

    if (ffmpegBinary) {
      console.log(`🎬 [FFMPEG] Transcoding ${originalFilename} (${(inputBuffer.length / (1024 * 1024)).toFixed(2)} MB) -> WebM...`);

      await new Promise<void>((resolve, reject) => {
        // Fast WebM transcode: VP9 with realtime deadline and Opus audio for quick web loading
        execFile(
          ffmpegBinary,
          [
            "-y",
            "-i",
            inputTempPath,
            "-c:v",
            "libvpx-vp9",
            "-crf",
            "32",
            "-b:v",
            "0",
            "-deadline",
            "realtime",
            "-cpu-used",
            "4",
            "-c:a",
            "libopus",
            "-b:a",
            "128k",
            outputTempPath,
          ],
          (error) => {
            if (error) {
              // Fallback to VP8 if VP9 codec fails on specific source
              console.warn("⚠️ [FFMPEG] VP9 failed, falling back to VP8 transcode:", error.message);
              execFile(
                ffmpegBinary,
                [
                  "-y",
                  "-i",
                  inputTempPath,
                  "-c:v",
                  "libvpx",
                  "-crf",
                  "12",
                  "-b:v",
                  "1.5M",
                  "-c:a",
                  "libvorbis",
                  outputTempPath,
                ],
                (fallbackErr) => {
                  if (fallbackErr) reject(fallbackErr);
                  else resolve();
                }
              );
            } else {
              resolve();
            }
          }
        );
      });

      if (fs.existsSync(outputTempPath)) {
        const outputBuffer = await fs.promises.readFile(outputTempPath);
        console.log(`✅ [FFMPEG] Transcoded successfully: ${originalFilename} -> WebM (${(outputBuffer.length / (1024 * 1024)).toFixed(2)} MB)`);
        return {
          buffer: outputBuffer,
          mimetype: "video/webm",
          ext: ".webm",
          size: outputBuffer.length,
        };
      }
    }
  } catch (err: any) {
    console.warn("⚠️ [FFMPEG TRANSCODE WARNING]:", err.message, "- Uploading with video/webm container headers");
  } finally {
    try {
      if (fs.existsSync(inputTempPath)) await fs.promises.unlink(inputTempPath);
      if (fs.existsSync(outputTempPath)) await fs.promises.unlink(outputTempPath);
    } catch (_e) {}
  }

  // Fallback: Retain buffer but set WebM stream headers
  return {
    buffer: inputBuffer,
    mimetype: "video/webm",
    ext: ".webm",
    size: inputBuffer.length,
  };
}

/**
 * Optimizes and processes uploaded files:
 * 1. Images (JPEG, PNG, AVIF, TIFF, BMP) -> Converted automatically to WebP.
 * 2. Videos (MP4, MOV, WebM, etc.) -> Converted automatically to WebM with inline streaming headers.
 * 3. 3D Models (GLB, GLTF) -> Configured with model/gltf-binary MIME type.
 */
export async function processFileForUpload(file: Express.Multer.File): Promise<{
  buffer: Buffer;
  mimetype: string;
  ext: string;
  size: number;
}> {
  const originalExt = path.extname(file.originalname).toLowerCase();

  // 1. Image Processing -> WebP Conversion
  const isRasterImage =
    file.mimetype.startsWith("image/") &&
    file.mimetype !== "image/svg+xml" &&
    file.mimetype !== "image/gif";

  if (isRasterImage) {
    try {
      const webpBuffer = await sharp(file.buffer)
        .rotate() // Auto-orient image based on EXIF orientation metadata (fixes 90° sideways/rotation issue)
        .webp({ quality: 85, effort: 4 })
        .toBuffer();

      console.log(`🖼️ [IMAGE CONVERSION] Converted ${file.originalname} (${file.size} bytes) -> WebP (${webpBuffer.length} bytes) [Auto-Oriented]`);

      return {
        buffer: webpBuffer,
        mimetype: "image/webp",
        ext: ".webp",
        size: webpBuffer.length,
      };
    } catch (err: any) {
      console.warn("⚠️ [SHARP] Failed to convert image to WebP, keeping original format:", err.message);
    }
  }

  // 2. Video Processing -> WebM Transcoding
  const isVideo = file.mimetype.startsWith("video/") || /\.(webm|mp4|mov|mkv|avi)$/i.test(file.originalname);
  if (isVideo) {
    return await convertVideoToWebm(file.buffer, file.originalname);
  }

  // 3. 3D Model & General File Handling
  let finalMime = file.mimetype;
  if (originalExt === ".glb") finalMime = "model/gltf-binary";
  if (originalExt === ".gltf") finalMime = "model/gltf+json";

  return {
    buffer: file.buffer,
    mimetype: finalMime,
    ext: originalExt,
    size: file.size,
  };
}

/**
 * Uploads a file buffer directly to private AWS S3 bucket.
 * All images are automatically converted to .webp before upload.
 * Videos are transcoded to .webm.
 * Returns the permanent, clean CloudFront CDN URL for public delivery.
 */
export async function uploadFileToS3(
  file: Express.Multer.File,
  folder = "uploads"
): Promise<S3UploadResult> {
  const { client, bucket, region } = getS3Client();

  // 1. Process File (Convert images to WebP, transcode videos to WebM)
  const processed = await processFileForUpload(file);

  const cleanBase = path.basename(file.originalname, path.extname(file.originalname)).replace(/[^a-zA-Z0-9_-]/g, "_");
  const uniqueKey = `${folder}/${Date.now()}-${Math.round(Math.random() * 1e9)}-${cleanBase}${processed.ext}`;

  console.log(`🔒 [AWS S3 PRIVATE UPLOAD] Storing object in bucket "${bucket}" (Region: ${region}) with key "${uniqueKey}" [Type: ${processed.mimetype}]`);

  const putCommand = new PutObjectCommand({
    Bucket: bucket,
    Key: uniqueKey,
    Body: processed.buffer,
    ContentType: processed.mimetype,
    ContentDisposition: "inline", // Allows browsers & CDN to play videos and display images directly
  });

  await client.send(putCommand);

  // 2. Generate clean, cached CloudFront CDN URL
  const cloudFrontUrl = getCloudFrontUrl(uniqueKey);
  console.log(`🌐 [CLOUDFRONT CDN] Generated CDN URL: ${cloudFrontUrl}`);

  return {
    url: cloudFrontUrl,
    key: uniqueKey,
    bucket,
    size: processed.size,
    mimetype: processed.mimetype,
  };
}

/**
 * Generates a temporary Presigned Download/View URL (GET) for a private S3 object if required.
 */
export async function getPresignedDownloadUrl(
  fileKeyOrUrl: string,
  expiresInSeconds = 900
): Promise<{ url: string; key: string; expiresIn: number }> {
  const { client, bucket } = getS3Client();

  let key = fileKeyOrUrl;
  if (fileKeyOrUrl.startsWith("http://") || fileKeyOrUrl.startsWith("https://")) {
    try {
      const urlObj = new URL(fileKeyOrUrl);
      key = urlObj.pathname.replace(/^\/+/, "");
      if (key.startsWith(`${bucket}/`)) {
        key = key.replace(`${bucket}/`, "");
      }
    } catch {
      key = fileKeyOrUrl;
    }
  }

  // Verify object existence in S3
  try {
    const headCommand = new HeadObjectCommand({
      Bucket: bucket,
      Key: key,
    });
    await client.send(headCommand);
  } catch (err: any) {
    if (err.name === "NotFound" || err.$metadata?.httpStatusCode === 404) {
      throw new Error(`S3 Object "${key}" not found (NoSuchKey).`);
    }
    if (err.name === "AccessDenied" || err.$metadata?.httpStatusCode === 403) {
      throw new Error(`Access Denied to S3 Object "${key}". Check IAM Role permissions.`);
    }
  }

  const getCommand = new GetObjectCommand({
    Bucket: bucket,
    Key: key,
    ResponseContentDisposition: "inline",
  });

  const url = await getSignedUrl(client, getCommand, {
    expiresIn: expiresInSeconds,
  });

  return {
    url,
    key,
    expiresIn: expiresInSeconds,
  };
}

/**
 * Generates a Presigned Upload URL (PUT) for direct client-to-S3 uploads if required.
 */
export async function getPresignedUploadUrl(
  fileName: string,
  contentType: string,
  folder = "uploads",
  expiresInSeconds = 900
): Promise<{ uploadUrl: string; key: string; expiresIn: number }> {
  const { client, bucket } = getS3Client();

  const isImage = contentType.startsWith("image/") && contentType !== "image/svg+xml" && contentType !== "image/gif";
  const ext = isImage ? ".webp" : path.extname(fileName).toLowerCase();
  const targetContentType = isImage ? "image/webp" : contentType;

  const cleanBase = path.basename(fileName, path.extname(fileName)).replace(/[^a-zA-Z0-9_-]/g, "_");
  const uniqueKey = `${folder}/${Date.now()}-${Math.round(Math.random() * 1e9)}-${cleanBase}${ext}`;

  const putCommand = new PutObjectCommand({
    Bucket: bucket,
    Key: uniqueKey,
    ContentType: targetContentType,
    ContentDisposition: "inline",
  });

  const uploadUrl = await getSignedUrl(client, putCommand, {
    expiresIn: expiresInSeconds,
  });

  return {
    uploadUrl,
    key: uniqueKey,
    expiresIn: expiresInSeconds,
  };
}

/**
 * Deletes a file from AWS S3 using its key or full URL.
 */
export async function deleteFileFromS3(fileKeyOrUrl: string): Promise<boolean> {
  try {
    const { client, bucket } = getS3Client();

    let key = fileKeyOrUrl;
    if (fileKeyOrUrl.startsWith("http://") || fileKeyOrUrl.startsWith("https://")) {
      const urlObj = new URL(fileKeyOrUrl);
      key = urlObj.pathname.replace(/^\/+/, "");
      if (key.startsWith(`${bucket}/`)) {
        key = key.replace(`${bucket}/`, "");
      }
    }

    const command = new DeleteObjectCommand({
      Bucket: bucket,
      Key: key,
    });

    await client.send(command);
    console.log(`🗑️ [AWS S3] Object deleted: ${key}`);
    return true;
  } catch (err: any) {
    console.error(`❌ [AWS S3 DELETE ERROR]:`, err.message);
    return false;
  }
}
