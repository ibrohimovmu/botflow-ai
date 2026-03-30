import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://yitxzokckddnqctufaei.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_v3qyXb5lX8MWiWNHtxYUuA_i4hBB359';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
