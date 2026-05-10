const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY
);

const getRequestSupabase = (req) => {
  const authorization = req.headers?.authorization;
  if (!authorization) return supabase;

  return createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY, {
    global: {
      headers: { Authorization: authorization },
    },
  });
};

const rankForScore = (score) => {
  if (score >= 200) return 'King';
  if (score >= 101) return 'Hero';
  if (score >= 51) return 'Warrior';
  return 'Beginner';
};

const normalizeActivity = (activity) => ({
  ...activity,
  activity_name:
    activity.activity_name ||
    activity.activity_type ||
    activity.details?.activity_name ||
    'General Activity',
  activity_type:
    activity.activity_type ||
    activity.details?.activity_type ||
    'activity',
  created_at: activity.created_at || activity.timestamp || new Date().toISOString(),
});

const insertActivity = async (db, { user_id, activity_name, activity_type, details, created_at }) => {
  const variants = [
    {
      user_id,
      activity_name,
      created_at,
    },
    {
      user_id,
      activity_name,
      activity_type,
      details,
      created_at,
    },
    {
      user_id,
      activity_type: activity_type || activity_name,
      details,
      timestamp: created_at,
    },
    {
      user_id,
      activity_type: activity_type || activity_name,
      timestamp: created_at,
    },
  ];

  let lastError = null;
  for (const payload of variants) {
    const { data, error } = await db
      .from('user_activities')
      .insert(payload)
      .select('*')
      .maybeSingle();

    if (!error) return normalizeActivity(data || payload);
    lastError = error;

    const message = error.message || '';
    const isShapeError =
      message.includes('column') ||
      message.includes('schema cache') ||
      message.includes('violates not-null constraint');
    if (!isShapeError) break;
  }

  throw lastError;
};

const applyScoreBoost = async (db, userId, boost) => {
  const scoreBoost = Number(boost || 0);
  if (!userId || !Number.isFinite(scoreBoost) || scoreBoost <= 0) return null;

  const { data: profile, error: profileError } = await db
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();

  if (profileError || !profile) return null;

  const scoreColumn = Object.prototype.hasOwnProperty.call(profile, 'total_score') ? 'total_score' : 'score';
  const nextScore = (profile[scoreColumn] || 0) + scoreBoost;
  const updatePayload = { [scoreColumn]: nextScore };

  if (Object.prototype.hasOwnProperty.call(profile, 'rank')) {
    updatePayload.rank = rankForScore(nextScore);
  }
  if (Object.prototype.hasOwnProperty.call(profile, 'progress')) {
    updatePayload.progress = Math.min(Math.round((nextScore / 200) * 100), 100);
  }

  const { data, error } = await db
    .from('profiles')
    .update(updatePayload)
    .eq('id', userId)
    .select('*')
    .maybeSingle();

  if (error) {
    console.warn('[ScoreBoost Warning]', error.message);
    return null;
  }

  return data;
};

