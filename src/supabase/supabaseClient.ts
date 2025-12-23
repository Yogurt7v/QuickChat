// cspell:disable supabase SUPABASE
import { createClient } from '@supabase/supabase-js';

export const SUPABASE_URL = 'https://sqqexxgxawvihprjmpae.supabase.co';
export const SUPABASE_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNxcWV4eGd4YXd2aWhwcmptcGFlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTA4MTAxOCwiZXhwIjoyMDgwNjU3MDE4fQ.Hfj6SN_PIwbgHKz0lZjR2sMEZodGwCkhDQuN_AigztM';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
