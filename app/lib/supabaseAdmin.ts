import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Force log output
console.log("🧪 Checking Supabase env vars...");
console.log("SUPABASE_URL:", supabaseUrl);
console.log("SUPABASE_SERVICE_ROLE_KEY exists:", !!serviceRoleKey);

if (!supabaseUrl || !serviceRoleKey) {
  console.error("❌ MISSING ENV VARS");
  throw new Error("Missing Supabase environment variables");
}

export const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false },
});