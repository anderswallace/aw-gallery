import express from "express";
import authRoutes from "./routes/authRoutes.js";
import photosRoutes from "./routes/photosRoutes.js";
import dataRoutes from "./routes/dataRoutes.js";
import cors from "cors";
import { authenticateToken } from "./middleware/authMiddleware.js";
import cookieParser from "cookie-parser";
import { PrismaClient } from "@prisma/client";
import rateLimit from "express-rate-limit";

const app = express();
const PORT = 4000;
const prisma = new PrismaClient();

const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min window
  max: 10,
  message: "Too many login attempts. Please try again later.",
  headers: true,
  standardHeaders: true,
  legacyHeaders: false,
});

const apiRateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 min window
  max: 50,
  message: "Too many requests. Please slow down.",
});

async function initializeServer() {
  try {
    //console.log("Checking if database is seeded...");
    //await seed();

    app.use(
      cors({
        origin: "http://localhost:5173",
        credentials: true,
      })
    );
    app.use(cookieParser());
    app.use(express.json());

    app.use("/auth", authRateLimiter, authRoutes);
    app.use("/photos", authRateLimiter, authenticateToken, photosRoutes);
    app.use("/data", apiRateLimiter, dataRoutes);

    app.listen(PORT, () => {
      console.log(`Server now running on port: http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Error while initializing server and seeding: ", error);
  } finally {
    await prisma.$disconnect();
  }
}

initializeServer();
