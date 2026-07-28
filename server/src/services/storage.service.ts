import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import crypto from "crypto";
import dotenv from "dotenv";

dotenv.config();

const region = process.env.AWS_REGION || "ap-south-1";
const bucketName = process.env.AWS_S3_BUCKET_NAME;

const s3Client = new S3Client({
  region,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  }
});

/**
 * Generates a pre-signed URL for direct upload to S3 from the frontend.
 * @param fileName Original file name
 * @param contentType MIME type of the file
 * @param prefix Optional folder prefix (e.g. "avatars", "resumes")
 */
export async function generateUploadUrl(fileName: string, contentType: string, prefix: string = "uploads") {
  if (!bucketName) {
    throw new Error("AWS_S3_BUCKET_NAME is not configured.");
  }

  const ext = fileName.split('.').pop() || "";
  const randomStr = crypto.randomBytes(16).toString("hex");
  const s3Key = `${prefix}/${randomStr}.${ext}`;

  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: s3Key,
    ContentType: contentType,
  });

  // URL expires in 15 minutes
  const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 900 });

  // Return both the URL to upload to, and the key that the file will be saved as.
  return {
    uploadUrl,
    key: s3Key,
    publicUrl: `https://${bucketName}.s3.${region}.amazonaws.com/${s3Key}`
  };
}
