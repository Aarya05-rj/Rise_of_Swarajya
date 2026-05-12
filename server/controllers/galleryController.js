import { supabase } from "../config/supabase.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { logActivity } from "../services/activityService.js";
import { removeFromStorage, uploadToStorage } from "../services/storageService.js";

export const getGallery = asyncHandler(async (req, res) => {
  const { page = 1, limit = 24, search = "" } = req.query;
  const from = (Number(page) - 1) * Number(limit);
  const to = from + Number(limit) - 1;

  let query = supabase
    .from("gallery")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (search) query = query.or(`title.ilike.%${search}%,alt_text.ilike.%${search}%`);

  const { data, count, error } = await query;
  if (error) throw new ApiError(500, "Unable to fetch gallery", error.message);

  res.json({ success: true, data, pagination: { page: Number(page), limit: Number(limit), total: count || 0 } });
});

export const uploadGallery = asyncHandler(async (req, res) => {
  if (!req.files?.length) throw new ApiError(400, "Please upload at least one image");

  const uploadedRows = [];
  for (const file of req.files) {
    const image = await uploadToStorage(file, "gallery");
    uploadedRows.push({
      title: req.body.title || file.originalname,
      alt_text: req.body.alt_text || req.body.title || file.originalname,
      image_url: image.url,
      image_path: image.path,
      uploaded_by: req.admin.id
    });
  }

  const { data, error } = await supabase.from("gallery").insert(uploadedRows).select("*");
  if (error) throw new ApiError(400, "Unable to save gallery images", error.message);

  await logActivity(req.admin.id, "UPLOAD", "gallery", null, { count: data.length });
  res.status(201).json({ success: true, data });
});

export const deleteGalleryItem = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { data: existing } = await supabase.from("gallery").select("*").eq("id", id).single();
  if (!existing) throw new ApiError(404, "Image not found");

  const { error } = await supabase.from("gallery").delete().eq("id", id);
  if (error) throw new ApiError(400, "Unable to delete image", error.message);

  await removeFromStorage(existing.image_path);
  await logActivity(req.admin.id, "DELETE", "gallery", id, { title: existing.title });
  res.json({ success: true, message: "Image deleted" });
});
