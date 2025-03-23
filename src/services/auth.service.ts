import jwt from "jsonwebtoken";
import { environments } from "../config/environments";
import { IUser } from "../interfaces/user.interface";
import Auth from "../models/auth.schema";

const { JWT_SECRET } = environments;

const ACCESS_TOKEN_EXPIRY = "1h"; // 1 hour
const REFRESH_TOKEN_EXPIRY = "7d"; // 7 days

export const generateTokens = async (user: IUser) => {
  // Generate access token
  const accessToken = jwt.sign(
    { userId: user._id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: ACCESS_TOKEN_EXPIRY }
  );

  // Generate refresh token
  const refreshToken = jwt.sign(
    { userId: user._id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: REFRESH_TOKEN_EXPIRY }
  );

  // Update or create the Auth document
  await Auth.findOneAndUpdate(
    { email: user.email },
    {
      userId: user._id,
      token: refreshToken,
      type: "refresh",
      expiresAt: new Date(Date.now() + 60 * 60 * 24 * 7 * 1000), // 7 days from now
    },
    { upsert: true } // Create if not found
  );

  return { accessToken, refreshToken };
};

export const validateRefreshToken = async (refreshToken: string) => {
  // verify the refresh token
  const decoded = jwt.verify(refreshToken, JWT_SECRET) as { userId: string };

  // Check if the token exists in the database
  const auth = await Auth.findOne({ token: refreshToken, type: "refresh" });
  if (!auth) {
    throw new Error("Invalid refresh token");
  }

  return decoded.userId;
};

export const revokeRefreshToken = async (refreshToken: string) => {
  // Delete the refresh token from the database
  await Auth.deleteOne({ token: refreshToken, type: "refresh" });
};
