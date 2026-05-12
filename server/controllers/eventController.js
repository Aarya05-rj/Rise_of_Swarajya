import { supabase } from "../config/supabase.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { logActivity } from "../services/activityService.js";
import { removeFromStorage, uploadToStorage } from "../services/storageService.js";

export const getEvents = asyncHandler(async (req, res) => {
  const { search = "", category, page = 1, limit = 10 } = req.query;
  const from = (Number(page) - 1) * Number(limit);
  const to = from + Number(limit) - 1;

  let query = supabase
    .from("events")
    .select("*", { count: "exact" })
    .order("event_date", { ascending: true })
    .range(from, to);

  if (search) query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
  if (category) query = query.eq("category", category);

  const { data, count, error } = await query;
  if (error) throw new ApiError(500, "Unable to fetch events", error.message);

  res.json({ success: true, data, pagination: { page: Number(page), limit: Number(limit), total: count || 0 } });
});

export const createEvent = asyncHandler(async (req, res) => {
  const image = await uploadToStorage(req.file, "events");
  const payload = {
    title: req.body.title,
    description: req.body.description,
    event_date: req.body.event_date,
    category: req.body.category,
    location: req.body.location,
    image_url: image?.url || null,
    image_path: image?.path || null,
    created_by: req.admin.id
  };

  const { data, error } = await supabase.from("events").insert(payload).select("*").single();
  if (error) throw new ApiError(400, "Unable to create event", error.message);

  await logActivity(req.admin.id, "CREATE", "event", data.id, { title: data.title });
  res.status(201).json({ success: true, data });
});

export const updateEvent = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { data: existing } = await supabase.from("events").select("*").eq("id", id).single();
  if (!existing) throw new ApiError(404, "Event not found");

  const image = req.file ? await uploadToStorage(req.file, "events") : null;
  if (image && existing.image_path) await removeFromStorage(existing.image_path);

  const payload = {
    title: req.body.title,
    description: req.body.description,
    event_date: req.body.event_date,
    category: req.body.category,
    location: req.body.location,
    image_url: image?.url || existing.image_url,
    image_path: image?.path || existing.image_path,
    updated_at: new Date().toISOString()
  };

  const { data, error } = await supabase.from("events").update(payload).eq("id", id).select("*").single();
  if (error) throw new ApiError(400, "Unable to update event", error.message);

  await logActivity(req.admin.id, "UPDATE", "event", id, { title: data.title });
  res.json({ success: true, data });
});

export const deleteEvent = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { data: existing } = await supabase.from("events").select("*").eq("id", id).single();
  if (!existing) throw new ApiError(404, "Event not found");

  const { error } = await supabase.from("events").delete().eq("id", id);
  if (error) throw new ApiError(400, "Unable to delete event", error.message);
  await removeFromStorage(existing.image_path);
  await logActivity(req.admin.id, "DELETE", "event", id, { title: existing.title });

  res.json({ success: true, message: "Event deleted" });
});
