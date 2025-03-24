import { Document, Schema } from "mongoose";

export interface IAuth extends Document {
  email: string;
  password: string;
  userId: Schema.Types.ObjectId; // Reference to the User model
  token: string; // JWT or refresh token
  type: "access" | "refresh";
  expiresAt: Date; // Token expiration date
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserInput {
  name: string;
  email: string;
  password: string;
  phoneNumber: string;
  role: string;
  location: {
    type: string;
    coordinates: number[]; // [longitude, latitude]
  };
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface UpdatePasswordInput {
  currentPassword: string;
  newPassword: string;
}
