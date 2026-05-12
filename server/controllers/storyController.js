import sanitizeHtml from "sanitize-html";
import { supabase } from "../config/supabase.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { logActivity } from "../services/activityService.js";
import { removeFromStorage, uploadToStorage } from "../services/storageService.js";

function sanitizeStoryContent(content) {
  return sanitizeHtml(content || "", {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat(["img", "h1", "h2", "span"]),
    allowedAttributes: {
      ...sanitizeHtml.defaults.allowedAttributes,
      "*": ["class"],
      a: ["href", "name", "target", "rel"],
      img: ["src", "alt", "title", "width", "height"]
    },
    allowedSchemes: ["http", "https", "mailto"],
    transformTags: {
      a: sanitizeHtml.simpleTransform("a", { rel: "noopener noreferrer" })
    }
  });
}

export const getStories = asyncHandler(async (req, res) => {
  const { search = "", category, status, page = 1, limit = 10 } = req.query;
  const from = (Number(page) - 1) * Number(limit);
  const to = from + Number(limit) - 1;

  let query = supabase
    .from("stories")
    .select("*", { count: "exact" })
    .order("updated_at", { ascending: false })
    .range(from, to);

  if (search) query = query.or(`title.ilike.%${search}%,excerpt.ilike.%${search}%`);
  if (category) query = query.eq("category", category);
  if (status) query = query.eq("status", status);

  const { data, count, error } = await query;
  if (error) throw new ApiError(500, "Unable to fetch stories", error.message);

  res.json({ success: true, data, pagination: { page: Number(page), limit: Number(limit), total: count || 0 } });
});

export const getStory = asyncHandler(async (req, res) => {
  const { data, error } = await supabase.from("stories").select("*").eq("id", req.params.id).single();
  if (error || !data) throw new ApiError(404, "Story not found");
  res.json({ success: true, data });
});

export const createStory = asyncHandler(async (req, res) => {
  const image = await uploadToStorage(req.file, "stories");
  const payload = {
    title: req.body.title,
    slug: req.body.slug,
    excerpt: req.body.excerpt,
    content: sanitizeStoryContent(req.body.content),
    category: req.body.category,
    status: req.body.status || "draft",
    cover_image_url: image?.url || null,
    cover_image_path: image?.path || null,
    author_id: req.admin.id,
    published_at: req.body.status === "published" ? new Date().toISOString() : null
  };

  const { data, error } = await supabase.from("stories").insert(payload).select("*").single();
  if (error) throw new ApiError(400, "Unable to create story", error.message);

  await logActivity(req.admin.id, "CREATE", "story", data.id, { title: data.title });
  res.status(201).json({ success: true, data });
});

export const updateStory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { data: existing } = await supabase.from("stories").select("*").eq("id", id).single();
  if (!existing) throw new ApiError(404, "Story not found");

  const image = req.file ? await uploadToStorage(req.file, "stories") : null;
  if (image && existing.cover_image_path) await removeFromStorage(existing.cover_image_path);

  const nextStatus = req.body.status || existing.status;
  const payload = {
    title: req.body.title,
    slug: req.body.slug,
    excerpt: req.body.excerpt,
    content: sanitizeStoryContent(req.body.content),
    category: req.body.category,
    status: nextStatus,
    cover_image_url: image?.url || existing.cover_image_url,
    cover_image_path: image?.path || existing.cover_image_path,
    published_at: nextStatus === "published" && !existing.published_at ? new Date().toISOString() : existing.published_at,
    updated_at: new Date().toISOString()
  };

  const { data, error } = await supabase.from("stories").update(payload).eq("id", id).select("*").single();
  if (error) throw new ApiError(400, "Unable to update story", error.message);

  await logActivity(req.admin.id, "UPDATE", "story", id, { title: data.title });
  res.json({ success: true, data });
});

export const deleteStory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { data: existing } = await supabase.from("stories").select("*").eq("id", id).single();
  if (!existing) throw new ApiError(404, "Story not found");

  const { error } = await supabase.from("stories").delete().eq("id", id);
  if (error) throw new ApiError(400, "Unable to delete story", error.message);
  await removeFromStorage(existing.cover_image_path);
  await logActivity(req.admin.id, "DELETE", "story", id, { title: existing.title });

  res.json({ success: true, message: "Story deleted" });
});
