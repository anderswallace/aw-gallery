import { describe, expect, vi, test, Mock } from "vitest";
import { afterEach } from "node:test";
import { Image } from "../controllers/photosController";
import { Readable } from "stream";
import { generatePresignedUrl, uploadFile } from "./s3Service";
import { S3Client } from "@aws-sdk/client-s3"; // now imports our mocked version
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// Mock the AWS SDK module inline to avoid hoisting issues.
vi.mock("@aws-sdk/client-s3", () => {
  // Define the mock class within the factory so it’s available at hoisting.
  class MockS3Client {
    send() {}
  }
  const sendMock = vi.fn();
  MockS3Client.prototype.send = sendMock;
  return {
    S3Client: MockS3Client,
    PutObjectCommand: vi.fn(),
    GetObjectCommand: vi.fn(),
  };
});

vi.mock("@aws-sdk/s3-request-presigner", () => {
  return {
    getSignedUrl: vi.fn(),
  };
});

describe("s3Service", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  test("Expect error to be handled when thrown by AWS S3", async () => {
    const errorMessage = "Error uploading file to S3";

    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    (S3Client.prototype.send as Mock).mockRejectedValue(
      new Error(errorMessage)
    );

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

    const mockPhoto: Image = {
      id: "1",
      camera: "Canon AE-1",
      film: "UltraMax 400",
      file: mockFile,
    };

    await expect(uploadFile(mockPhoto)).rejects.toThrow(errorMessage);

    consoleErrorSpy.mockRestore();
  });

  test("Expect properly formed filename when S3 upload is successful", async () => {
    (S3Client.prototype.send as Mock).mockResolvedValue("Upload successful");

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

    const mockPhoto: Image = {
      id: "1",
      camera: "Canon AE-1",
      film: "UltraMax 400",
      file: mockFile,
    };

    const data = await uploadFile(mockPhoto);

    expect(data).toBe(`images/${mockFile.originalname}/${mockPhoto.id}`);
  });

  test("Return signed url on successful request to AWS", async () => {
    const mockAWSKey = "mockKey";
    const mockedSignedUrl = "https://mockedurl.com";
    const mockedGetSignedUrl = getSignedUrl as Mock;
    mockedGetSignedUrl.mockResolvedValue(mockedSignedUrl);

    const mockedReturn = await generatePresignedUrl(mockAWSKey);

    expect(mockedReturn).toBe(mockedSignedUrl);
  });

  test("Successful error handling when error returned from AWS", async () => {
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    const mockAWSKey = "mockKey";
    const mockedError = "Error generating pre-signed URL";
    const mockedGetSignedUrl = getSignedUrl as Mock;
    mockedGetSignedUrl.mockRejectedValue(new Error(mockedError));

    await expect(generatePresignedUrl(mockAWSKey)).rejects.toThrow(
      "Error generating signed URL"
    );
  });
});
