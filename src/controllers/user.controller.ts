import { Request, Response } from "express";
import User from "../models/user.schema";
import { UpdateUserInput } from "../interfaces/user.interface";
import Volunteer from "../models/volunteer.schema";
import { AnyARecord } from "dns";

/**
 * Get the details of a specific user by ID
 */
export const getUserById = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const user = await User.findById(id).select("-password"); // Exclude the password field

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.status(200).json({
      message: "User details fetched successfully",
      user,
    });
    return;
  } catch (error: any) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Error fetching user details", error: error.message });
    return;
  }
};

/**
 * Update a user's details
 */
export const updateUser = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, phoneNumber, location }: UpdateUserInput = req.body;

  try {
    const user = await User.findByIdAndUpdate(
      id,
      { name, phoneNumber, location },
      { new: true, runValidators: true } // Return the updated document and run schema validators
    ).select("-password");

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.status(200).json({
      message: "User updated successfully",
      user,
    });
  } catch (error: any) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Error updating user", error: error.message });
    return;
  }
};

/**
 * Delete a user by ID
 */
export const deleteUser = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    // First find the user to check their role
    const user = await User.findById(id);

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    // If user is a volunteer, delete their volunteer profile
    if (user.role === "volunteer") {
      await Volunteer.findOneAndDelete({ userId: id });
    }

    const deletedUser = await User.findByIdAndDelete(id).select("-password");

    res.status(200).json({
      message: "User deleted successfully",
      user: {
        id: deletedUser?._id,
      },
    });
    return;
  } catch (error: any) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Error deleting user", error: error.message });
    return;
  }
};

/**
 * Get all users (for admin purposes)
 */
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await User.find().select("-password");

    res.status(200).json({
      message: "Users fetched successfully",
      users,
    });
    return;
  } catch (error: any) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Error fetching users", error: error.message });
    return;
  }
};
