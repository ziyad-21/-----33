
import { createClient } from '@supabase/supabase-js';

// Initialize the Supabase client.
// In a real environment, these keys should be in .env files.
// We use empty strings as defaults to prevent crashes if env vars are missing,
// though database operations will fail until valid keys are provided.

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseKey);
