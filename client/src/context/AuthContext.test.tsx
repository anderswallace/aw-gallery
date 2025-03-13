import { describe, vi, expect } from "vitest";
import { beforeEach } from "node:test";
import { render, waitFor, screen } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { act } from "react";
import axios from "axios";
import { AuthProvider, useAuth } from "./AuthContext";

vi.mock("axios");

// Helper component to render children
const MockComponent = () => {
  const { isAuthenticated } = useAuth();
  return <div>{isAuthenticated ? "Authenticated" : "Not Authenticated"}</div>;
};

describe("AuthContext", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("Call verifyAuth() when JWT present", async () => {
    // Successful API call for checking JWT
    axios.get = vi.fn().mockResolvedValueOnce({
      status: 200,
      data: { message: "JWT Verified" },
    });

    // Mock a JWT in the cookies
    Object.defineProperty(document, "cookie", {
      value: "jwt=some-valid-token",
      writable: true,
    });

    await act(async () => {
      render(
        <AuthProvider>
          <MockComponent />
        </AuthProvider>
      );
    });

    await waitFor(() => {
      // Verify that axios.get was called during the component mount
      expect(axios.get).toHaveBeenCalledTimes(1);
    });
  });

  test("Not Authenticated renders when cookie is not verified", async () => {
    // Successful API call for checking JWT
    axios.get = vi.fn().mockResolvedValueOnce({
      status: 401,
      data: { message: "Unauthorized" },
    });

    // Mock a JWT in the cookies
    Object.defineProperty(document, "cookie", {
      value: "jwt=some-valid-token",
      writable: true,
    });

    await act(async () => {
      render(
        <AuthProvider>
          <MockComponent />
        </AuthProvider>
      );
    });

    await waitFor(() => {
      // Verify that axios.get was called during the component mount
      expect(screen.getByText("Not Authenticated")).toBeInTheDocument();
    });
  });

  test("Catch error when API call fails", async () => {
    // Simulate failed API call
    const mockError = new Error("Network error");
    axios.get = vi.fn().mockRejectedValueOnce(mockError);

    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    // Mock a JWT in the cookies
    Object.defineProperty(document, "cookie", {
      value: "jwt=some-valid-token",
      writable: true,
    });

    await act(async () => {
      render(
        <AuthProvider>
          <MockComponent />
        </AuthProvider>
      );
    });

    await waitFor(() => {
      // Check that console.error was called with the expected error
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Verification failed: ",
        mockError
      );
    });

    consoleErrorSpy.mockRestore();
  });

  test("verifyAuth() not called when no JWT present", async () => {
    // Successful API call for checking JWT
    axios.get = vi.fn().mockResolvedValueOnce({
      status: 200,
      data: { message: "JWT Verified" },
    });

    // Mock an invalid JWT in the cookies
    Object.defineProperty(document, "cookie", {
      value: "some-invalid-token",
      writable: true,
    });

    await act(async () => {
      render(
        <AuthProvider>
          <MockComponent />
        </AuthProvider>
      );
    });

    await waitFor(() => {
      // Verify that axios.get was called during the component mount
      expect(axios.get).toHaveBeenCalledTimes(0);
    });
  });

  test("Error thrown when component rendered without AuthProvider", async () => {
    // Render the component outside of AuthProvider to trigger the error
    expect(() => render(<MockComponent />)).toThrowError(
      "useAuth must be used within an AuthProvider"
    );
  });
});
