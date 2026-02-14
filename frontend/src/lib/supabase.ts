import { createClient } from '@supabase/supabase-js';

// Credentials provided by user
const SUPABASE_URL = 'https://nhagzwbdryxqhwbhfskg.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_xf2W52mpZkLPQBItk6Mksw_DStd30Tn';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
