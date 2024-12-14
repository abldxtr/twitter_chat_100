import { Database } from "@/database.types";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// console.log("aaaa", { supabaseUrl, supabaseKey });

export const supabase = createClient<Database>(supabaseUrl!, supabaseKey!);
