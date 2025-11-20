import { createClient } from '@supabase/supabase-js';

// Get Supabase credentials from environment variables - NO HARDCODED KEYS - v2
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
const supabaseServiceKey = import.meta.env.VITE_SUPABASE_SERVICE_KEY || '';

// Validate that environment variables are set
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables');
  // Don't throw error in production, just log it
}

// Singleton pattern to prevent multiple instances
let supabaseInstance: ReturnType<typeof createClient> | null = null;

// Use anon key for client-side operations (more secure)
export const supabase = supabaseInstance || createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce' // More secure auth flow
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  },
  global: {
    headers: {
      'X-Client-Info': 'pipeit-voice-research'
    }
  }
});

// Store the instance
if (!supabaseInstance) {
  supabaseInstance = supabase;
}

// Also export a service client for admin operations (only if service key is available)
let supabaseAdminInstance: ReturnType<typeof createClient> | null = null;
if (supabaseServiceKey) {
  supabaseAdminInstance = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}

export const supabaseAdmin = supabaseAdminInstance;

// Database types
export interface Project {
  id: string;
  name: string;
  description?: string;
  prompt?: string;
  status: string;
  created_at: string;
  updated_at: string;
  user_id: string;
}

export interface Country {
  id: string;
  name: string;
  continent: string;
  population: number;
  gdp_per_capita: number;
  internet_penetration: number;
  mobile_penetration: number;
  tech_adoption_index: number;
  created_at: string;
}

export interface Persona {
  id: string;
  name: string;
  country_id: string;
  age: number;
  gender: string;
  income_level: string;
  education_level: string;
  occupation: string;
  industry: string;
  tech_savviness: number;
  personality_traits: any;
  demographics: any;
  created_at: string;
  country?: Country;
}

export interface ProjectPersonaNode {
  id: string;
  project_id: string;
  node_id: string;
  persona_id: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  feedback?: string;
  confidence_score: number;
  lat: number;
  lon: number;
  created_at: string;
  persona?: Persona;
}

export interface AnalysisSession {
  id: string;
  project_id: string;
  name: string;
  description?: string;
  status: string;
  created_at: string;
  user_id: string;
}

export interface PersonaFeedback {
  id: string;
  project_persona_node_id: string;
  feedback_text: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  confidence_score: number;
  created_at: string;
}

export interface SessionState {
  id: string;
  project_id: string;
  user_id: string;
  session_name: string;
  analysis_input: string;
  selected_nodes: string[];
  focused_nodes: string[];
  analyzed_nodes: string[];
  feedback_list: any[];
  impact_score: number;
  analyzed_sentiment: boolean;
  show_all_nodes: boolean;
  show_focused_nodes: boolean;
  clicked_nodes: string[];
  current_voice_call: any;
  is_recording: boolean;
  live_transcript: string;
  analysis_progress: number;
  is_analyzing: boolean;
  is_focusing: boolean;
  show_feedback: boolean;
  is_calling: boolean;
  created_at: string;
  updated_at: string;
  last_accessed_at: string;
}

export interface UserPreferences {
  id: string;
  user_id: string;
  default_session_name: string;
  auto_save: boolean;
  notifications_enabled: boolean;
  theme: string;
  language: string;
  created_at: string;
  updated_at: string;
}