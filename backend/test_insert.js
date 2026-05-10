const supabase = require('c:/Rise_of_Maratha/backend/config/supabase.js');

async function testInsert() {
  const userId = '00000000-0000-0000-0000-000000000000'; // Mock UUID
  console.log('Testing insert into quiz_attempts...');
  
  const { data, error } = await supabase
    .from('quiz_attempts')
    .insert({
      user_id: userId,
      level_id: 1,
      quiz_id: '1-1',
      score: 100,
      correct_answers: 10,
      total_questions: 10,
      stars: 3,
      time_taken: 100,
      answers: []
    })
    .select('*')
    .single();

  console.log('Insert Result Data:', data);
  console.log('Insert Result Error:', error);

  console.log('Testing insert into user_streaks...');
  const { data: sData, error: sError } = await supabase
    .from('user_streaks')
    .upsert({
      user_id: userId,
      current_streak: 1,
      last_active_date: '2026-05-05'
    })
    .select('*')
    .single();

  console.log('Streak Insert Error:', sError);
}

testInsert();
