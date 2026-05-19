import { createClient } from "@supabase/supabase-js";

// Both naming conventions support karta hai
const supabaseUrl = 
  process.env.SUPABASE_URL || 
  process.env.NEXT_PUBLIC_SUPABASE_URL;

const supabaseKey = 
  process.env.SUPABASE_SERVICE_KEY ||           // service role (best)
  process.env.SUPABASE_SERVICE_ROLE_KEY ||      // alternate name
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || // fallback: anon/publishable
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;   // fallback: anon

if (!supabaseUrl) {
  console.error("❌ SUPABASE_URL missing in .env");
}
if (!supabaseKey) {
  console.error("❌ SUPABASE_SERVICE_KEY missing in .env");
}

export const supabase = supabaseUrl && supabaseKey
  ? createClient(supabaseUrl, supabaseKey, { auth: { persistSession: false } })
  : null;
