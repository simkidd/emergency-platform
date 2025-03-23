import mongoose, { Schema } from "mongoose";
import { IUser } from "../interfaces/user.interface";

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["user", "volunteer", "admin", "super_admin"],
      default: "user",
    },
    location: {
      type: { type: String, default: "Point" },
      coordinates: { type: [Number], required: true }, // [longitude, latitude]
    },
    skills: [{ type: String }], // Optional: For volunteers
  },
  { timestamps: true } // Automatically adds `createdAt` and `updatedAt` fields
);

// Index for geolocation queries
userSchema.index({ location: "2dsphere" });

const User = mongoose.model<IUser>("User", userSchema);
export default User;
