import { Router } from "express";
import {
  loginUser,
  logoutUser,
  refreshToken,
  registerUser,
} from "../controllers/auth.controller";

const router = Router();

router.post("/signup", registerUser);
router.post("/login", loginUser);
router.post("/refresh-token", refreshToken);
router.post("/logout", logoutUser);

export default router;
