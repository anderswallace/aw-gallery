import { describe, expect, vi, test, Mock } from "vitest";
import request from "supertest";
import express, { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { config } from "../config/config";
import { authenticateToken } from "./authMiddleware";
import { afterEach, beforeEach } from "node:test";
import cookieParser from "cookie-parser";

vi.mock("jsonwebtoken", () => ({
  default: {
    verify: vi.fn((x, _, f) => {
      f(x !== "validToken", x);
      console.log(x);
    }),
  },
}));

vi.mock("../config/config", () => ({
  config: {
    jwtSecretKey: "secretKey",
  },
}));

const app = express();
app.use(express.json());
app.use(cookieParser());

app.get("/data", authenticateToken, (req: Request, res: Response) => {
  res.status(200).json({ message: "Photos fetched successfully" });
});

describe("authMiddleware", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  test("Fail with invalid token", async () => {
    const response = await request(app)
      .get("/data")
      .set("Cookie", "jwt=invalidToken");

    expect(response.status).toBe(403);
  });

  test("Verify valid token", async () => {
    const response = await request(app)
      .get("/data")
      .set("Cookie", "jwt=validToken");

    expect(response.status).toBe(200);
  });
});
