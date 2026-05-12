import { supabase } from "../config/supabase.js";
import { ApiError } from "../utils/apiError.js";
import { verifyToken } from "../utils/tokens.js";

export async function protect(req, res, next) {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;

    if (!token) throw new ApiError(401, "Authentication token required");

    const payload = verifyToken(token);
    const { data: admin, error } = await supabase
      .from("admins")
      .select("id, name, email, role, is_active, avatar_url, created_at")
      .eq("id", payload.sub)
      .single();

    if (error || !admin || !admin.is_active) {
      throw new ApiError(401, "Invalid or inactive admin session");
    }

    req.admin = admin;
    next();
  } catch (error) {
    next(error.statusCode ? error : new ApiError(401, "Invalid or expired token"));
  }
}
