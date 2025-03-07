import { Request, Response } from "express";
import { fetchPhotos } from "../services/databaseService.js";

export const getData = async (req: Request, res: Response): Promise<void> => {
  try {
    const photos = await fetchPhotos();

    res.json(photos);
  } catch (error) {
    console.error("Error fetching or updating photos: ", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
