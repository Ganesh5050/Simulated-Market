import { createClient } from '@supabase/supabase-js';
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://giapfmvpowrmvbjpxtym.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdpYXBmbXZwb3dybXZianB4dHltIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA3MzkyNzQsImV4cCI6MjA3NjMxNTI3NH0.UJQH_CN8iU6GHU36-mNewovkE71CZ34d2EEHC3mEEIY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  }
});

export interface Project {
  id: string;
  name: string;
  description?: string;
  status: string;
  created_at: string;
  updated_at: string;
  user_id: string;
}
