// cspell:disable supabase SUPABASE
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://sqqexxgxawvihprjmpae.supabase.co';
const supabaseKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNxcWV4eGd4YXd2aWhwcmptcGFlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTA4MTAxOCwiZXhwIjoyMDgwNjU3MDE4fQ.Hfj6SN_PIwbgHKz0lZjR2sMEZodGwCkhDQuN_AigztM';

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,
  },
});
