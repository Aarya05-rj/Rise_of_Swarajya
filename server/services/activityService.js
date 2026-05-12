import { supabase } from "../config/supabase.js";

export async function logActivity(adminId, action, entityType, entityId = null, metadata = {}) {
  await supabase.from("activity_logs").insert({
    admin_id: adminId,
    action,
    entity_type: entityType,
    entity_id: entityId,
    metadata
  });
}
