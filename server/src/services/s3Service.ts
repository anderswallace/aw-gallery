import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { config } from "../config/config.js";
import upload from "../config/multerConfig.js";
import { v4 as uuidv4 } from "uuid";

const s3 = new S3Client({
  region: config.awsRegion,
  credentials: {
    accessKeyId: config.awsAccessKey,
    secretAccessKey: config.awsSecretAccessKey,
  },
});

export const uploadFile = async (
  camera: string,
  film: string,
  file: Express.Multer.File
): Promise<string> => {
  const id = uuidv4();
  const params = {
    Bucket: config.awsBucketName,
    Key: `images/${file.originalname}/${id}`,
    Body: file.buffer,
    ContentType: file.mimetype,
  };

  try {
    const command = new PutObjectCommand(params);
    await s3.send(command);

    const fileUrl = `https://${config.awsBucketName}.s3.${config.awsRegion}.amazonaws.com/images/${file.originalname}/${id}`;
    return fileUrl;
  } catch (error) {
    console.error("Error uploading file to S3: ", error);
    throw new Error("Error uploading file to S3");
  }
};
