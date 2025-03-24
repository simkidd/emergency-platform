"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteEmergency = exports.updateEmergencyStatus = exports.getEmergencyById = exports.getEmergencies = exports.createEmergency = void 0;
const user_schema_1 = __importDefault(require("../models/user.schema"));
const ably_1 = require("../utils/ably");
const emergency_schema_1 = __importDefault(require("../models/emergency.schema"));
const volunteer_schema_1 = __importDefault(require("../models/volunteer.schema"));
const notification_service_1 = require("../services/notification.service");
/**
 * Create a new emergency
 */
const createEmergency = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { type, location } = req.body;
    const userId = req.id; // User ID from auth middleware
    try {
        // Check if the user exists
        const user = yield user_schema_1.default.findById(userId);
        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }
        // Validate location
        if (!location ||
            !location.coordinates ||
            !Array.isArray(location.coordinates)) {
            res.status(400).json({ message: "Invalid location format" });
            return;
        }
        const [longitude, latitude] = location.coordinates;
        if (isNaN(longitude) || isNaN(latitude)) {
            res.status(400).json({ message: "Coordinates must be numbers" });
            return;
        }
        // Create the emergency
        const emergency = new emergency_schema_1.default({
            userId,
            type,
            location: {
                type: location.type,
                coordinates: [longitude, latitude],
            },
        });
        yield emergency.save();
        // Find nearby volunteers (within 5km radius)
        const volunteers = yield volunteer_schema_1.default.aggregate([
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
            yield ably_1.emergencyChannel.publish("new-emergency", {
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
        }
        else {
            // Case 2: No volunteers found - escalate to admin
            yield (0, notification_service_1.notifyAdmin)({
                emergencyId: emergency._id,
                location: location.coordinates,
                reason: "No available volunteers in 5km radius",
            });
            res.status(201).json({
                message: "Emergency created. No nearby volunteers found. Admin notified.",
                emergency,
            });
        }
        return;
    }
    catch (error) {
        res
            .status(500)
            .json({ message: "Error creating emergency", error: error.message });
        return;
    }
});
exports.createEmergency = createEmergency;
/**
 * Get all emergencies (filter by status or location)
 */
const getEmergencies = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { status, longitude, latitude, radius } = req.query;
    try {
        let query = {};
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
                            parseFloat(longitude),
                            parseFloat(latitude),
                        ],
                    },
                    $maxDistance: parseFloat(radius) * 1000, // Convert km to meters
                },
            };
        }
        const emergencies = yield emergency_schema_1.default.find(query).populate("userId", "name email");
        res.status(200).json(emergencies);
        return;
    }
    catch (error) {
        res.status(500).json({ message: "Error fetching emergencies", error });
        return;
    }
});
exports.getEmergencies = getEmergencies;
/**
 * Get a specific emergency by ID
 */
const getEmergencyById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const emergency = yield emergency_schema_1.default.findById(id).populate("userId", "name email");
        if (!emergency) {
            res.status(404).json({ message: "Emergency not found" });
            return;
        }
        res.status(200).json(emergency);
        return;
    }
    catch (error) {
        res.status(500).json({ message: "Error fetching emergency", error });
        return;
    }
});
exports.getEmergencyById = getEmergencyById;
/**
 * Update emergency status (e.g., mark as resolved)
 */
const updateEmergencyStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { status } = req.body;
    try {
        const emergency = yield emergency_schema_1.default.findByIdAndUpdate(id, { status: status }, { new: true }).populate("userId", "name email");
        if (!emergency) {
            res.status(404).json({ message: "Emergency not found" });
            return;
        }
        res.status(200).json({
            message: "Emergency status updated successfully",
            emergency,
        });
        return;
    }
    catch (error) {
        res.status(500).json({ message: "Error updating emergency status", error });
        return;
    }
});
exports.updateEmergencyStatus = updateEmergencyStatus;
/**
 * Delete an emergency
 */
const deleteEmergency = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const emergency = yield emergency_schema_1.default.findByIdAndDelete(id);
        if (!emergency) {
            res.status(404).json({ message: "Emergency not found" });
            return;
        }
        res.status(200).json({ message: "Emergency deleted successfully" });
        return;
    }
    catch (error) {
        res.status(500).json({ message: "Error deleting emergency", error });
        return;
    }
});
exports.deleteEmergency = deleteEmergency;
