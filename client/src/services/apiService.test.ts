import { describe, vi, expect } from "vitest";
import { beforeEach } from "node:test";
import "@testing-library/jest-dom/vitest";
import { ImageData } from "../types";
import { uploadPhotoForm, getPhotos } from "./apiService";

global.fetch = vi.fn();

describe("apiService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("Successful uploadPhotoForm call", async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
    });

    const mockFile = new File(["image content"], "mockImage.jpg", {
      type: "image/jpeg",
    });

    const mockImageData: ImageData = {
      camera: "Canon AE-1",
      film: "UltraMax 400",
      content: mockFile,
    };

    await expect(uploadPhotoForm(mockImageData)).resolves.toStrictEqual({
      ok: true,
    });
  });

  test("Throw error when uploading photo fails", async () => {
    // Suppress error output in console
    vi.spyOn(console, "error").mockImplementation(() => undefined);

    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: false,
    });

    const mockFile = new File(["image content"], "mockImage.jpg", {
      type: "image/jpeg",
    });

    const mockImageData: ImageData = {
      camera: "Canon AE-1",
      film: "UltraMax 400",
      content: mockFile,
    };

    await expect(uploadPhotoForm(mockImageData)).rejects.toThrowError();
  });

  test("Throw error when getting photos fails", async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: false,
    });

    await expect(getPhotos).rejects.toThrowError();
  });
});
