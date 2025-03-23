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
exports.revokeRefreshToken = exports.validateRefreshToken = exports.generateTokens = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const environments_1 = require("../config/environments");
const auth_schema_1 = __importDefault(require("../models/auth.schema"));
const { JWT_SECRET } = environments_1.environments;
const ACCESS_TOKEN_EXPIRY = "1h"; // 1 hour
const REFRESH_TOKEN_EXPIRY = "7d"; // 7 days
const generateTokens = (user) => __awaiter(void 0, void 0, void 0, function* () {
    // Generate access token
    const accessToken = jsonwebtoken_1.default.sign({ userId: user._id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRY });
    // Generate refresh token
    const refreshToken = jsonwebtoken_1.default.sign({ userId: user._id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRY });
    // Update or create the Auth document
    yield auth_schema_1.default.findOneAndUpdate({ email: user.email }, {
        userId: user._id,
        token: refreshToken,
        type: "refresh",
        expiresAt: new Date(Date.now() + 60 * 60 * 24 * 7 * 1000), // 7 days from now
    }, { upsert: true } // Create if not found
    );
    return { accessToken, refreshToken };
});
exports.generateTokens = generateTokens;
const validateRefreshToken = (refreshToken) => __awaiter(void 0, void 0, void 0, function* () {
    // verify the refresh token
    const decoded = jsonwebtoken_1.default.verify(refreshToken, JWT_SECRET);
    // Check if the token exists in the database
    const auth = yield auth_schema_1.default.findOne({ token: refreshToken, type: "refresh" });
    if (!auth) {
        throw new Error("Invalid refresh token");
    }
    return decoded.userId;
});
exports.validateRefreshToken = validateRefreshToken;
const revokeRefreshToken = (refreshToken) => __awaiter(void 0, void 0, void 0, function* () {
    // Delete the refresh token from the database
    yield auth_schema_1.default.deleteOne({ token: refreshToken, type: "refresh" });
});
exports.revokeRefreshToken = revokeRefreshToken;
