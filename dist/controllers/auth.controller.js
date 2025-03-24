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
exports.updatePassword = exports.getMe = exports.logoutUser = exports.refreshToken = exports.loginUser = exports.registerUser = void 0;
const user_schema_1 = __importDefault(require("../models/user.schema"));
const auth_1 = require("../utils/auth");
const auth_service_1 = require("../services/auth.service");
const registerUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, location, name, password, role, phoneNumber, } = req.body;
    try {
        const trimmedEmail = email.trim().toLowerCase();
        const existingUser = yield user_schema_1.default.findOne({ email: trimmedEmail });
        if (existingUser) {
            res.status(400).json({ message: "User already exists" });
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
        const hashedPassword = yield (0, auth_1.hashPassword)(password);
        const user = new user_schema_1.default({
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
        yield user.save();
        // Generate tokens
        const { accessToken, refreshToken } = yield (0, auth_service_1.generateTokens)(user);
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
    }
    catch (error) {
        console.log(error);
        res
            .status(500)
            .json({ message: "Error registering user", error: error.message });
        return;
    }
});
exports.registerUser = registerUser;
const loginUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    try {
        const trimmedEmail = email.trim().toLowerCase();
        const user = yield user_schema_1.default.findOne({ email: trimmedEmail });
        if (!user) {
            res.status(401).json({ message: "User account not found" });
            return;
        }
        const isMatch = yield (0, auth_1.comparePassword)(password, user.password);
        if (!isMatch) {
            res.status(401).json({ message: "Invalid password" });
            return;
        }
        // Generate tokens
        const { accessToken, refreshToken } = yield (0, auth_service_1.generateTokens)(user);
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
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error logging in", error: error });
        return;
    }
});
exports.loginUser = loginUser;
const refreshToken = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { refreshToken } = req.body;
    try {
        // Validate the refresh token
        const userId = yield (0, auth_service_1.validateRefreshToken)(refreshToken);
        // Generate a new access token
        const user = yield user_schema_1.default.findById(userId);
        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }
        const accessToken = (0, auth_1.generateToken)(user);
        res.status(200).json({ accessToken });
        return;
    }
    catch (error) {
        res.status(400).json({ message: "Invalid refresh token", error });
        return;
    }
});
exports.refreshToken = refreshToken;
const logoutUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { refreshToken } = req.body;
    try {
        // Revoke the refresh token
        yield (0, auth_service_1.revokeRefreshToken)(refreshToken);
        res.status(200).json({ message: "Logout successful" });
        return;
    }
    catch (error) {
        res.status(500).json({ message: "Error logging out", error });
        return;
    }
});
exports.logoutUser = logoutUser;
const getMe = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.id;
    try {
        const user = yield user_schema_1.default.findById(id).select("-password");
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
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error fetching user details", error });
        return;
    }
});
exports.getMe = getMe;
/**
 * Update a user's password
 */
const updatePassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { currentPassword, newPassword } = req.body;
    const id = req.id;
    try {
        // Find the user by ID
        const user = yield user_schema_1.default.findById(id);
        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }
        // Verify the current password
        const isMatch = yield (0, auth_1.comparePassword)(currentPassword, user.password);
        if (!isMatch) {
            res.status(400).json({ message: "Current password is incorrect" });
            return;
        }
        // Check if the new password is the same as the current password
        const isSamePassword = yield (0, auth_1.comparePassword)(newPassword, user.password);
        if (isSamePassword) {
            res.status(400).json({
                message: "New password cannot be the same as the current password",
            });
            return;
        }
        // Hash the new password
        const hashedPassword = yield (0, auth_1.hashPassword)(newPassword);
        yield user_schema_1.default.findByIdAndUpdate(id, {
            password: hashedPassword,
        }, { runValidators: false });
        res.status(200).json({ message: "Password updated successfully" });
        return;
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error updating password", error });
        return;
    }
});
exports.updatePassword = updatePassword;
