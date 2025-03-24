import { Request } from "express";

export interface CustomRequest extends Request {
  id?: string;
  role?: "user" | "volunteer" | "admin" | "super_admin";
  phoneNumber?: string
}
