const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

async function check() {
  const { data, error } = await supabase
    .from('characters')
    .select('*')
    .limit(1);

  if (error) {
    console.error('Error:', error.message);
    return;
  }

  if (data.length > 0) {
    console.log('Columns in characters table:', Object.keys(data[0]));
  } else {
    console.log('Characters table is empty.');
  }
}

check();
