import { Request, Response } from "express";
import {
  CreateUserInput,
  LoginInput,
  UpdatePasswordInput,
} from "../interfaces/auth.interface";
import User from "../models/user.schema";
import { comparePassword, generateToken, hashPassword } from "../utils/auth";
import {
  generateTokens,
  revokeRefreshToken,
  validateRefreshToken,
} from "../services/auth.service";
import { CustomRequest } from "../types/custom-request";

export const registerUser = async (req: Request, res: Response) => {
  const {
    email,
    location,
    name,
    password,
    role,
    phoneNumber,
  }: CreateUserInput = req.body;
  try {
    const trimmedEmail = email.trim().toLowerCase();
    const existingUser = await User.findOne({ email: trimmedEmail });
    if (existingUser) {
      res.status(400).json({ message: "User already exists" });
      return;
    }

    // Validate location
    if (
      !location ||
      !location.coordinates ||
      !Array.isArray(location.coordinates)
    ) {
      res.status(400).json({ message: "Invalid location format" });
      return;
    }

    const [longitude, latitude] = location.coordinates;
    if (isNaN(longitude) || isNaN(latitude)) {
      res.status(400).json({ message: "Coordinates must be numbers" });
      return;
    }

    const hashedPassword = await hashPassword(password);

    const user = new User({
      name,
      email: trimmedEmail,
      password: hashedPassword,
      phoneNumber,
      role,
      location: {
        type: location.type,
        coordinates: [longitude, latitude],
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
        phoneNumber: user.phoneNumber,
      },
      accessToken,
      refreshToken,
    });
    return;
  } catch (error: any) {
    console.log(error);
    res
      .status(500)
      .json({ message: "Error registering user", error: error.message });
    return;
  }
};

export const loginUser = async (req: Request, res: Response) => {
  const { email, password }: LoginInput = req.body;
  try {
    const trimmedEmail = email.trim().toLowerCase();

    const user = await User.findOne({ email: trimmedEmail });
    if (!user) {
      res.status(404).json({ message: "User account not found" });
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

export const getMe = async (req: CustomRequest, res: Response) => {
  const id = req.id;

  try {
    const user = await User.findById(id).select("-password");

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.status(200).json({
      message: "User details fetched successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        location: user.location,
      },
    });
    return;
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching user details", error });
    return;
  }
};

/**
 * Update a user's password
 */
export const updatePassword = async (req: CustomRequest, res: Response) => {
  const { currentPassword, newPassword }: UpdatePasswordInput = req.body;
  const id = req.id;

  try {
    // Find the user by ID
    const user = await User.findById(id);

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    // Verify the current password
    const isMatch = await comparePassword(currentPassword, user.password);
    if (!isMatch) {
      res.status(400).json({ message: "Current password is incorrect" });
      return;
    }

    // Check if the new password is the same as the current password
    const isSamePassword = await comparePassword(newPassword, user.password);
    if (isSamePassword) {
      res.status(400).json({
        message: "New password cannot be the same as the current password",
      });
      return;
    }

    // Hash the new password
    const hashedPassword = await hashPassword(newPassword);

    await User.findByIdAndUpdate(
      id,
      {
        password: hashedPassword,
      },
      { runValidators: false }
    );

    res.status(200).json({ message: "Password updated successfully" });
    return;
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error updating password", error });
    return;
  }
};
