const { createClient } = require('@supabase/supabase-js');
const { supabaseUrl, supabaseKey } = require('./supabaseCredentials');

const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = supabase;
