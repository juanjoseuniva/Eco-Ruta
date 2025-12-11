import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SUPABASE_URL = 'https://lxehiodrlbntbsijhchh.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx4ZWhpb2RybGJudGJzaWpoY2hoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUzODc3NDYsImV4cCI6MjA4MDk2Mzc0Nn0.VscW8ISz1wEn3JmTvakalBzBO0OhfuNhtNoaPu9Knc8';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
