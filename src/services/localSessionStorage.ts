import { SessionState } from './sessionStateService';

// Local storage fallback for sessions
class LocalSessionStorage {
  private static instance: LocalSessionStorage;
  private sessions: SessionState[] = [];

  public static getInstance(): LocalSessionStorage {
    if (!LocalSessionStorage.instance) {
      LocalSessionStorage.instance = new LocalSessionStorage();
      LocalSessionStorage.instance.loadFromStorage();
    }
    return LocalSessionStorage.instance;
  }

  private loadFromStorage() {
    try {
      const stored = localStorage.getItem('localSessions');
      if (stored) {
        this.sessions = JSON.parse(stored);
        console.log('Loaded', this.sessions.length, 'sessions from local storage');
      } else {
        console.log('No sessions found in local storage');
      }
    } catch (error) {
      console.error('Error loading sessions from local storage:', error);
      this.sessions = [];
    }
  }

  createSession(projectId: string, sessionName: string, description?: string): SessionState {
    const session: SessionState = {
      id: 'local-session-' + Date.now(),
      project_id: projectId,
      user_id: '00000000-0000-0000-0000-000000000000',
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
      is_calling: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      last_accessed_at: new Date().toISOString()
    };
    
    this.sessions.unshift(session);
    this.saveToStorage();
    console.log('Created local session:', session);
    return session;
  }

  getProjectSessions(projectId: string): SessionState[] {
    this.loadFromStorage();
    const projectSessions = this.sessions.filter(s => s.project_id === projectId);
    console.log('Returning', projectSessions.length, 'sessions for project', projectId);
    return projectSessions;
  }

  getSession(projectId: string, sessionName: string): SessionState | null {
    this.loadFromStorage();
    return this.sessions.find(s => s.project_id === projectId && s.session_name === sessionName) || null;
  }

  updateSession(sessionId: string, updates: Partial<SessionState>): SessionState | null {
    this.loadFromStorage();
    const sessionIndex = this.sessions.findIndex(s => s.id === sessionId);
    if (sessionIndex !== -1) {
      this.sessions[sessionIndex] = {
        ...this.sessions[sessionIndex],
        ...updates,
        updated_at: new Date().toISOString()
      };
      this.saveToStorage();
      console.log('Updated local session:', this.sessions[sessionIndex]);
      return this.sessions[sessionIndex];
    }
    return null;
  }

  deleteSession(sessionId: string): boolean {
    this.loadFromStorage();
    const before = this.sessions.length;
    this.sessions = this.sessions.filter(s => s.id !== sessionId);
    const changed = this.sessions.length !== before;
    if (changed) this.saveToStorage();
    return changed;
  }

  private saveToStorage() {
    try {
      localStorage.setItem('localSessions', JSON.stringify(this.sessions));
      console.log('Saved', this.sessions.length, 'sessions to local storage');
    } catch (error) {
      console.error('Error saving sessions to local storage:', error);
    }
  }
}

export const localSessionStorage = LocalSessionStorage.getInstance();
