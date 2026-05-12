import bcrypt from "bcryptjs";
import { supabase } from "../config/supabase.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { signAdminToken } from "../utils/tokens.js";
import { logActivity } from "../services/activityService.js";

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) throw new ApiError(400, "Email and password are required");

  const { data: admin, error } = await supabase
    .from("admins")
    .select("*")
    .eq("email", email.toLowerCase())
    .single();

  if (error || !admin) throw new ApiError(401, "Invalid email or password");
  if (!admin.is_active) throw new ApiError(403, "Admin account is disabled");

  const isMatch = await bcrypt.compare(password, admin.password_hash);
  if (!isMatch) throw new ApiError(401, "Invalid email or password");

  await supabase.from("admins").update({ last_login_at: new Date().toISOString() }).eq("id", admin.id);
  await logActivity(admin.id, "LOGIN", "auth", admin.id);

  const token = signAdminToken(admin);
  const safeAdmin = {
    id: admin.id,
    name: admin.name,
    email: admin.email,
    role: admin.role,
    avatar_url: admin.avatar_url
  };

  res.json({ success: true, token, admin: safeAdmin });
});

export const logout = asyncHandler(async (req, res) => {
  await logActivity(req.admin.id, "LOGOUT", "auth", req.admin.id);
  res.json({ success: true, message: "Logged out successfully" });
});

export const profile = asyncHandler(async (req, res) => {
  res.json({ success: true, admin: req.admin });
});
