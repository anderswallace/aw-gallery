import { describe, expect, vi, test, Mock } from "vitest";
import { afterEach, beforeEach } from "node:test";
import { Image } from "../controllers/photosController";
import { Readable } from "stream";
import { PrismaClient, Photo } from "@prisma/client";
import { uploadMetadata } from "./databaseService";
import { fetchPhotos } from "./databaseService";
import { generatePresignedUrl } from "./s3Service";

vi.mock("@prisma/client", () => {
  class MockPrismaClient {
    photo: any;
  }
  const createMock = vi.fn();
  const updateMock = vi.fn();
  const findManyMock = vi.fn();
  MockPrismaClient.prototype.photo = {
    create: createMock,
    update: updateMock,
    findMany: findManyMock,
  };
  return {
    PrismaClient: MockPrismaClient,
  };
});

vi.mock("./s3Service", () => ({
  generatePresignedUrl: vi.fn(),
}));

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

    (PrismaClient.prototype.photo.create as Mock).mockRejectedValue(
      new Error("Database error")
    );

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

  test("Expect updated signedUrl to return when signedUrl is expired", async () => {
    // Fix the system time to a known date.
    const fixedDate = new Date("2025-01-01T00:00:00.000Z");
    vi.useFakeTimers({ now: fixedDate });

    const now = new Date();
    const mockExpireTime = now.getTime() - 1000 * 60 * 60 * 24 * 2; // mock time that has expired

    const mockPhotoData: Photo[] = [
      {
        id: "sampleId",
        url: "sampleUrl",
        filename: "sampleFilename",
        camera: "Canon AE-1",
        film: "UltraMax 400",
        uploadedAt: new Date(),
        expiresAt: new Date(mockExpireTime),
      },
    ];

    const mockPhotoDataUpdated: Photo[] = [
      {
        id: "sampleId",
        url: "sampleUrl",
        filename: "sampleFilename",
        camera: "Canon AE-1",
        film: "UltraMax 400",
        uploadedAt: new Date(),
        expiresAt: new Date(),
      },
    ];

    const mockedSignedUrl = "https://mockedurl.com";
    const mockedGenerateSignedUrl = generatePresignedUrl as Mock;
    mockedGenerateSignedUrl.mockResolvedValueOnce(mockedSignedUrl);

    // Mock findMany to return dummy photo array with expired photo
    (PrismaClient.prototype.photo.findMany as Mock).mockResolvedValue(
      mockPhotoData
    );
    (PrismaClient.prototype.photo.update as Mock).mockResolvedValue(
      mockPhotoDataUpdated
    );

    const data = await fetchPhotos();
    expect(mockedGenerateSignedUrl).toHaveBeenCalledTimes(1);
    expect(data[0].url).toBe(mockedSignedUrl);

    // Restore real timers after the test.
    vi.useRealTimers();
  });

  test("Expect photos to return unchanged when signedUrl is not expired", async () => {
    // Fix the system time to a known date.
    const fixedDate = new Date("2025-01-01T00:00:00.000Z");
    vi.useFakeTimers({ now: fixedDate });

    const now = new Date();
    const mockExpireTime = now.getTime() + 1000 * 60 * 60 * 24 * 2; // mock time that has not expired

    const mockPhotoData: Photo[] = [
      {
        id: "sampleId",
        url: "sampleUrl",
        filename: "sampleFilename",
        camera: "Canon AE-1",
        film: "UltraMax 400",
        uploadedAt: new Date(),
        expiresAt: new Date(mockExpireTime),
      },
    ];

    const mockedSignedUrl = "https://mockedurl.com";
    const mockedGenerateSignedUrl = generatePresignedUrl as Mock;
    mockedGenerateSignedUrl.mockResolvedValue(mockedSignedUrl);

    // Mock findMany to return dummy photo array with expired photo
    (PrismaClient.prototype.photo.findMany as Mock).mockResolvedValue(
      mockPhotoData
    );

    const data = await fetchPhotos();
    expect(data[0].url).toBe("sampleUrl");

    vi.useRealTimers();
  });
});
