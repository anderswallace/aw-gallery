import { ReactNode } from "react";
import { MemoryRouter } from "react-router";
import { describe, vi, expect } from "vitest";
import { AuthProvider } from "../../context/AuthContext";
import PhotoUpload from "./PhotoUpload";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { uploadPhotoForm } from "../../services/apiService";

// Mock useAuth hook for AuthProvider wrapping this component
vi.mock("../../context/AuthContext", () => ({
  useAuth: vi.fn().mockReturnValue({
    isAuthenticated: true,
    verifyAuth: vi.fn(),
  }),
  AuthProvider: ({ children }: { children: ReactNode }) => (
    <div>{children}</div>
  ),
}));

// Mock image compression
vi.mock("browser-image-compression", () => ({
  default: vi
    .fn()
    .mockResolvedValue(
      new File([""], "mock-file.webp", { type: "image/webp" })
    ),
}));

// Mock uploadPhotoForm API call
vi.mock("../../services/apiService", () => ({
  uploadPhotoForm: vi.fn(),
}));

global.URL.createObjectURL = vi.fn().mockReturnValue("mocked-url");
global.URL.revokeObjectURL = vi.fn();

global.fetch = vi.fn();

describe("PhotoUpload Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("Render PhotoUpload", () => {
    render(
      <MemoryRouter>
        <AuthProvider>
          <PhotoUpload />
        </AuthProvider>
      </MemoryRouter>
    );

    // Expect the input fields and buttons to exist
    expect(screen.getByLabelText("Camera")).toBeInTheDocument();
    expect(screen.getByLabelText("Film")).toBeInTheDocument();
    expect(screen.getByText("Upload files")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Upload" })).toBeInTheDocument();
  });

  test("Handle input changes", async () => {
    render(
      <MemoryRouter>
        <AuthProvider>
          <PhotoUpload />
        </AuthProvider>
      </MemoryRouter>
    );
    const cameraInput = screen.getByLabelText("Camera");
    const filmInput = screen.getByLabelText("Film");

    fireEvent.change(filmInput, { target: { value: "UltraMax 400" } });

    // Click on the input field to open the dropdown
    fireEvent.mouseDown(cameraInput);

    // Select Canon AE-1
    const option = await screen.findByText("Canon AE-1");
    fireEvent.click(option);

    await waitFor(() => {
      expect(cameraInput).toHaveValue("Canon AE-1");
    });

    expect(filmInput).toHaveValue("UltraMax 400");
  });

  test("Upload file successfully, dismiss success snackbar", async () => {
    const mockUploadResponse = { ok: true };
    (uploadPhotoForm as jest.Mock).mockResolvedValue(mockUploadResponse);
    render(
      <MemoryRouter>
        <AuthProvider>
          <PhotoUpload />
        </AuthProvider>
      </MemoryRouter>
    );
    const cameraInput = screen.getByLabelText("Camera");
    const filmInput = screen.getByLabelText("Film");
    const submitButton = screen.getByText("Upload");

    // Make data inputs
    fireEvent.change(filmInput, { target: { value: "UltraMax 400" } });
    fireEvent.mouseDown(cameraInput);
    const option = await screen.findByText("Canon AE-1");
    fireEvent.click(option);

    // Create new file
    const fileInput = screen.getByLabelText("Upload files");
    const mockFile = new File(["file content"], "image.jpg", {
      type: "image/jpg",
    });

    // File change event
    fireEvent.change(fileInput, { target: { files: [mockFile] } });

    // Upload file
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("Upload Successful!")).toBeInTheDocument();
    });

    expect(uploadPhotoForm).toHaveBeenCalledWith(
      expect.objectContaining({
        camera: "Canon AE-1",
        film: "UltraMax 400",
        content: expect.any(File),
      })
    );

    fireEvent.keyDown(document, { key: "Escape", code: "Escape", keyCode: 27 });

    await waitFor(() => {
      expect(screen.queryByRole("alert")).toBeNull();
    });
  });

  test("Create alert for unsupported file type", async () => {
    const alertMock = vi.fn();
    global.alert = alertMock;
    render(
      <MemoryRouter>
        <AuthProvider>
          <PhotoUpload />
        </AuthProvider>
      </MemoryRouter>
    );

    // Create new file with non-image type
    const fileInput = screen.getByLabelText("Upload files");
    const mockIncorrectFile = new File(["file content"], "image.pdf", {
      type: "application/pdf",
    });

    // File change event
    fireEvent.change(fileInput, { target: { files: [mockIncorrectFile] } });

    expect(alertMock).toHaveBeenCalledWith(
      "Invalid file type. Allowed types: jpg, jpeg, png, svg"
    );
  });

  // TODO: Finish tests for following lines
  // 90-97
  // 121-122
});
