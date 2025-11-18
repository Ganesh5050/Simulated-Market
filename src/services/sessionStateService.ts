import { supabase } from '@/lib/supabase';

// Helper function to get auth token for backend requests
const getAuthToken = () => {
  return localStorage.getItem('auth_token');
};

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

export class SessionStateService {
  private static instance: SessionStateService;

  public static getInstance(): SessionStateService {
    if (!SessionStateService.instance) {
      SessionStateService.instance = new SessionStateService();
    }
    return SessionStateService.instance;
  }

  // Get user preferences
  async getUserPreferences(): Promise<UserPreferences | null> {
    const { data: { user } } = await supabase.auth.getUser();
    
    // If no user is authenticated, return default preferences
    if (!user?.id) {
      console.log('No authenticated user - using default preferences');
      return {
        id: 'guest-default',
        user_id: 'guest',
        theme: 'light',
        language: 'en',
        default_session_name: 'Default Session',
        auto_save: true,
        notifications_enabled: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
    }

    const { data, error } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.warn('Failed to fetch user preferences, using defaults:', error.message);
      return {
        id: `${user.id}-default`,
        user_id: user.id,
        theme: 'light',
        language: 'en',
        default_session_name: 'Default Session',
        auto_save: true,
        notifications_enabled: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
    }

    return data || {
      id: `${user.id}-default`,
      user_id: user.id,
      theme: 'light',
      language: 'en',
      default_session_name: 'Default Session',
      auto_save: true,
      notifications_enabled: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  }

  // Save user preferences
  async saveUserPreferences(preferences: Partial<UserPreferences>): Promise<UserPreferences> {
    const token = getAuthToken();
    if (!token) {
      console.log('No auth token, returning default preferences');
      return {
        id: 'guest-local',
        user_id: 'guest',
        theme: 'light',
        language: 'en',
        default_session_name: 'Default Session',
        auto_save: true,
        notifications_enabled: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        ...preferences 
      };
    }

    try {
      const res = await fetch('http://localhost:5050/user-preferences', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...preferences,
          updated_at: new Date().toISOString()
        }),
      });
      
      const json = await res.json();
      if (!res.ok) {
        console.warn('Failed to save user preferences via backend:', json.error);
        // Return fallback preferences
        return {
          id: 'fallback-local',
          user_id: 'guest',
          theme: 'light',
          language: 'en',
          default_session_name: 'Default Session',
          auto_save: true,
          notifications_enabled: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          ...preferences 
        };
      }
      
      return json;
    } catch (err) {
      console.warn('Failed to save user preferences, using fallback:', err);
      return {
        id: 'fallback-local',
        user_id: 'guest',
        theme: 'light',
        language: 'en',
        default_session_name: 'Default Session',
        auto_save: true,
        notifications_enabled: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        ...preferences 
      };
    }
  }

  // Get session state for a project
  async getSessionState(projectId: string, sessionName?: string): Promise<SessionState | null> {
    // Skip Supabase call for local projects (non-UUID format)
    if (projectId.startsWith('local-')) {
      console.log('Skipping Supabase fetch for local project session:', projectId);
      return null;
    }

    const { data: { user } } = await supabase.auth.getUser();
    
    // For development/testing, use a default user ID if no user is authenticated
    const userId = user?.id || '00000000-0000-0000-0000-000000000000';

    const session = sessionName || (await this.getUserPreferences())?.default_session_name || 'Main Session';

    const { data, error } = await supabase
      .from('session_states')
      .select('*')
      .eq('project_id', projectId)
      .eq('user_id', userId)
      .eq('session_name', session)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new Error(`Failed to fetch session state: ${error.message}`);
    }

    return data;
  }

  // Save session state
  async saveSessionState(projectId: string, sessionData: Partial<SessionState>, sessionName?: string): Promise<SessionState> {
    const token = getAuthToken();
    if (!token) {
      throw new Error('User not authenticated. Please login to save sessions.');
    }

    const session = sessionName || 'Main Session';

    try {
      const res = await fetch('http://localhost:5050/sessions/save', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          project_id: projectId,
          session_name: session,
          ...sessionData,
          updated_at: new Date().toISOString(),
          last_accessed_at: new Date().toISOString()
        }),
      });
      
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to save session state');
      
      return json;
    } catch (err) {
      console.error('Unexpected error saving session state:', err);
      throw err;
    }
  }

  // Get all sessions for a project
  async getProjectSessions(projectId: string): Promise<SessionState[]> {
    try {
      const token = getAuthToken();
      if (!token) {
        console.log('User not authenticated, returning empty sessions list');
        return [];
      }

      const res = await fetch(`http://localhost:5050/sessions?project_id=${projectId}`, {
        method: 'GET',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      });
      
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to fetch sessions');
      
      console.log('Loaded sessions from backend:', json.length, 'sessions for project:', projectId);
      return json;
    } catch (err) {
      console.error('Unexpected error fetching sessions:', err);
      throw err;
    }
  }

  // Delete a session
  async deleteSession(sessionId: string): Promise<void> {
    const token = getAuthToken();
    if (!token) {
      throw new Error('User not authenticated. Please login to delete sessions.');
    }

    try {
      const res = await fetch(`http://localhost:5050/sessions/${sessionId}`, {
        method: 'DELETE',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      });
      
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error || 'Failed to delete session');
      }
      
      console.log('Session deleted successfully:', sessionId);
    } catch (err) {
      console.error('Unexpected error deleting session:', err);
      throw err;
    }
  }

  // Auto-save session state (called periodically)
  async autoSaveSessionState(projectId: string, sessionData: Partial<SessionState>): Promise<void> {
    const preferences = await this.getUserPreferences();
    
    if (preferences?.auto_save) {
      try {
        await this.saveSessionState(projectId, sessionData);
      } catch (error) {
        console.warn('Auto-save failed:', error);
      }
    }
  }

  // Create a new session
  async createSession(projectId: string, sessionName: string, description?: string): Promise<SessionState> {
    const token = getAuthToken();
    if (!token) {
      throw new Error('User not authenticated. Please login to create sessions.');
    }

    try {
      const res = await fetch('http://localhost:5050/sessions', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          project_id: projectId,
          session_name: sessionName,
          analysis_input: description || '',
          selected_nodes: [],
          focused_nodes: [],
          analyzed_nodes: [],
          feedback_list: [],
          impact_score: 0,
          analyzed_sentiment: false,
          show_all_nodes: false,
          show_focused_nodes: false,
          clicked_nodes: [],
          current_voice_call: null,
          is_recording: false,
          live_transcript: '',
          analysis_progress: 0,
          is_analyzing: false,
          is_focusing: false,
          show_feedback: false,
          is_calling: false
        }),
      });
      
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to create session');
      
      console.log('Session created successfully via backend:', json);
      return json;
    } catch (err) {
      console.error('Unexpected error creating session:', err);
      throw err;
    }
  }

  // Resume session (loads state and updates last_accessed_at)
  async resumeSession(sessionId: string): Promise<SessionState> {
    const token = getAuthToken();
    if (!token) {
      throw new Error('User not authenticated. Please login to resume sessions.');
    }

    try {
      const res = await fetch(`http://localhost:5050/sessions/${sessionId}/resume`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          last_accessed_at: new Date().toISOString()
        }),
      });
      
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to resume session');
      
      return json;
    } catch (err) {
      console.error('Unexpected error resuming session:', err);
      throw err;
    }
  }
}
