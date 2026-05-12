const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY
);

async function checkUsersColumns() {
  try {
    console.log('Testing users table for avatar_url column...');
    const { error } = await supabase.from('users').insert({ 
      id: '00000000-0000-0000-0000-000000000000', 
      avatar_url: 'https://example.com/test.jpg' 
    });
    
    if (error) {
      console.log('Error message:', error.message);
      if (error.message.includes('column "avatar_url" of relation "users" does not exist')) {
        console.log('CONFIRMED: avatar_url column is missing in users table.');
      }
    } else {
      console.log('SUCCESS: avatar_url column exists.');
      await supabase.from('users').delete().eq('id', '00000000-0000-0000-0000-000000000000');
    }
  } catch (err) {
    console.error('Critical Script Error:', err.message);
  }
}

checkUsersColumns();
