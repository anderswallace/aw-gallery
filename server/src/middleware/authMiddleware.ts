import jwt from "jsonwebtoken";
import { Request, Response, NextFunction, RequestHandler } from "express";
import { config } from "../config/config.js";

export const authenticateToken: RequestHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.cookies.jwt as string;

  if (!token) {
    res.status(401).json({ message: "Access denied. No token provided" });
    return;
  }

  jwt.verify(token, config.jwtSecretKey, (err, decoded) => {
    if (err) {
      res.status(403).json({ message: "Invalid or expired token." });
      return;
    }

    req.payload = decoded as jwt.JwtPayload;
    next();
  });
};
