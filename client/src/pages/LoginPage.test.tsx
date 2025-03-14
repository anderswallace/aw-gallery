import { AuthProvider } from "../context/AuthContext";
import { describe, vi, expect } from "vitest";
import { beforeEach } from "node:test";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import "@testing-library/jest-dom/vitest";
import { ReactNode } from "react";
import LoginPage from "./LoginPage";
import PhotoUpload from "../components/PhotoUpload/PhotoUpload";

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

describe("LoginPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("Render LoginPage, expect LoginBox in page", () => {
    render(
      <MemoryRouter>
        <AuthProvider>
          <LoginPage />
        </AuthProvider>
      </MemoryRouter>
    );

    // Expect the input fields and buttons to exist
    expect(screen.getByLabelText("Username")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Sign In" })).toBeInTheDocument();
  });
});
