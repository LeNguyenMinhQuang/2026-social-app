import { Router } from "express";
import { startConversation, getConversations, getConversationMessages } from "./chat.controller";
import { requireAuth } from "../../middlewares/auth.middleware";

const router = Router();

router.get("/", requireAuth, getConversations);
router.post("/with/:username", requireAuth, startConversation);
router.get("/:conversationId/messages", requireAuth, getConversationMessages);

export default router;
