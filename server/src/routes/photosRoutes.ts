import express from "express";
import { createPhoto } from "../controllers/photosController.js";
import upload from "../config/multerConfig.js";

const router = express.Router();

router.post("/", upload.single("file"), createPhoto);

export default router;
