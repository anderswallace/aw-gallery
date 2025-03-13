import { render, screen } from "@testing-library/react";
import PhotoImage from "./PhotoImage";
import "@testing-library/jest-dom/vitest";
import { describe, vi, expect } from "vitest";

describe("PhotoImage Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  test("Renders image with correct URL, Camera, and Film props", () => {
    const mockProps = {
      url: "https://example.com/image.jpg",
      camera: "Canon AE-1",
      film: "UltraMax 400",
    };

    render(<PhotoImage {...mockProps} />);

    const imgElement = screen.getByRole("img");
    const cameraElement = screen.getByText(mockProps.camera);
    const filmElement = screen.getByText(mockProps.film);

    expect(imgElement).toBeInTheDocument();
    expect(cameraElement).toBeInTheDocument();
    expect(filmElement).toBeInTheDocument();
  });
});
