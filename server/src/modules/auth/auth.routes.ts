import { Router } from "express";
import { register, login, logout, refreshToken } from "./auth.controller";
import { authLimiter } from "../../middlewares/rateLimiter.middleware";
import { requireAuth } from "../../middlewares/auth.middleware";

const router = Router();

router.post("/register", authLimiter, register);
router.post("/login", authLimiter, login);
router.post("/logout", logout);
router.post("/refresh-token", refreshToken);
router.get("/me", requireAuth, (req, res) => {
  res.json({ success: true, userId: req.userId });
});

export default router;
