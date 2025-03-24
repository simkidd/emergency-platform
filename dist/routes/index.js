"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_routes_1 = __importDefault(require("./auth.routes"));
const user_routes_1 = __importDefault(require("./user.routes"));
const emergency_routes_1 = __importDefault(require("./emergency.routes"));
const volunteer_routes_1 = __importDefault(require("./volunteer.routes"));
const router = (0, express_1.Router)();
router.use("/auth", auth_routes_1.default);
router.use("/users", user_routes_1.default);
router.use("/emergencies", emergency_routes_1.default);
router.use("/volunteers", volunteer_routes_1.default);
exports.default = router;
