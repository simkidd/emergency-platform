import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { environments } from "../config/environments";
import { IUser } from "../interfaces/user.interface";

const { JWT_SECRET } = environments;

/**
 * Generate a JWT token for a user
 */
export const generateToken = (user: IUser): string => {
  return jwt.sign(
    { userId: user._id, email: user.email, role: user.role },
    JWT_SECRET,
    {
      expiresIn: "1h",
    }
  );
};

/**
 * Verify a JWT token and return the decoded payload
 */
export const verifyToken = (
  token: string
): { userId: string; email: string; role: string } => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as {
      userId: string;
      email: string;
      role: string;
    };
    return decoded;
  } catch (error) {
    throw new Error("Invalid token");
  }
};

/**
 * Hash a password using bcrypt
 */
export const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

/**
 * Compare a plain text password with a hashed password
 */
export const comparePassword = async (
  password: string,
  hashedPassword: string
): Promise<boolean> => {
  return await bcrypt.compare(password, hashedPassword);
};
