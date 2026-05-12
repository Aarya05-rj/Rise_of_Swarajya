import { Router } from "express";
import { login, logout, profile } from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = Router();

router.post("/login", login);
router.post("/logout", protect, logout);
router.get("/profile", protect, profile);

export default router;
