import { Request, Response } from "express";
import User from "../models/user.schema";
import Volunteer from "../models/volunteer.schema";
import {
  CreateVolunteerInput,
  UpdateVolunteerInput,
} from "../interfaces/volunteer.interface";

export const createVolunteerProfile = async (req: Request, res: Response) => {
  const { userId, skills, isAvailable }: CreateVolunteerInput = req.body;

  try {
    // Check if the user exists and is a volunteer
    const user = await User.findById(userId);
    if (!user || user.role !== "volunteer") {
      res.status(400).json({ message: "User is not a volunteer" });
      return;
    }

    // Check if the user already has a volunteer profile
    const existingVolunteer = await Volunteer.findOne({ userId });
    if (existingVolunteer) {
      res.status(400).json({ message: "Volunteer profile already exists" });
      return;
    }

    // Create the volunteer profile
    const volunteer = new Volunteer({
      userId,
      skills,
      isAvailable,
    });

    await volunteer.save();

    res.status(201).json({
      message: "Volunteer profile created successfully",
      volunteer,
    });
    return;
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error creating volunteer profile", error });
    return;
  }
};

// Get all volunteers
export const getAllVolunteers = async (req: Request, res: Response) => {
  try {
    const volunteers = await Volunteer.find().populate(
      "userId",
      "name email phoneNumber"
    );
    res.status(200).json(volunteers);
    return;
  } catch (error) {
    res.status(500).json({ message: "Error fetching volunteers", error });
    return;
  }
};

// Get volunteer by ID
export const getVolunteerById = async (req: Request, res: Response) => {
  try {
    const volunteer = await Volunteer.findById(req.params.id).populate(
      "userId",
      "name email phoneNumber"
    );

    if (!volunteer) {
      res.status(404).json({ message: "Volunteer not found" });
      return;
    }

    res.status(200).json(volunteer);
    return;
  } catch (error) {
    res.status(500).json({ message: "Error fetching volunteer", error });
    return;
  }
};

// Update volunteer profile
export const updateVolunteerProfile = async (req: Request, res: Response) => {
  const { id } = req.params;
  const updates: UpdateVolunteerInput = req.body;

  try {
    const volunteer = await Volunteer.findOne({ userId: id });
    if (!volunteer) {
      res.status(404).json({ message: "Volunteer not found" });
      return;
    }

    await Volunteer.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    }).populate("userId", "name email phoneNumber");

    res.status(200).json({
      message: "Volunteer profile updated successfully",
      volunteer,
    });
    return;
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating volunteer profile", error });
    return;
  }
};

// Toggle volunteer availability
export const toggleAvailability = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const volunteer = await Volunteer.findById(id);

    if (!volunteer) {
      res.status(404).json({ message: "Volunteer not found" });
      return;
    }

    volunteer.isAvailable = !volunteer.isAvailable;
    await volunteer.save();

    res.status(200).json({
      message: `Volunteer availability set to ${volunteer.isAvailable}`,
      isAvailable: volunteer.isAvailable,
    });
    return;
  } catch (error) {
    res.status(500).json({ message: "Error toggling availability", error });
    return;
  }
};

// Search volunteers by skills
export const searchVolunteersBySkills = async (req: Request, res: Response) => {
  const { skills } = req.query;

  try {
    if (!skills || typeof skills !== "string") {
      res.status(400).json({ message: "Skills parameter is required" });
      return;
    }

    const skillsArray = skills.split(",").map((skill) => skill.trim());
    const volunteers = await Volunteer.find({
      skills: { $in: skillsArray },
    }).populate("userId", "name email phoneNumber");

    res.status(200).json(volunteers);
    return;
  } catch (error) {
    res.status(500).json({ message: "Error searching volunteers", error });
    return;
  }
};

// Get available volunteers
export const getAvailableVolunteers = async (req: Request, res: Response) => {
  try {
    const volunteers = await Volunteer.find({ isAvailable: true }).populate(
      "userId",
      "name email phoneNumber"
    );

    res.status(200).json(volunteers);
    return;
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching available volunteers", error });
    return;
  }
};
