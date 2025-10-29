const { createClient } = require('@supabase/supabase-js');
require("dotenv").config();

// Create Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// For backward compatibility, create a postgres-like interface
const sql = {
  async query(query, params = []) {
    try {
      const { data, error } = await supabase.rpc('execute_sql', {
        query: query,
        params: params
      });
      
      if (error) throw error;
      return data;
    } catch (err) {
      console.error('Supabase query error:', err);
      throw err;
    }
  }
};

async function testConnection() {
  try {
    // Test connection by querying a simple table
    const { data, error } = await supabase
      .from('auth')
      .select('count')
      .limit(1);
    
    if (error) throw error;
    console.log("✅ Connected to Supabase successfully!");
  } catch (err) {
    console.error("❌ Connection failed:", err.message);
  }
}

testConnection();

module.exports = { supabase, sql };


