import { Document } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: "user" | "volunteer" | "admin" | "super_admin";
  location: {
    type: string;
    coordinates: number[];
  };
  skills?: string[]; // Optional: For volunteers
  createdAt: Date;
  updatedAt: Date;
}
