// Use only on frontend to run queries on Supabase

import { createClient } from "@supabase/supabase-js";

console.log(
  "Supabase client initialized with",
  process.env.NEXT_PUBLIC_SUPABASE_URL
);

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

console.log(
  "Supabase client initialized with",
  process.env.NEXT_PUBLIC_SUPABASE_URL
);

export const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
