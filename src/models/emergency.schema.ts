import { model, Schema } from "mongoose";
import { IEmergency } from "../interfaces/emergency.interface";

const EmergencySchema = new Schema<IEmergency>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    type: { type: String, required: true },
    location: {
      type: { type: String, default: "Point" },
      coordinates: {
        type: [Number],
        required: true,
        validate: {
          validator: (value: number[]) => value.length === 2,
          message: "Coordinates must be an array of [longitude, latitude]",
        },
      },
    },
    status: {
      type: String,
      enum: ["pending", "resolved", "cancelled"],
      default: "pending",
    },
  },
  { timestamps: true }
);

// Index for geospatial queries
EmergencySchema.index({ location: "2dsphere" });

const Emergency = model<IEmergency>("Emergency", EmergencySchema);

export default Emergency;
