import { Router } from "express";
import { getProfile, updateMyProfile, uploadAvatar, follow, unfollow } from "./user.controller";
import { requireAuth, optionalAuth } from "../../middlewares/auth.middleware";
import { upload } from "../../middlewares/upload.middleware";

const router = Router();

router.get("/:username", optionalAuth, getProfile);
router.patch("/me", requireAuth, updateMyProfile);
router.post("/me/avatar", requireAuth, upload.single("avatar"), uploadAvatar);
router.post("/:username/follow", requireAuth, follow);
router.delete("/:username/follow", requireAuth, unfollow);

export default router;
