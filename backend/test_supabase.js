const supabase = require('c:/Rise_of_Maratha/backend/config/supabase.js');

async function test() {
  console.log('Testing quiz_progress table...');
  const { data: pData, error: pError } = await supabase.from('quiz_progress').select('id').limit(1);
  console.log('quiz_progress error:', pError);

  console.log('Testing quiz_attempts table...');
  const { data: aData, error: aError } = await supabase.from('quiz_attempts').select('id').limit(1);
  console.log('quiz_attempts error:', aError);

  console.log('Testing user_streaks table...');
  const { data: sData, error: sError } = await supabase.from('user_streaks').select('user_id').limit(1);
  console.log('user_streaks error:', sError);
}

test();
