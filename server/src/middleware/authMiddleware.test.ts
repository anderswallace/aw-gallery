import { describe, expect, vi, test } from "vitest";
import request from "supertest";
import express, { Request, Response } from "express";
import { authenticateToken } from "./authMiddleware";
import { afterEach, beforeEach } from "node:test";
import cookieParser from "cookie-parser";

vi.mock("jsonwebtoken", () => ({
  default: {
    verify: vi.fn((x, _, f) => {
      f(x !== "validToken", x);
    }),
  },
}));

const app = express();
app.use(express.json());
app.use(cookieParser());

app.post("/photos", authenticateToken, (req: Request, res: Response) => {
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
      .post("/photos")
      .set("Cookie", "jwt=invalidToken");

    expect(response.status).toBe(403);
    expect(response.body.message).toBe("Invalid or expired token.");
  });

  test("Verify valid token", async () => {
    const response = await request(app)
      .post("/photos")
      .set("Cookie", "jwt=validToken");

    expect(response.status).toBe(200);
  });

  test("Fail request with no token provided", async () => {
    const response = await request(app).post("/photos");

    expect(response.status).toBe(401);
    expect(response.body.message).toBe("Access denied. No token provided");
  });
});
