"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const VolunteerSchema = new mongoose_1.Schema({
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        unique: true,
    },
    skills: { type: [String], required: true },
    isAvailable: { type: Boolean, default: true },
}, { timestamps: true });
const Volunteer = (0, mongoose_1.model)("Volunteer", VolunteerSchema);
exports.default = Volunteer;
