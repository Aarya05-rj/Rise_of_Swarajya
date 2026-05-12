const supabase = require('../backend/config/supabase');

async function mockSubmit() {
  const userId = '00000000-0000-0000-0000-000000000000'; // Replace with a real user ID if possible, or use a dummy
  // Note: This might fail if the user ID doesn't exist in auth.users
  
  // Try to find a real user first
  const { data: users } = await supabase.from('users').select('id').limit(1);
  const targetId = users?.[0]?.id || userId;

  console.log(`Mocking quiz submission for user: ${targetId}`);

  const payload = {
    user_id: targetId,
    level_id: 1,
    quiz_id: '1-1',
    score: 100,
    correct_answers: 10,
    total_questions: 10,
    stars: 3,
    time_taken: 120,
    answers: []
  };

  const { data, error } = await supabase.from('quiz_attempts').insert(payload).select();
  if (error) {
    console.error('Error inserting quiz attempt:', error.message);
  } else {
    console.log('Successfully inserted quiz attempt:', data);
  }

  // Check streaks
  const { data: streak, error: streakError } = await supabase
    .from('user_streaks')
    .upsert({ user_id: targetId, current_streak: 1, last_active_date: new Date().toISOString().split('T')[0] })
    .select();
  
  if (streakError) {
    console.error('Error updating streak:', streakError.message);
  } else {
    console.log('Successfully updated streak:', streak);
  }
}

mockSubmit();
