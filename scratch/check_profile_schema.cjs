const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', 'backend', '.env') });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY
);

async function checkSchema() {
  console.log('Checking profiles table...');
  const { data, error } = await supabase.from('profiles').select('*').limit(1);
  if (error) {
    console.error('Error selecting from profiles:', error);
  } else {
    console.log('Profiles data sample:', data);
    if (data && data.length > 0) {
      console.log('Columns:', Object.keys(data[0]));
    }
  }

  console.log('Checking users table...');
  const { data: users, error: usersError } = await supabase.from('users').select('*').limit(1);
  if (usersError) {
    console.error('Error selecting from users:', usersError);
  } else {
    console.log('Users data sample:', users);
    if (users && users.length > 0) {
      console.log('Columns:', Object.keys(users[0]));
    }
  }
}

checkSchema();
