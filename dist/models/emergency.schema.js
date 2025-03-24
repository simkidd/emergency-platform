"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const EmergencySchema = new mongoose_1.Schema({
    userId: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", required: true },
    type: { type: String, required: true },
    location: {
        type: { type: String, default: "Point" },
        coordinates: {
            type: [Number],
            required: true,
            validate: {
                validator: (value) => value.length === 2,
                message: "Coordinates must be an array of [longitude, latitude]",
            },
        },
    },
    status: {
        type: String,
        enum: ["pending", "resolved", "cancelled"],
        default: "pending",
    },
}, { timestamps: true });
// Index for geospatial queries
EmergencySchema.index({ location: "2dsphere" });
const Emergency = (0, mongoose_1.model)("Emergency", EmergencySchema);
exports.default = Emergency;
