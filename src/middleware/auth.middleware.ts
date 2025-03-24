import { NextFunction, Response } from "express";
import User from "../models/user.schema";
import { CustomRequest } from "../types/custom-request";
import { verifyToken } from "../utils/auth";

export const auth = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    res.status(401).json({ message: "Access denied. No token provided." });
    return;
  }

  try {
    const decoded = verifyToken(token);

    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      res.status(401).json({ message: "User not found." });
      return;
    }

    req.id = user?.id;
    req.role = user?.role;
    req.phoneNumber = user?.phoneNumber;

    next();
  } catch (err) {
    res.status(400).json({ message: "Invalid or expired token." });
    return;
  }
};
