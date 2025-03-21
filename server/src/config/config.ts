import dotenv from "dotenv";

dotenv.config();

// Check for required environment variables at runtime
if (process.env.NODE_ENV !== "production") {
  dotenv.config();
}

export const config = {
  jwtSecretKey: process.env.JWT_SECRET || "jwt-secret",
  adminUsername: process.env.USERNAME,
  adminPassword: process.env.PASSWORD,
  awsAccessKey: process.env.AWS_ACCESS_KEY || "",
  awsSecretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  awsRegion: process.env.AWS_REGION || "us-east-2",
  awsBucketName: process.env.AWS_BUCKET_NAME || "bucket_name",
  allowedOrigins: process.env.CORS_ORIGIN || "http://localhost:5173",
  port: process.env.PORT || 4000,
};
