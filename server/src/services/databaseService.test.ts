import { describe, expect, vi, test } from "vitest";
import { afterEach, beforeEach } from "node:test";
import { Image } from "../controllers/photosController";
import { Readable } from "stream";
import { PrismaClient } from "@prisma/client";
import { uploadMetadata } from "./databaseService";

vi.mock("@prisma/client", () => {
  return {
    PrismaClient: vi.fn().mockImplementation(() => {
      return {
        photo: {
          create: vi.fn().mockRejectedValueOnce(new Error("Database error")),
        },
      };
    }),
  };
});

describe("databaseService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  test("Expect error handling when error thrown on uploadMetadata", async () => {
    const url = "https://example.com/photo.jpg";
    const mockFile: Express.Multer.File = {
      fieldname: "file",
      originalname: "test-photo.jpg",
      mimetype: "image/jpeg",
      buffer: Buffer.from("fake-buffer-data"),
      size: 12345,
      encoding: "",
      stream: new Readable(),
      destination: "",
      filename: "",
      path: "",
    };
    const photo: Image = {
      id: "1",
      camera: "Canon AE-1",
      film: "UltraMax 400",
      file: mockFile,
    };

    const prisma = new PrismaClient();

    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    await uploadMetadata(url, photo);

    expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      expect.objectContaining({ message: "Database error" })
    );

    // Cleanup the spy
    consoleErrorSpy.mockRestore();
  });
});
