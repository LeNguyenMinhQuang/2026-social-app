import { Router } from "express";
import { create, remove, like, feed } from "./post.controller";
import { requireAuth } from "../../middlewares/auth.middleware";
import { upload } from "../../middlewares/upload.middleware";
import commentRoutes from "./comment.routes";

const router = Router();

router.get("/feed", requireAuth, feed);
router.post("/", requireAuth, upload.array("images", 4), create);
router.delete("/:postId", requireAuth, remove);
router.post("/:postId/like", requireAuth, like);
router.use("/:postId/comments", commentRoutes);

export default router;
