import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Debugging: This prints to your VS Code terminal (not the browser)
if (!supabaseUrl || !supabaseKey) {
  console.error('------------------------------------------------');
  console.error('🚨 SUPABASE CONNECTION ERROR 🚨');
  console.error('Missing Environment Variables in .env.local');
  console.error('URL Found:', !!supabaseUrl);
  console.error('Key Found:', !!supabaseKey);
  console.error('------------------------------------------------');
  
  throw new Error('Supabase keys are missing! Check your terminal for details.');
}

export const supabase = createClient(supabaseUrl, supabaseKey);