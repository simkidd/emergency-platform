import { NextFunction, Response } from "express";
import { CustomRequest } from "../types/custom-request";

export const roleGuard = (allowedRoles: string[]) => {
  return (req: CustomRequest, res: Response, next: NextFunction) => {
    const userRole = req.role;

    if (!userRole || !allowedRoles.includes(userRole)) {
      res.status(403).json({ message: "Forbidden: Insufficient permissions." });
      return;
    }

    next();
  };
};
