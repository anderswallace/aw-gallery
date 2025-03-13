import { AuthProvider, useAuth } from "../../context/AuthContext";
import { describe, vi, expect } from "vitest";
import { beforeEach } from "node:test";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Navigate, Route, Routes } from "react-router";
import "@testing-library/jest-dom/vitest";
import { ReactNode } from "react";
import ProtectedRoute from "./ProtectedRoute";
import "@testing-library/jest-dom/vitest";

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
  Outlet: () => <div>Outlet Rendered</div>, // Mock Outlet as a div to check its being returned
}));

describe("ProtectedRoute", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("Navigate to /login when unauthenticated", () => {
    const mockLogin = vi.fn();
    const mockVerifyAuth = vi.fn();

    vi.mocked(useAuth).mockReturnValue({
      isAuthenticated: false,
      verifyAuth: mockVerifyAuth,
      login: mockLogin,
    });

    render(
      <MemoryRouter>
        <AuthProvider>
          <ProtectedRoute />
        </AuthProvider>
      </MemoryRouter>
    );

    expect(vi.mocked(Navigate).mock.calls[0][0].to).toBe("/login");
  });

  test("Return Outlet component when authenticated", () => {
    const mockLogin = vi.fn();
    const mockVerifyAuth = vi.fn();

    vi.mocked(useAuth).mockReturnValue({
      isAuthenticated: true,
      verifyAuth: mockVerifyAuth,
      login: mockLogin,
    });

    render(
      <MemoryRouter>
        <AuthProvider>
          <Routes>
            <Route element={<ProtectedRoute />}>
              <Route path="/admin" element={<div>Protected Content</div>} />
            </Route>
          </Routes>
        </AuthProvider>
      </MemoryRouter>
    );

    expect(screen.getByText("Outlet Rendered")).toBeInTheDocument();
  });
});
