import { describe, expect, vi, test, Mock } from "vitest";
import request from "supertest";
import express from "express";
import { afterEach, beforeEach } from "node:test";
import cookieParser from "cookie-parser";
import { config } from "../config/config";
import authRoutes from "../routes/authRoutes";
import jwt from "jsonwebtoken";
import { error } from "console";

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use("/auth", authRoutes);

vi.mock("jsonwebtoken", async () => {
  const originalJwt = await import("jsonwebtoken");
  return {
    ...originalJwt,
    verify: vi.fn(),
  };
});

vi.mock("../config/config", async () => {
  const mockedConfig = (await vi.importActual("../config/config")) as {
    config: any;
  };
  return {
    config: {
      ...mockedConfig.config,
      adminUsername: "adminUsername",
      adminPassword: "adminPassword",
    },
  };
});

describe("authController", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  test("Valid login returns Login Successful and cookie", async () => {
    const response = await request(app)
      .post("/auth/login")
      .send({ username: config.adminUsername, password: config.adminPassword })
      .set("Content-Type", "application/json");

    expect(response.status).toBe(200);
    expect(response.body.message).toBe("Login Successful");
    expect(response.headers["set-cookie"]).toBeDefined();
  });

  test("Invalid login returns 401", async () => {
    const response = await request(app)
      .post("/auth/login")
      .send({ username: "invalidUsername", password: "invalidPassword" })
      .set("Content-Type", "application/json");

    expect(response.status).toBe(401);
    expect(response.body.message).toBe("Invalid Credentials");
  });

  test("Valid cookie returns message successful", async () => {
    const mockVerify = vi.fn().mockImplementation((token, secret, callback) => {
      callback(null, { message: "Verification successful" });
    });
    jwt.verify = mockVerify;

    const response = await request(app)
      .get("/auth/verify")
      .set("Cookie", "jwt=validToken");

    expect(mockVerify).toHaveBeenCalledTimes(1);
    expect(response.body.message).toBe("Verification successful");
  });

  test("Request with no cookie returns 401 error", async () => {
    const response = await request(app).get("/auth/verify");

    expect(response.body.message).toBe("No token provided");
  });

  test("Request with invalid token returns error", async () => {
    const mockVerify = vi.fn().mockImplementation((token, secret, callback) => {
      callback(error, { message: "Verification successful" });
    });
    jwt.verify = mockVerify;

    const response = await request(app)
      .get("/auth/verify")
      .set("Cookie", "jwt=invalidToken");

    expect(response.status).toBe(401);
    expect(response.body.message).toBe("Invalid or expired token");
  });
});
