import { Request, Response } from "express";
import { config } from "../config/config.js";
import { uploadFile } from "../services/s3Service.js";

export const createPhoto = async (req: Request, res: Response) => {
  const user: string = req.payload.username;
  const requestMessage: string = req.body.message;
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

  try {
    // TODO: take S3 Object URL and upload to database along with metadata
    const fileUrl = await uploadFile(camera, film, file);
    res.status(200).json({ message: `Uploaded file URL is: ${fileUrl}` });
    return;
  } catch (error) {
    console.error("Error uploading file to S3", error);
    res.status(500).send({ error: "Error uploading file to S3" });
    return;
  }
};
