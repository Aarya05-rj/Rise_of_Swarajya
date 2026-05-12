import { Router } from "express";
import { deleteGalleryItem, getGallery, uploadGallery } from "../controllers/galleryController.js";
import { protect } from "../middleware/authMiddleware.js";
import { upload } from "../middleware/uploadMiddleware.js";

const router = Router();

router.get("/", protect, getGallery);
router.post("/upload", protect, upload.array("images", 12), uploadGallery);
router.delete("/:id", protect, deleteGalleryItem);

export default router;
