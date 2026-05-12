import { Router } from "express";
import { createStory, deleteStory, getStories, getStory, updateStory } from "../controllers/storyController.js";
import { protect } from "../middleware/authMiddleware.js";
import { upload } from "../middleware/uploadMiddleware.js";

const router = Router();

router.get("/", protect, getStories);
router.get("/:id", protect, getStory);
router.post("/", protect, upload.single("cover"), createStory);
router.put("/:id", protect, upload.single("cover"), updateStory);
router.delete("/:id", protect, deleteStory);

export default router;
