import { Document } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  phoneNumber: string;
  role: "user" | "volunteer" | "admin" | "super_admin";
  location: {
    type: string;
    coordinates: number[]; // [longitude, latitude]
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface UpdateUserInput {
  name: string;
  phoneNumber: string;
  location: {
    type: string;
    coordinates: number[]; // [longitude, latitude]
  };
}
