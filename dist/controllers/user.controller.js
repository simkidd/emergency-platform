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
exports.getAllUsers = exports.deleteUser = exports.updateUser = exports.getUserById = void 0;
const user_schema_1 = __importDefault(require("../models/user.schema"));
const volunteer_schema_1 = __importDefault(require("../models/volunteer.schema"));
/**
 * Get the details of a specific user by ID
 */
const getUserById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const user = yield user_schema_1.default.findById(id).select("-password"); // Exclude the password field
        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }
        res.status(200).json({
            message: "User details fetched successfully",
            user,
        });
        return;
    }
    catch (error) {
        console.error(error);
        res
            .status(500)
            .json({ message: "Error fetching user details", error: error.message });
        return;
    }
});
exports.getUserById = getUserById;
/**
 * Update a user's details
 */
const updateUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { name, phoneNumber, location } = req.body;
    try {
        const user = yield user_schema_1.default.findByIdAndUpdate(id, { name, phoneNumber, location }, { new: true, runValidators: true } // Return the updated document and run schema validators
        ).select("-password");
        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }
        res.status(200).json({
            message: "User updated successfully",
            user,
        });
    }
    catch (error) {
        console.error(error);
        res
            .status(500)
            .json({ message: "Error updating user", error: error.message });
        return;
    }
});
exports.updateUser = updateUser;
/**
 * Delete a user by ID
 */
const deleteUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        // First find the user to check their role
        const user = yield user_schema_1.default.findById(id);
        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }
        // If user is a volunteer, delete their volunteer profile
        if (user.role === "volunteer") {
            yield volunteer_schema_1.default.findOneAndDelete({ userId: id });
        }
        const deletedUser = yield user_schema_1.default.findByIdAndDelete(id).select("-password");
        res.status(200).json({
            message: "User deleted successfully",
            user: {
                id: deletedUser === null || deletedUser === void 0 ? void 0 : deletedUser._id,
            },
        });
        return;
    }
    catch (error) {
        console.error(error);
        res
            .status(500)
            .json({ message: "Error deleting user", error: error.message });
        return;
    }
});
exports.deleteUser = deleteUser;
/**
 * Get all users (for admin purposes)
 */
const getAllUsers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const users = yield user_schema_1.default.find().select("-password");
        res.status(200).json({
            message: "Users fetched successfully",
            users,
        });
        return;
    }
    catch (error) {
        console.error(error);
        res
            .status(500)
            .json({ message: "Error fetching users", error: error.message });
        return;
    }
});
exports.getAllUsers = getAllUsers;
