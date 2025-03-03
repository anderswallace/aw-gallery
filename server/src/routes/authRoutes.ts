import express from "express";
import { login, verifyCookie } from "../controllers/authController.js";

const router = express.Router();

router.post("/login", login);
router.get("/verify", verifyCookie);

export default router;
