const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

async function check() {
  const { data, error } = await supabase.rpc('get_table_info', { tname: 'characters' });

  if (error) {
    // If RPC doesn't exist, try a direct query to information_schema
    const { data: cols, error: colError } = await supabase
      .from('characters')
      .select('*')
      .limit(1);
    
    if (cols && cols.length > 0) {
        console.log('Sample data:', cols[0]);
    }
    return;
  }
}

check();
