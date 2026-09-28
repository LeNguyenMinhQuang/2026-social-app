import { Router } from "express";
import { list, markRead, unreadCount } from "./notification.controller";
import { requireAuth } from "../../middlewares/auth.middleware";

const router = Router();

router.get("/", requireAuth, list);
router.get("/unread-count", requireAuth, unreadCount);
router.patch("/mark-read", requireAuth, markRead);

export default router;
