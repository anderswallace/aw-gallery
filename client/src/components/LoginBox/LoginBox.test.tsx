import LoginBox from "./LoginBox";
import { AuthProvider, useAuth } from "../../context/AuthContext";
import { describe, vi, expect } from "vitest";
import { beforeEach } from "node:test";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import "@testing-library/jest-dom/vitest";
import { ReactNode } from "react";

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

global.fetch = vi.fn();

describe("LoginBox", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("Render LoginBox", () => {
    render(
      <MemoryRouter>
        <AuthProvider>
          <LoginBox />
        </AuthProvider>
      </MemoryRouter>
    );
    expect(screen.getByLabelText("Username")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Sign In" })).toBeInTheDocument();
  });

  test("Handle input changes", () => {
    render(
      <MemoryRouter>
        <AuthProvider>
          <LoginBox />
        </AuthProvider>
      </MemoryRouter>
    );

    const usernameInput = screen.getByLabelText("Username");
    const passwordInput = screen.getByLabelText("Password");

    fireEvent.change(usernameInput, { target: { value: "username" } });
    fireEvent.change(passwordInput, { target: { value: "password" } });

    expect(usernameInput).toHaveValue("username");
    expect(passwordInput).toHaveValue("password");
  });

  test("Shows error snackbar on failed login and dismissing with pressing escape", async () => {
    // Mock the fetch API to simulate a failed login
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      json: async () => ({ message: "Invalid credentials" }),
    });

    render(
      <MemoryRouter>
        <AuthProvider>
          <LoginBox />
        </AuthProvider>
      </MemoryRouter>
    );

    const usernameInput = screen.getByLabelText("Username");
    const passwordInput = screen.getByLabelText("Password");
    const submitButton = screen.getByRole("button", { name: "Sign In" });

    // Simulate entering credentials and submitting the form
    fireEvent.change(usernameInput, { target: { value: "username" } });
    fireEvent.change(passwordInput, { target: { value: "password" } });
    fireEvent.click(submitButton);

    // Wait for the snackbar to appear
    await waitFor(() =>
      expect(screen.getByText("Invalid credentials")).toBeInTheDocument()
    );

    // Verify that the snackbar is visible
    expect(screen.getByRole("alert")).toHaveTextContent("Invalid credentials");

    fireEvent.keyDown(document, { key: "Escape", code: "Escape", keyCode: 27 });

    await waitFor(() => {
      expect(screen.queryByRole("alert")).toBeNull();
    });
  });

  test("Navigate to admin page on successful login", async () => {
    const mockVerifyAuth = vi.fn();
    const mockLogin = vi.fn();

    vi.mocked(useAuth).mockReturnValue({
      isAuthenticated: false,
      verifyAuth: mockVerifyAuth,
      login: mockLogin,
    });

    // successful response from login endpoint
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: "Login Successful" }),
    });

    render(
      <MemoryRouter>
        <AuthProvider>
          <LoginBox />
        </AuthProvider>
      </MemoryRouter>
    );

    const usernameInput = screen.getByLabelText("Username");
    const passwordInput = screen.getByLabelText("Password");
    const submitButton = screen.getByRole("button", { name: "Sign In" });

    // Simulate entering credentials and submitting the form
    fireEvent.change(usernameInput, { target: { value: "username" } });
    fireEvent.change(passwordInput, { target: { value: "password" } });
    fireEvent.click(submitButton);

    // expect verifyAuth to be called here
    await waitFor(() => {
      expect(mockVerifyAuth).toHaveBeenCalled();
    });
  });
});
