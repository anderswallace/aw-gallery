import { describe, expect, vi, test, Mock } from "vitest";
import request from "supertest";
import express from "express";
import { afterEach, beforeEach } from "node:test";
import cookieParser from "cookie-parser";
import multer from "multer";
import { createPhoto } from "./photosController";
import { config } from "../config/config";
import { generatePresignedUrl, uploadFile } from "../services/s3Service";

const app = express();
app.use(express.json());
app.use(cookieParser());

// Mock the services that make requests to external services
vi.mock("../services/s3Service", () => ({
  uploadFile: vi.fn(),
  generatePresignedUrl: vi.fn(),
}));

vi.mock("../services/databaseService", () => ({
  uploadMetadata: vi.fn().mockResolvedValue(undefined),
}));

app.post(
  "/photos",
  multer().single("file"),
  (req, res, next) => {
    req.payload = { username: config.adminUsername };
    next();
  },
  createPhoto
);

describe("photosController", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  test("Return 200 status when admin makes request", async () => {
    const mockedUploadFile = uploadFile as Mock;
    mockedUploadFile.mockResolvedValueOnce("mockFileKey");
    const mockedSignedUrl = generatePresignedUrl as Mock;
    mockedSignedUrl.mockResolvedValueOnce("mockSignedUrl");

    const response = await request(app)
      .post("/photos")
      .field("camera", "Canon AE-1")
      .field("film", "UltraMax 400")
      .attach("file", Buffer.from("dummy file content"), "test.jpg");

    expect(response.status).toBe(200);
    expect(response.body.message).toBe("Uploaded file URL is: mockSignedUrl");
  });

  test("Return 400 error when no file attached", async () => {
    const response = await request(app)
      .post("/photos")
      .field("camera", "Canon AE-1")
      .field("film", "UltraMax 400");

    expect(response.status).toBe(400);
  });

  test("Return 500 error when uploading to S3 fails", async () => {
    // suppress console.error in test
    vi.spyOn(console, "error").mockImplementation(() => undefined);

    const mockedUploadFile = uploadFile as Mock;
    mockedUploadFile.mockRejectedValueOnce(new Error("Uploading to S3 failed"));

    const response = await request(app)
      .post("/photos")
      .field("camera", "Canon AE-1")
      .field("film", "UltraMax 400")
      .attach("file", Buffer.from("dummy file content"), "test.jpg");

    expect(response.status).toBe(500);
    expect(response.body.error).toBe("Error uploading file to S3");
  });
});
