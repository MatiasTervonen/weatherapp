// Use only on backend to run queries on Supabase

import { createClient } from "@supabase/supabase-js";

console.log("Supabase URL:", process.env.SUPABASE_URL);
console.log(
  "Service Role Key exists:",
  !!process.env.SUPABASE_SERVICE_ROLE_KEY
);

const supabaseUrl = process.env.SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false },
});
