import { Document, Schema } from "mongoose";

export interface IEmergency extends Document {
  userId: Schema.Types.ObjectId;
  type: string; // Type of emergency (e.g., medical, fire, accident)
  location: {
    type: string;
    coordinates: number[]; // [longitude, latitude]
  };
  status: string; // Status of the emergency (e.g., pending, resolved)
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateEmergencyInput {
  type: string;
  location: {
    type: string;
    coordinates: number[]; // [longitude, latitude]
  };
}
