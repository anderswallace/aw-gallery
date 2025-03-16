import { describe, expect, vi, test } from "vitest";
import request from "supertest";
import express from "express";
import { afterEach, beforeEach } from "node:test";
import cookieParser from "cookie-parser";
import { config } from "../config/config";
import authRoutes from "../routes/authRoutes";

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use("/auth", authRoutes);

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

  // TODO: tests for verifyCookie
});
