const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

exports.getForts = async (req, res) => {
  try {
    const { data, error } = await supabase.from('fort_images').select('*');
    if (error) throw error;
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getCharacters = async (req, res) => {
  try {
    const { data, error } = await supabase.from('character_image').select('*');
    if (error) throw error;
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getPowadas = async (req, res) => {
  try {
    const { data, error } = await supabase.from('powada').select('*');
    if (error) throw error;
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase.from('profiles').select('*').eq('id', id).single();
    if (error) throw error;
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const { full_name, avatar_url } = req.body;
    const updatePayload = {};

    if (typeof full_name === 'string') updatePayload.full_name = full_name;
    if (typeof avatar_url === 'string') updatePayload.avatar_url = avatar_url;

    const { data, error } = await supabase.from('profiles').update(updatePayload).eq('id', id).select();
    if (error) throw error;
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.updateScore = async (req, res) => {
  try {
    const { user_id, score } = req.body;
    
    // Attempt to fetch existing profile to merge score
    const { data: existingProfile } = await supabase.from('profiles').select('*').eq('id', user_id).single();
    
    let totalScore = score;

    if (existingProfile) {
      const scoreColumn = ('total_score' in existingProfile) ? 'total_score' : 'score';
      totalScore = (existingProfile[scoreColumn] || 0) + score;
    }

    // Determine new rank based on requested logic
    let newRank = 'Beginner';
    if (totalScore >= 200) {
      newRank = 'King';
    } else if (totalScore >= 101) {
      newRank = 'Hero';
    } else if (totalScore >= 51) {
      newRank = 'Warrior';
    }

    // Progress percentage based on next rank (Assuming King at 200 is 100%)
    let progress = Math.min((totalScore / 200) * 100, 100);

    const updatePayload = {
      total_score: totalScore,
      rank: newRank,
      progress: progress
    };

    const { data, error } = await supabase.from('profiles').update(updatePayload).eq('id', user_id).select();
    
    // Also save to quiz_results to maintain history
    await supabase.from('quiz_results').insert({
      user_id: user_id,
      score: score,
      created_at: new Date().toISOString()
    });

    if (error) throw error;
    res.json({ success: true, rank: newRank, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getActivities = async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('user_activities')
      .select('*')
      .eq('user_id', id)
      .order('timestamp', { ascending: false })
      .limit(5);
    
    if (error) throw error;
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.logActivity = async (req, res) => {
  try {
    const { user_id, activity_type, details, timestamp } = req.body;
    
    const { error } = await supabase.from('user_activities').insert({
      user_id,
      activity_type,
      details: details || {},
      timestamp: timestamp || new Date().toISOString()
    });
    
    if (error) throw error;
    res.json({ success: true, message: "Activity logged successfully" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
