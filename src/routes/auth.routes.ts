import { Router } from "express";
import { loginUser, registerUser } from "../controllers/auth.controller";

const router = Router();

router.post("/signup", registerUser);
router.post("/login", loginUser);

export default router;
