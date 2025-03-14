import { describe, vi, expect } from "vitest";
import { beforeEach } from "node:test";
import { act, render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import HomePage from "./HomePage";
import * as apiService from "../services/apiService";
import { Photo } from "../types";

vi.mock("../services/apiService", () => ({
  getPhotos: vi.fn(),
}));

describe("HomePage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("Render images on page load", async () => {
    const mockPhotoData: Photo[] = [
      {
        id: "1",
        url: "https://example.com/photo1.jpg",
        filename: "photo1.jpg",
        camera: "Canon AE-1",
        film: "UltraMax 400",
        uploadedAt: "10:30",
        expiresAt: "11:30",
      },
      {
        id: "2",
        url: "https://example.com/photo2.jpg",
        filename: "photo2.jpg",
        camera: "Olympus AF-10 Super",
        film: "Portra 400",
        uploadedAt: "10:30",
        expiresAt: "11:30",
      },
    ];

    vi.mocked(apiService.getPhotos).mockResolvedValue(mockPhotoData);

    await act(async () => {
      render(<HomePage />);
    });

    await waitFor(() => {
      expect(screen.getByText("Anders Wallace")).toBeInTheDocument();
      expect(screen.getByText("Canon AE-1")).toBeInTheDocument();
      expect(screen.getByText("UltraMax 400")).toBeInTheDocument();
      expect(screen.getByText("Olympus AF-10 Super")).toBeInTheDocument();
      expect(screen.getByText("Portra 400")).toBeInTheDocument();
    });
  });

  test("Handle error on failed API call", async () => {
    const errorMessage = "HTTP Error: 500";
    vi.mocked(apiService.getPhotos).mockRejectedValue(new Error(errorMessage));

    // Spy on console.error to see if its called
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    await act(async () => {
      render(<HomePage />);
    });

    await waitFor(() => {
      const errorObject = consoleErrorSpy.mock.calls[0];

      expect(errorObject[0].message).toBe(errorMessage);
    });

    consoleErrorSpy.mockRestore();
  });
});
