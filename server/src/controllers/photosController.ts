import { Request, Response } from "express";
import { config } from "../config/config.js";
import { uploadFile, generatePresignedUrl } from "../services/s3Service.js";
import { v4 as uuidv4 } from "uuid";
import { uploadMetadata } from "../services/databaseService.js";

export interface Photo {
  id: string;
  camera: string;
  film: string;
  file: Express.Multer.File;
}

export const createPhoto = async (req: Request, res: Response) => {
  const user: string = req.payload.username;
  if (user !== config.adminUsername) {
    res.status(403).json({
      message: `${user}: You do not have permission to access this page.`,
    });
    return;
  }

  const file = req.file;

  if (!file) {
    res.status(400).send("No file uploaded");
    return;
  }

  const { camera, film } = req.body;

  const photo: Photo = {
    id: uuidv4(),
    camera: camera,
    film: film,
    file: file,
  };

  try {
    const fileKey = await uploadFile(photo);
    const signedUrl = await generatePresignedUrl(fileKey);
    await uploadMetadata(signedUrl, photo);
    res.status(200).json({ message: `Uploaded file URL is: ${signedUrl}` });
    return;
  } catch (error) {
    console.error("Error uploading file to S3", error);
    res.status(500).send({ error: "Error uploading file to S3" });
    return;
  }
};
