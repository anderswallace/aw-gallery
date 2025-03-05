import express from "express";
import authRoutes from "./routes/authRoutes.js";
import photosRoutes from "./routes/photosRoutes.js";
import cors from "cors";
import { authenticateToken } from "./middleware/authMiddleware.js";
import cookieParser from "cookie-parser";
import { seed } from "./services/databaseService.js";
import { Prisma, PrismaClient } from "@prisma/client";

const app = express();
const PORT = 4000;
const prisma = new PrismaClient();

async function initializeServer() {
  try {
    console.log("Checking if database is seeded...");
    await seed();

    app.use(
      cors({
        origin: "http://localhost:5173",
        credentials: true,
      })
    );
    app.use(cookieParser());
    app.use(express.json());

    app.get("/", (req, res) => {
      console.log("Test");
      res.send("Hello from homepage");
    });

    app.use("/auth", authRoutes);
    app.use("/photos", authenticateToken, photosRoutes);

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
