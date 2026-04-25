import { createClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";
import { getEnv } from "./env";

const { supabaseUrl, supabaseAnonKey } = getEnv();

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
