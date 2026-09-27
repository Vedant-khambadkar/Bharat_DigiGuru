import { S3Client, PutBucketCorsCommand, GetBucketCorsCommand } from "@aws-sdk/client-s3";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, "../../.env") });

async function configureBucketCors() {
  const region = (process.env.AWS_REGION || "us-east-1").trim();
  const bucket = (process.env.AWS_BUCKET_NAME || process.env.AWS_S3_BUCKET || "").trim();
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID?.trim();
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY?.trim();

  if (!bucket) {
    console.error("❌ AWS_BUCKET_NAME is missing from .env");
    process.exit(1);
  }

  console.log(`🔧 Configuring S3 Bucket CORS for "${bucket}" in region "${region}"...`);

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

  try {
    const corsCommand = new PutBucketCorsCommand({
      Bucket: bucket,
      CORSConfiguration: {
        CORSRules: [
          {
            AllowedHeaders: ["*"],
            AllowedMethods: ["GET", "HEAD", "PUT", "POST", "DELETE"],
            AllowedOrigins: ["*"],
            ExposeHeaders: ["ETag", "Content-Range", "Accept-Ranges", "Content-Length", "Content-Type"],
            MaxAgeSeconds: 3600,
          },
        ],
      },
    });

    await client.send(corsCommand);
    console.log(`✅ [S3 CORS SUCCESS] Successfully applied CORS rules to bucket "${bucket}".`);

    const getCorsCommand = new GetBucketCorsCommand({ Bucket: bucket });
    const res = await client.send(getCorsCommand);
    console.log("📋 Current S3 CORS Rules:", JSON.stringify(res.CORSRules, null, 2));
  } catch (err: any) {
    console.error("❌ [S3 CORS ERROR]:", err.message);
  }
}

configureBucketCors();
