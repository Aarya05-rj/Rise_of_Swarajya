const supabase = require('./backend/config/supabase');

async function checkTables() {
  const tables = ['quiz_attempts', 'user_streaks', 'quiz_progress', 'profiles'];
  
  for (const table of tables) {
    console.log(`--- Table: ${table} ---`);
    const { data, error } = await supabase.from(table).select('*').limit(1);
    if (error) {
      console.error(`Error fetching ${table}:`, error.message);
    } else {
      console.log(`Columns in ${table}:`, data.length > 0 ? Object.keys(data[0]) : 'No data to determine columns');
    }
  }
}

checkTables();
