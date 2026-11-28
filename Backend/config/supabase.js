const { createClient } = require("@supabase/supabase-js");

// ======================================================
// Supabase Configuration
// ======================================================

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;

// ======================================================
// Validate Environment Variables
// ======================================================

if (!supabaseUrl || !supabaseSecretKey) {
  throw new Error(
    "Missing SUPABASE_URL or SUPABASE_SECRET_KEY environment variable.",
  );
}

// ======================================================
// Initialize Supabase Client
// ======================================================

const supabase = createClient(supabaseUrl, supabaseSecretKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

module.exports = supabase;
