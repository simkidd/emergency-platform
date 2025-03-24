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
exports.auth = void 0;
const user_schema_1 = __importDefault(require("../models/user.schema"));
const auth_1 = require("../utils/auth");
const auth = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const token = (_a = req.header("Authorization")) === null || _a === void 0 ? void 0 : _a.replace("Bearer ", "");
    if (!token) {
        res.status(401).json({ message: "Access denied. No token provided." });
        return;
    }
    try {
        const decoded = (0, auth_1.verifyToken)(token);
        const user = yield user_schema_1.default.findById(decoded.userId).select("-password");
        if (!user) {
            res.status(401).json({ message: "User not found." });
            return;
        }
        req.id = user === null || user === void 0 ? void 0 : user.id;
        req.role = user === null || user === void 0 ? void 0 : user.role;
        req.phoneNumber = user === null || user === void 0 ? void 0 : user.phoneNumber;
        next();
    }
    catch (err) {
        res.status(400).json({ message: "Invalid or expired token." });
        return;
    }
});
exports.auth = auth;
