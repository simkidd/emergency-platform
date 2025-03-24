import { Document, Types } from "mongoose";

export interface IVolunteer extends Document {
  userId: Types.ObjectId; // Reference to the User
  skills: string[]; // Skills of the volunteer (e.g., first aid, firefighting)
  isAvailable: boolean; // Availability status of the volunteer
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CreateVolunteerInput {
  userId: string;
  skills: string[];
  isAvailable: boolean;
}

export interface UpdateVolunteerInput {
  skills?: string[];
}
