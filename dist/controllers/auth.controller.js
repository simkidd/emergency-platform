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
exports.logoutUser = exports.refreshToken = exports.loginUser = exports.registerUser = void 0;
const user_schema_1 = __importDefault(require("../models/user.schema"));
const auth_1 = require("../utils/auth");
const auth_service_1 = require("../services/auth.service");
const registerUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, location, name, password, role } = req.body;
    try {
        const trimmedEmail = email.trim().toLowerCase();
        const existingUser = yield user_schema_1.default.findOne({ email: trimmedEmail });
        if (existingUser) {
            res.status(400).json({ message: "User already exists" });
            return;
        }
        const hashedPassword = yield (0, auth_1.hashPassword)(password);
        const user = new user_schema_1.default({
            name,
            email: trimmedEmail,
            password: hashedPassword,
            role,
            location: {
                type: "Point",
                coordinates: location,
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
            },
            accessToken,
            refreshToken,
        });
        return;
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error registering user", error: error });
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
