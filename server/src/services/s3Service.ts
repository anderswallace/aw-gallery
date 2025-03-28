import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { config } from "../config/config.js";
import { Image } from "../controllers/photosController.js";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3 = new S3Client({
  region: config.awsRegion,
  credentials: {
    accessKeyId: config.awsAccessKey,
    secretAccessKey: config.awsSecretAccessKey,
  },
});

// Uploads file to AWS and returns its AWS Key
export const uploadFile = async (photo: Image): Promise<string> => {
  const params = {
    Bucket: config.awsBucketName,
    Key: `${config.awsDirectory}/${photo.file.originalname}/${photo.id}`,
    Body: photo.file.buffer,
    ContentType: photo.file.mimetype,
  };

  try {
    const command = new PutObjectCommand(params);
    await s3.send(command);

    return params.Key;
  } catch (error) {
    console.error("Error uploading file to S3: ", error);
    throw new Error("Error uploading file to S3");
  }
};

// Take AWS Key as input and generate a S3 Pre-Signed URL
export const generatePresignedUrl = async (key: string): Promise<string> => {
  const params = {
    Bucket: config.awsBucketName,
    Key: key,
  };

  const command = new GetObjectCommand(params);

  try {
    const signedUrl = await getSignedUrl(s3, command, { expiresIn: 604800 }); // 7 days lifetime for the signed link
    return signedUrl;
  } catch (error) {
    console.error("Error generating signed URL: ", error);
    throw new Error("Error generating signed URL");
  }
};
