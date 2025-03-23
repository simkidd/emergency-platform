import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { environments } from "../config/environments";

const { JWT_SECRET } = environments;

export const generateToken = (
  userId: string,
  email: string,
  role: string
): string => {
  return jwt.sign({ userId, email, role }, JWT_SECRET, {
    expiresIn: "1h",
  });
};

export const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

export const comparePassword = async (
  password: string,
  hashedPassword: string
): Promise<boolean> => {
  return await bcrypt.compare(password, hashedPassword);
};
