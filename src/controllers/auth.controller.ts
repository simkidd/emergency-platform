import { Request, Response } from "express";
import { CreateUserInput, LoginInput } from "../interfaces/auth.interface";
import User from "../models/user.schema";
import { comparePassword, generateToken, hashPassword } from "../utils/auth";
import {
  generateTokens,
  revokeRefreshToken,
  validateRefreshToken,
} from "../services/auth.service";

export const registerUser = async (req: Request, res: Response) => {
  const { email, location, name, password, role }: CreateUserInput = req.body;
  try {
    const trimmedEmail = email.trim().toLowerCase();
    const existingUser = await User.findOne({ email: trimmedEmail });
    if (existingUser) {
      res.status(400).json({ message: "User already exists" });
      return;
    }

    const hashedPassword = await hashPassword(password);

    const user = new User({
      name,
      email: trimmedEmail,
      password: hashedPassword,
      role,
      location: {
        type: "Point",
        coordinates: location,
      },
    });

    await user.save();

    // Generate tokens
    const { accessToken, refreshToken } = await generateTokens(user);

    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      accessToken,
      refreshToken,
    });
    return;
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error registering user", error: error });
    return;
  }
};

export const loginUser = async (req: Request, res: Response) => {
  const { email, password }: LoginInput = req.body;
  try {
    const trimmedEmail = email.trim().toLowerCase();

    const user = await User.findOne({ email: trimmedEmail });
    if (!user) {
      res.status(401).json({ message: "User account not found" });
      return;
    }

    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      res.status(401).json({ message: "Invalid password" });
      return;
    }

    // Generate tokens
    const { accessToken, refreshToken } = await generateTokens(user);

    res.status(201).json({
      message: "Login successful",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      accessToken,
      refreshToken,
    });
    return;
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error logging in", error: error });
    return;
  }
};

export const refreshToken = async (req: Request, res: Response) => {
  const { refreshToken } = req.body;

  try {
    // Validate the refresh token
    const userId = await validateRefreshToken(refreshToken);

    // Generate a new access token
    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    const accessToken = generateToken(user);

    res.status(200).json({ accessToken });
    return;
  } catch (error) {
    res.status(400).json({ message: "Invalid refresh token", error });
    return;
  }
};

export const logoutUser = async (req: Request, res: Response) => {
  const { refreshToken } = req.body;

  try {
    // Revoke the refresh token
    await revokeRefreshToken(refreshToken);
    res.status(200).json({ message: "Logout successful" });
    return;
  } catch (error) {
    res.status(500).json({ message: "Error logging out", error });
    return;
  }
};
