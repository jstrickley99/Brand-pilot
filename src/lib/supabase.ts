import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Server-side Supabase client using service role key.
// Only use in API routes / server components — never expose to the client.
export const supabase = createClient(supabaseUrl, supabaseServiceKey);
