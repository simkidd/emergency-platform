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
exports.getAvailableVolunteers = exports.searchVolunteersBySkills = exports.toggleAvailability = exports.updateVolunteerProfile = exports.getVolunteerById = exports.getAllVolunteers = exports.createVolunteerProfile = void 0;
const user_schema_1 = __importDefault(require("../models/user.schema"));
const volunteer_schema_1 = __importDefault(require("../models/volunteer.schema"));
const createVolunteerProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId, skills, isAvailable } = req.body;
    try {
        // Check if the user exists and is a volunteer
        const user = yield user_schema_1.default.findById(userId);
        if (!user || user.role !== "volunteer") {
            res.status(400).json({ message: "User is not a volunteer" });
            return;
        }
        // Check if the user already has a volunteer profile
        const existingVolunteer = yield volunteer_schema_1.default.findOne({ userId });
        if (existingVolunteer) {
            res.status(400).json({ message: "Volunteer profile already exists" });
            return;
        }
        // Create the volunteer profile
        const volunteer = new volunteer_schema_1.default({
            userId,
            skills,
            isAvailable,
        });
        yield volunteer.save();
        res.status(201).json({
            message: "Volunteer profile created successfully",
            volunteer,
        });
        return;
    }
    catch (error) {
        res
            .status(500)
            .json({ message: "Error creating volunteer profile", error });
        return;
    }
});
exports.createVolunteerProfile = createVolunteerProfile;
// Get all volunteers
const getAllVolunteers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const volunteers = yield volunteer_schema_1.default.find().populate("userId", "name email phoneNumber");
        res.status(200).json(volunteers);
        return;
    }
    catch (error) {
        res.status(500).json({ message: "Error fetching volunteers", error });
        return;
    }
});
exports.getAllVolunteers = getAllVolunteers;
// Get volunteer by ID
const getVolunteerById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const volunteer = yield volunteer_schema_1.default.findById(req.params.id).populate("userId", "name email phoneNumber");
        if (!volunteer) {
            res.status(404).json({ message: "Volunteer not found" });
            return;
        }
        res.status(200).json(volunteer);
        return;
    }
    catch (error) {
        res.status(500).json({ message: "Error fetching volunteer", error });
        return;
    }
});
exports.getVolunteerById = getVolunteerById;
// Update volunteer profile
const updateVolunteerProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const updates = req.body;
    try {
        const volunteer = yield volunteer_schema_1.default.findOne({ userId: id });
        if (!volunteer) {
            res.status(404).json({ message: "Volunteer not found" });
            return;
        }
        yield volunteer_schema_1.default.findByIdAndUpdate(id, updates, {
            new: true,
            runValidators: true,
        }).populate("userId", "name email phoneNumber");
        res.status(200).json({
            message: "Volunteer profile updated successfully",
            volunteer,
        });
        return;
    }
    catch (error) {
        res
            .status(500)
            .json({ message: "Error updating volunteer profile", error });
        return;
    }
});
exports.updateVolunteerProfile = updateVolunteerProfile;
// Toggle volunteer availability
const toggleAvailability = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const volunteer = yield volunteer_schema_1.default.findById(id);
        if (!volunteer) {
            res.status(404).json({ message: "Volunteer not found" });
            return;
        }
        volunteer.isAvailable = !volunteer.isAvailable;
        yield volunteer.save();
        res.status(200).json({
            message: `Volunteer availability set to ${volunteer.isAvailable}`,
            isAvailable: volunteer.isAvailable,
        });
        return;
    }
    catch (error) {
        res.status(500).json({ message: "Error toggling availability", error });
        return;
    }
});
exports.toggleAvailability = toggleAvailability;
// Search volunteers by skills
const searchVolunteersBySkills = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { skills } = req.query;
    try {
        if (!skills || typeof skills !== "string") {
            res.status(400).json({ message: "Skills parameter is required" });
            return;
        }
        const skillsArray = skills.split(",").map((skill) => skill.trim());
        const volunteers = yield volunteer_schema_1.default.find({
            skills: { $in: skillsArray },
        }).populate("userId", "name email phoneNumber");
        res.status(200).json(volunteers);
        return;
    }
    catch (error) {
        res.status(500).json({ message: "Error searching volunteers", error });
        return;
    }
});
exports.searchVolunteersBySkills = searchVolunteersBySkills;
// Get available volunteers
const getAvailableVolunteers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const volunteers = yield volunteer_schema_1.default.find({ isAvailable: true }).populate("userId", "name email phoneNumber");
        res.status(200).json(volunteers);
        return;
    }
    catch (error) {
        res
            .status(500)
            .json({ message: "Error fetching available volunteers", error });
        return;
    }
});
exports.getAvailableVolunteers = getAvailableVolunteers;
