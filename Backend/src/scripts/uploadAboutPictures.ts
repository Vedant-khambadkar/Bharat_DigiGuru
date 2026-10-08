import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "../../.env") });

const region = (process.env.AWS_REGION || "us-east-1").trim();
const bucket = (process.env.AWS_BUCKET_NAME || "bharat-digiguru-bucket").trim();
const accessKeyId = process.env.AWS_ACCESS_KEY_ID?.trim();
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY?.trim();
const cloudfrontBase = (process.env.CLOUDFRONT_URL || "https://d1mou18mn47yy7.cloudfront.net").replace(/\/+$/, "");

if (!accessKeyId || !secretAccessKey) {
  console.error("Missing AWS credentials in .env");
  process.exit(1);
}

const s3Client = new S3Client({
  region,
  credentials: {
    accessKeyId,
    secretAccessKey,
  },
});

const picturesDir = path.join(__dirname, "../../../Frontend/src/assets/Picture");

async function uploadFile(fileName: string) {
  const filePath = path.join(picturesDir, fileName);
  if (!fs.existsSync(filePath)) {
    console.error(`File not found: ${filePath}`);
    return;
  }

  const s3Key = `assets/Picture/${fileName}`;
  const fileBuffer = fs.readFileSync(filePath);

  console.log(`Uploading ${fileName} -> s3://${bucket}/${s3Key}...`);

  const putCmd = new PutObjectCommand({
    Bucket: bucket,
    Key: s3Key,
    Body: fileBuffer,
    ContentType: "image/webp",
    ContentDisposition: "inline",
    CacheControl: "public, max-age=31536000, immutable",
  });

  await s3Client.send(putCmd);
  const cloudfrontUrl = `${cloudfrontBase}/${s3Key}`;
  console.log(`✅ Uploaded: ${cloudfrontUrl}`);
}

async function main() {
  const files = fs.readdirSync(picturesDir).filter((f) => f.endsWith(".webp"));
  console.log(`Found ${files.length} WebP files in Picture assets directory.`);

  for (const file of files) {
    await uploadFile(file);
  }

  console.log("\n🎉 All Picture assets uploaded to S3 successfully!");
}

main().catch((err) => {
  console.error("Upload error:", err);
  process.exit(1);
});
