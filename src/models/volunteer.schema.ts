import { Schema, model } from "mongoose";
import { IVolunteer } from "../interfaces/volunteer.interface";

const VolunteerSchema = new Schema<IVolunteer>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    skills: { type: [String], required: true },
    isAvailable: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const Volunteer = model<IVolunteer>("Volunteer", VolunteerSchema);

export default Volunteer;
