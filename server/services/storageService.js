import path from "path";
import { randomUUID } from "crypto";
import { supabase } from "../config/supabase.js";
import { env } from "../config/env.js";
import { ApiError } from "../utils/apiError.js";

export async function uploadToStorage(file, folder = "uploads") {
  if (!file) return null;

  const ext = path.extname(file.originalname).toLowerCase();
  const safeName = `${folder}/${Date.now()}-${randomUUID()}${ext}`;

  const { error } = await supabase.storage
    .from(env.storageBucket)
    .upload(safeName, file.buffer, {
      contentType: file.mimetype,
      upsert: false
    });

  if (error) throw new ApiError(500, "Unable to upload image", error.message);

  const { data } = supabase.storage.from(env.storageBucket).getPublicUrl(safeName);
  return {
    path: safeName,
    url: data.publicUrl
  };
}

export async function removeFromStorage(storagePath) {
  if (!storagePath) return;
  await supabase.storage.from(env.storageBucket).remove([storagePath]);
}
