import authRoutes from "./routes/authRoutes.js";
import photosRoutes from "./routes/photosRoutes.js";
import dataRoutes from "./routes/dataRoutes.js";
import cors from "cors";
import { authenticateToken } from "./middleware/authMiddleware.js";
import cookieParser from "cookie-parser";
import { PrismaClient } from "@prisma/client";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envFile = process.env.NODE_ENV === "test" ? ".env.test" : ".env";
dotenv.config({ path: path.resolve(__dirname, "../", envFile) });

import express from "express";
import { config } from "./config/config.js";

const app = express();
const PORT = Number(process.env.PORT) || 4000;
const HOST = "0.0.0.0";
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

    app.use((req, res, next) => {
      console.log(`[${req.method}] ${req.url}`);
      next();
    });

    app.use(
      cors({
        origin: (origin, callback) => {
          if (!origin || origin === config.allowedOrigins) {
            callback(null, origin);
          } else {
            callback(new Error("Not allowed by CORS"));
          }
        },
        credentials: true,
      })
    );
    app.use(cookieParser());
    app.use(express.json());

    app.use("/auth", authRateLimiter, authRoutes);
    app.use("/photos", authRateLimiter, authenticateToken, photosRoutes);
    app.use("/data", apiRateLimiter, dataRoutes);

    app.listen(PORT, HOST, () => {
      console.log(`Server now running on port: http://${HOST}:${PORT}`);
    });
  } catch (error) {
    console.error("Error while initializing server and seeding: ", error);
  } finally {
    await prisma.$disconnect();
  }
}

initializeServer();
