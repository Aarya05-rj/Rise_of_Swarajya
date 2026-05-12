import { supabase } from "../config/supabase.js";
import { asyncHandler } from "../utils/asyncHandler.js";

async function getCount(table) {
  const { count, error } = await supabase.from(table).select("id", { count: "exact", head: true });
  if (error) return 0;
  return count || 0;
}

export const getDashboard = asyncHandler(async (req, res) => {
  const [stories, events, images] = await Promise.all([
    getCount("stories"),
    getCount("events"),
    getCount("gallery")
  ]);

  const { data: recentActivities } = await supabase
    .from("activity_logs")
    .select("id, action, entity_type, entity_id, metadata, created_at, admins(name, email)")
    .order("created_at", { ascending: false })
    .limit(8);

  const { data: storyStatus } = await supabase.from("stories").select("status");
  const publishedStories = (storyStatus || []).filter((item) => item.status === "published").length;
  const draftStories = (storyStatus || []).filter((item) => item.status === "draft").length;

  res.json({
    success: true,
    stats: {
      stories,
      events,
      images,
      publishedStories,
      draftStories
    },
    recentActivities: recentActivities || []
  });
});
