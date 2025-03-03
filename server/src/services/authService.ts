import jwt from "jsonwebtoken";
import { config } from "../config/config.js";

export const createToken = (username: string): string => {
  return jwt.sign({ username }, config.jwtSecretKey, { expiresIn: "1h" });
};