exports.getForts = async (req, res) => {
  try {
    const db = getRequestSupabase(req);
    const { data, error } = await db.from('fort_images').select('*');
    if (error) throw error;
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getCharacters = async (req, res) => {
  try {
    const db = getRequestSupabase(req);
    const { data, error } = await db.from('characters').select('*');
    if (error) throw error;
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getPowadas = async (req, res) => {
  try {
    const db = getRequestSupabase(req);
    const { data, error } = await db.from('powada').select('*');
    if (error) throw error;
    if (error) throw error;
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const db = getRequestSupabase(req);
    const { data, error } = await db.from('profiles').select('*').eq('id', id).maybeSingle();
    
    if (error || !data) {
      // Fallback to users table
      const { data: userData, error: userError } = await db.from('users').select('*').eq('id', id).maybeSingle();
      if (userError) throw userError;
      return res.json({ success: true, data: userData || {} });
    }
    
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const { full_name, avatar_url } = req.body;
    const updatePayload = { id };

    if (typeof full_name === 'string') updatePayload.full_name = full_name;
    if (typeof avatar_url === 'string') updatePayload.avatar_url = avatar_url;

    const db = supabase;
    
    // Use upsert to handle both new and existing profiles
    const { data, error } = await db
      .from('profiles')
      .upsert(updatePayload, { onConflict: 'id' })
      .select();

    if (error) {
      console.error('[UpdateProfile Error]', error.message);
      // Fallback: try the 'users' table if 'profiles' fails (common in some setups)
      const { data: userData, error: userError } = await db
        .from('users')
        .upsert(updatePayload, { onConflict: 'id' })
        .select();
      
      if (userError) throw new Error(`Profiles error: ${error.message}. Users error: ${userError.message}`);
      return res.json({ success: true, data: userData });
    }

    res.json({ success: true, data });
  } catch (error) {
    console.error('[UpdateProfile Critical Error]', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};


exports.updateScore = async (req, res) => {
  try {
    const { user_id, score } = req.body;
    const db = getRequestSupabase(req);
    if (!user_id) {
      return res.status(400).json({ success: false, error: 'user_id is required' });
    }
    
    // Attempt to fetch existing profile to merge score
    const { data: existingProfile, error: profileFetchError } = await db
      .from('profiles')
      .select('*')
      .eq('id', user_id)
      .maybeSingle();
    
    if (profileFetchError) throw profileFetchError;

    let totalScore = Number(score || 0);

    if (existingProfile) {
      const scoreColumn = ('total_score' in existingProfile) ? 'total_score' : 'score';
      totalScore = (existingProfile[scoreColumn] || 0) + Number(score || 0);
    }

    const newRank = rankForScore(totalScore);

    const updatePayload = {};
    const profileShape = existingProfile || {};
    const scoreColumn = Object.prototype.hasOwnProperty.call(profileShape, 'total_score') ? 'total_score' : 'score';
    updatePayload[scoreColumn] = totalScore;
    if (!existingProfile) updatePayload.id = user_id;
    if (!existingProfile || Object.prototype.hasOwnProperty.call(profileShape, 'rank')) updatePayload.rank = newRank;
    if (Object.prototype.hasOwnProperty.call(profileShape, 'progress')) {
      updatePayload.progress = Math.min(Math.round((totalScore / 200) * 100), 100);
    }

    const query = existingProfile
      ? db.from('profiles').update(updatePayload).eq('id', user_id)
      : db.from('profiles').upsert(updatePayload, { onConflict: 'id' });
    const { data, error } = await query.select('*');
    
    // Also save to quiz_results to maintain history
    const { error: resultError } = await db.from('quiz_results').insert({
      user_id: user_id,
      score: score,
      created_at: new Date().toISOString()
    });
    if (resultError) console.warn('[QuizResults Warning]', resultError.message);

    if (error) throw error;
    res.json({ success: true, rank: newRank, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getActivities = async (req, res) => {
  try {
    const { id } = req.params;
    const db = getRequestSupabase(req);
    const { data, error } = await db
      .from('user_activities')
      .select('*')
      .eq('user_id', id)
      .order('created_at', { ascending: false })
      .limit(5);
    
    // Graceful handling if table is missing or other errors
    if (error) {
      console.warn('[GetActivities Warning]', error.message);
      return res.json({ success: true, data: [] });
    }
    
    res.json({ success: true, data: (data || []).map(normalizeActivity) });
  } catch (error) {
    console.error('[GetActivities Error]', error.message);
    res.json({ success: true, data: [] }); // Fallback to empty list
  }
};

exports.logActivity = async (req, res) => {
  try {
    const { user_id, activity_type, activity_name, details, timestamp, score_boost } = req.body;
    const db = getRequestSupabase(req);
    if (!user_id) {
      return res.status(400).json({ success: false, error: 'user_id is required' });
    }
    
    const name = activity_name || activity_type || details?.activity_name || 'General Activity';
    const createdAt = timestamp || new Date().toISOString();
    const activity = await insertActivity(db, {
      user_id,
      activity_name: name,
      activity_type: activity_type || 'activity',
      details: {
        ...(details || {}),
        score_boost: Number(score_boost || 0),
      },
      created_at: createdAt,
    });

    const profile = await applyScoreBoost(db, user_id, score_boost);
    
    res.json({ success: true, message: 'Activity logged successfully', data: activity, profile });
  } catch (error) {
    console.error('[LogActivity Critical Error]', error.message);
    res.status(400).json({ success: false, error: error.message });
  }
};
