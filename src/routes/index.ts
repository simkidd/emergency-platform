import { Router } from "express";
import authRoutes from "./auth.routes";
import userRoutes from "./user.routes";
import emergencyRoutes from "./emergency.routes";
import volunteerRoutes from "./volunteer.routes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/emergencies", emergencyRoutes);
router.use("/volunteers", volunteerRoutes);

export default router;
