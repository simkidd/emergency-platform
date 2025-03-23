import { Response, NextFunction, Request } from "express";

export const isSuperAdmin = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (req.user?.role !== "super_admin") {
    return res
      .status(403)
      .json({ message: "Access denied. Super admin privileges required." });
  }
  next();
};
