import { Router } from "express";
import { create, remove, list } from "./comment.controller";
import { requireAuth } from "../../middlewares/auth.middleware";

const router = Router({ mergeParams: true });

router.get("/", list);
router.post("/", requireAuth, create);
router.delete("/:commentId", requireAuth, remove);

export default router;
