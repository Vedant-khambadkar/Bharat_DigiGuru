import fs from "fs";
import path from "path";
import { execFile } from "child_process";
import dotenv from "dotenv";
import { PutObjectCommand, HeadObjectCommand } from "@aws-sdk/client-s3";
import ffmpegPath from "ffmpeg-static";
import { getS3Client, isS3Configured, getCloudFrontUrl } from "../services/s3Service.js";

// Load environment variables from Backend/.env
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const CLOUDFRONT_BASE = (
  process.env.CLOUDFRONT_URL || "https://d1mou18mn47yy7.cloudfront.net"
).replace(/\/+$/, "");

/**
 * Transcode a video to WebM format using ffmpeg-static.
 */
async function transcodeToWebm(inputPath: string, outputPath: string): Promise<void> {
  const ffmpegBinary = (
    typeof ffmpegPath === "string" ? ffmpegPath : (ffmpegPath as any)?.default || ffmpegPath
  ) as unknown as string;

  if (!ffmpegBinary) {
    throw new Error("ffmpeg-static binary not found!");
  }

  console.log(`🎬 Transcoding ${path.basename(inputPath)} -> ${path.basename(outputPath)}...`);

  return new Promise<void>((resolve, reject) => {
    // High-quality web-optimized VP9 encoding with VP8 fallback
    execFile(
      ffmpegBinary,
      [
        "-y",
        "-i",
        inputPath,
        "-c:v",
        "libvpx-vp9",
        "-crf",
        "30",
        "-b:v",
        "0",
        "-deadline",
        "good",
        "-cpu-used",
        "4",
        "-row-mt",
        "1",
        "-c:a",
        "libopus",
        "-b:a",
        "96k",
        outputPath,
      ],
      (error, _stdout, stderr) => {
        if (error) {
          console.warn(`⚠️ [FFMPEG VP9 Warning]: ${error.message}. Retrying with VP8 standard encoding...`);
          execFile(
            ffmpegBinary,
            [
              "-y",
              "-i",
              inputPath,
              "-c:v",
              "libvpx",
              "-crf",
              "10",
              "-b:v",
              "1.8M",
              "-c:a",
              "libvorbis",
              outputPath,
            ],
            (fallbackErr, _fallbackStdout, fallbackStderr) => {
              if (fallbackErr) {
                console.error(`❌ [FFMPEG Error]:`, fallbackStderr);
                return reject(fallbackErr);
              }
              resolve();
            }
          );
        } else {
          resolve();
        }
      }
    );
  });
}

/**
 * Upload a local file to S3 and return its CloudFront URL.
 */
async function uploadToS3(filePath: string, s3Key: string): Promise<string> {
  const { client, bucket } = getS3Client();
  const fileBuffer = fs.readFileSync(filePath);
  const ext = path.extname(filePath).toLowerCase();

  const mime =
    ext === ".webm"
      ? "video/webm"
      : ext === ".mp4"
      ? "video/mp4"
      : "application/octet-stream";

  console.log(`☁️  Uploading ${s3Key} (${(fileBuffer.length / (1024 * 1024)).toFixed(2)} MB) to S3 bucket "${bucket}"...`);

  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: s3Key,
      Body: fileBuffer,
      ContentType: mime,
      ContentDisposition: "inline",
      CacheControl: "public, max-age=31536000, immutable",
    })
  );

  const cloudFrontUrl = `${CLOUDFRONT_BASE}/${s3Key}`;
  return cloudFrontUrl;
}

async function main() {
  console.log("=================================================");
  console.log("🎥 BHARAT DIGIGURU - VIDEO WEBM CONVERTER & S3 SYNC");
  console.log("=================================================");

  const videosDir = path.resolve(process.cwd(), "../Frontend/src/assets/Videos");

  if (!fs.existsSync(videosDir)) {
    console.error(`❌ Videos directory not found at: ${videosDir}`);
    process.exit(1);
  }

  // Find all MP4 files in the directory
  const files = fs.readdirSync(videosDir);
  const mp4Files = files.filter((f) => f.toLowerCase().endsWith(".mp4"));

  if (mp4Files.length === 0) {
    console.log("ℹ️ No .mp4 files found to convert.");
    return;
  }

  console.log(`📁 Found ${mp4Files.length} MP4 video(s):`, mp4Files);

  const results: Array<{ original: string; webm: string; s3Key: string; cloudFrontUrl: string; sizeDiff: string }> = [];

  for (const mp4File of mp4Files) {
    const baseName = path.basename(mp4File, path.extname(mp4File));
    const inputPath = path.join(videosDir, mp4File);
    const outputPath = path.join(videosDir, `${baseName}.webm`);

    const originalStats = fs.statSync(inputPath);
    const origSizeMB = (originalStats.size / (1024 * 1024)).toFixed(2);

    console.log(`\n-------------------------------------------------`);
    console.log(`Processing: ${mp4File} (Original size: ${origSizeMB} MB)`);

    // 1. Convert to WebM
    await transcodeToWebm(inputPath, outputPath);

    const webmStats = fs.statSync(outputPath);
    const webmSizeMB = (webmStats.size / (1024 * 1024)).toFixed(2);
    const savedPercent = (((originalStats.size - webmStats.size) / originalStats.size) * 100).toFixed(1);

    console.log(`✅ Converted to ${baseName}.webm (WebM size: ${webmSizeMB} MB, Reduced by: ${savedPercent}%)`);

    // 2. Upload to S3
    const s3Key = `assets/Videos/${baseName}.webm`;
    let cloudFrontUrl = `${CLOUDFRONT_BASE}/${s3Key}`;

    if (isS3Configured()) {
      cloudFrontUrl = await uploadToS3(outputPath, s3Key);
      console.log(`🌐 CloudFront URL: ${cloudFrontUrl}`);
    } else {
      console.warn("⚠️ S3 is not configured in .env; skipped upload.");
    }

    results.push({
      original: mp4File,
      webm: `${baseName}.webm`,
      s3Key,
      cloudFrontUrl,
      sizeDiff: `${origSizeMB}MB -> ${webmSizeMB}MB (-${savedPercent}%)`,
    });
  }

  console.log("\n=================================================");
  console.log("🎉 ALL VIDEOS CONVERTED & SYNCED SUCCESSFULLY!");
  console.log("=================================================");
  console.table(results);
}

main().catch((err) => {
  console.error("❌ Fatal Error:", err);
  process.exit(1);
});
