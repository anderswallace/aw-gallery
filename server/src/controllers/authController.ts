import { Request, Response } from "express";
import { createToken } from "../services/authService.js";
import { config } from "../config/config.js";
import jwt from "jsonwebtoken";

export const login = (req: Request, res: Response) => {
  const { username, password } = req.body;

  if (username === config.adminUsername && password === config.adminPassword) {
    const token = createToken(username);

    res.cookie("jwt", token, {
      httpOnly: false,
      secure: true,
      maxAge: 3600000,
      sameSite: "none",
    });

    res.json({ message: "Login Successful" });
    return;
  } else {
    res.status(401).json({ message: "Invalid Credentials" });
    return;
  }
};

export const verifyCookie = (req: Request, res: Response) => {
  const token = req.cookies.jwt as string;

  if (!token) {
    res.status(401).json({ message: "No token provided" });
    return;
  }

  jwt.verify(token, config.jwtSecretKey, (err, decoded) => {
    if (err) {
      res.status(401).json({ message: "Invalid or expired token" });
      return;
    }
    res.json({ message: "Verification successful" });
    return;
  });
};
