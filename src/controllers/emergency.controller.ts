import { Request, Response } from "express";
import User from "../models/user.schema";
import { emergencyChannel } from "../utils/ably";
import { CustomRequest } from "../types/custom-request";
import Emergency from "../models/emergency.schema";
import Volunteer from "../models/volunteer.schema";
import { CreateEmergencyInput } from "../interfaces/emergency.interface";
import { notifyAdmin } from "../services/notification.service";

/**
 * Create a new emergency
 */
export const createEmergency = async (req: CustomRequest, res: Response) => {
  const { type, location }: CreateEmergencyInput = req.body;
  const userId = req.id; // User ID from auth middleware

  try {
    // Check if the user exists
    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ message: "User not found" });
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

    // Create the emergency
    const emergency = new Emergency({
      userId,
      type,
      location: {
        type: location.type,
        coordinates: [longitude, latitude],
      },
    });

    await emergency.save();

    // Find nearby volunteers (within 5km radius)
    const volunteers = await Volunteer.aggregate([
      {
        $match: { isAvailable: true },
      },
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },
      {
        $match: {
          "user.location": {
            $geoWithin: {
              $centerSphere: [
                location.coordinates,
                5 / 6378.1, // 5km radius in radians (Earth's radius in km)
              ],
            },
          },
        },
      },
    ]);

    // Handle notification scenarios
    if (volunteers.length > 0) {
      // Case 1: Notify found volunteers via Ably
      await emergencyChannel.publish("new-emergency", {
        emergencyId: emergency._id,
        emergencyType: type,
        location: location.coordinates,
        volunteersNeeded: 3, // Example: Request 3 volunteers
        userPhone: req.phoneNumber, // For direct contact
      });

      res.status(201).json({
        message: "Emergency created. Volunteers notified.",
        emergency,
        notifiedVolunteers: volunteers.length,
      });
    } else {
      // Case 2: No volunteers found - escalate to admin
      await notifyAdmin({
        emergencyId: emergency._id,
        location: location.coordinates,
        reason: "No available volunteers in 5km radius",
      });

      res.status(201).json({
        message:
          "Emergency created. No nearby volunteers found. Admin notified.",
        emergency,
      });
    }
    return;
  } catch (error: any) {
    res
      .status(500)
      .json({ message: "Error creating emergency", error: error.message });
    return;
  }
};

/**
 * Get all emergencies (filter by status or location)
 */
export const getEmergencies = async (req: Request, res: Response) => {
  const { status, longitude, latitude, radius } = req.query;

  try {
    let query: any = {};

    // Filter by status
    if (status) {
      query.status = status;
    }

    // Filter by location (within a radius)
    if (longitude && latitude && radius) {
      query.location = {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [
              parseFloat(longitude as string),
              parseFloat(latitude as string),
            ],
          },
          $maxDistance: parseFloat(radius as string) * 1000, // Convert km to meters
        },
      };
    }

    const emergencies = await Emergency.find(query).populate(
      "userId",
      "name email"
    );

    res.status(200).json(emergencies);
    return;
  } catch (error) {
    res.status(500).json({ message: "Error fetching emergencies", error });
    return;
  }
};

/**
 * Get a specific emergency by ID
 */
export const getEmergencyById = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const emergency = await Emergency.findById(id).populate(
      "userId",
      "name email"
    );

    if (!emergency) {
      res.status(404).json({ message: "Emergency not found" });
      return;
    }

    res.status(200).json(emergency);
    return;
  } catch (error) {
    res.status(500).json({ message: "Error fetching emergency", error });
    return;
  }
};

/**
 * Update emergency status (e.g., mark as resolved)
 */
export const updateEmergencyStatus = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status }: { status: "pending" | "resolved" | "cancelled" } = req.body;

  try {
    const emergency = await Emergency.findByIdAndUpdate(
      id,
      { status: status },
      { new: true }
    ).populate("userId", "name email");

    if (!emergency) {
      res.status(404).json({ message: "Emergency not found" });
      return;
    }

    res.status(200).json({
      message: "Emergency status updated successfully",
      emergency,
    });
    return;
  } catch (error) {
    res.status(500).json({ message: "Error updating emergency status", error });
    return;
  }
};

/**
 * Delete an emergency
 */
export const deleteEmergency = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const emergency = await Emergency.findByIdAndDelete(id);

    if (!emergency) {
      res.status(404).json({ message: "Emergency not found" });
      return;
    }

    res.status(200).json({ message: "Emergency deleted successfully" });
    return;
  } catch (error) {
    res.status(500).json({ message: "Error deleting emergency", error });
    return;
  }
};
