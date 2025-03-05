import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { config } from "../config/config.js";
import upload from "../config/multerConfig.js";
import { Photo } from "../controllers/photosController.js";

const s3 = new S3Client({
  region: config.awsRegion,
  credentials: {
    accessKeyId: config.awsAccessKey,
    secretAccessKey: config.awsSecretAccessKey,
  },
});

export const uploadFile = async (photo: Photo): Promise<string> => {
  const params = {
    Bucket: config.awsBucketName,
    Key: `images/${photo.file.originalname}/${photo.id}`,
    Body: photo.file.buffer,
    ContentType: photo.file.mimetype,
  };

  try {
    const command = new PutObjectCommand(params);
    await s3.send(command);

    const fileUrl = `https://${config.awsBucketName}.s3.${config.awsRegion}.amazonaws.com/images/${photo.file.originalname}/${photo.id}`;
    return fileUrl;
  } catch (error) {
    console.error("Error uploading file to S3: ", error);
    throw new Error("Error uploading file to S3");
  }
};
