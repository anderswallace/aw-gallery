import { describe, expect, vi, test, Mock } from "vitest";
import request from "supertest";
import express, { response } from "express";
import { afterEach, beforeEach } from "node:test";
import cookieParser from "cookie-parser";
import dataRoutes from "../routes/dataRoutes";
import { fetchPhotos } from "../services/databaseService";
import { Photo } from "@prisma/client";

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use("/data", dataRoutes);

vi.mock("../services/databaseService", () => ({
  fetchPhotos: vi.fn(),
}));

describe("dataController", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  test("Server error returns code 500", async () => {
    // suppress console.error in test
    vi.spyOn(console, "error").mockImplementation(() => undefined);

    const mockFetchPhotos = fetchPhotos as Mock;
    mockFetchPhotos.mockRejectedValue(new Error("Fetch Photos failed"));

    const response = await request(app)
      .get("/data")
      .set("Content-Type", "application/json");

    expect(response.status).toBe(500);
    expect(response.body.error).toBe("Internal Server Error");
  });

  test("Valid response from database", async () => {
    const mockPhotoData: Photo = {
      id: "sampleId",
      url: "sampleUrl",
      filename: "sampleFilename",
      camera: "Canon AE-1",
      film: "UltraMax 400",
      uploadedAt: new Date(),
      expiresAt: new Date(),
    };

    const mockFetchPhotos = fetchPhotos as Mock;
    mockFetchPhotos.mockResolvedValueOnce(mockPhotoData);

    const response = await request(app)
      .get("/data")
      .set("Content-Type", "application/json");

    expect(response.status).toBe(200);
  });
});
