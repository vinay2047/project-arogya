
import { createClient, SupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log("LOADED ENV VALUES >>>");
console.log("URL:", process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log("KEY PRESENT:", !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

console.log("SUPABASE URL:", url);
console.log("SUPABASE KEY PRESENT:", !!anonKey);
console.log("ENV CHECK:", process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

if (!url || !anonKey) {
  throw new Error("Missing NEXT_PUBLIC_SUPABASE_* env vars");
}

export const supabase: SupabaseClient = createClient(url, anonKey);
