import { AuthProvider } from "../context/AuthContext";
import { describe, vi, expect } from "vitest";
import { beforeEach } from "node:test";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import "@testing-library/jest-dom/vitest";
import { ReactNode } from "react";
import PhotoUpload from "../components/PhotoUpload/PhotoUpload";
import AdminPage from "./AdminPage";

// Mock useAuth hook for AuthProvider wrapping this component
vi.mock("../../context/AuthContext", () => ({
  useAuth: vi.fn().mockReturnValue({
    isAuthenticated: false,
    verifyAuth: vi.fn(),
  }),
  AuthProvider: ({ children }: { children: ReactNode }) => (
    <div>{children}</div>
  ),
}));

vi.mock("react-router", () => ({
  useNavigate: vi.fn(),
  MemoryRouter: ({ children }: { children: ReactNode }) => (
    <div>{children}</div>
  ),
  Navigate: vi.fn(() => null),
  Routes: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  Route: ({ element }: { element: ReactNode }) => <div>{element}</div>,
  Outlet: () => <PhotoUpload />, // Mock Outlet as a div to check its being returned
}));

describe("AdminPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("Render AdminPage, expect PhotoUpload in page", () => {
    render(
      <MemoryRouter>
        <AuthProvider>
          <AdminPage />
        </AuthProvider>
      </MemoryRouter>
    );

    // Expect the input fields and buttons to exist
    expect(screen.getByLabelText("Camera")).toBeInTheDocument();
    expect(screen.getByLabelText("Film")).toBeInTheDocument();
    expect(screen.getByText("Upload files")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Upload" })).toBeInTheDocument();
  });
});
