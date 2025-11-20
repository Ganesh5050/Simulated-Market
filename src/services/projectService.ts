import { supabase, Project, ProjectPersonaNode, AnalysisSession } from '@/lib/supabase';
import { getApiUrl } from '@/lib/api';

// Helper function to get auth token for backend requests
const getAuthToken = () => {
  return localStorage.getItem('auth_token');
};

export class ProjectService {
  private static instance: ProjectService;

  public static getInstance(): ProjectService {
    if (!ProjectService.instance) {
      ProjectService.instance = new ProjectService();
    }
    return ProjectService.instance;
  }

  // Create a new project
  async createProject(projectData: {
    name: string;
    description?: string;
    prompt?: string;
  }): Promise<Project> {
    console.log('Creating project with data:', projectData);
    
    const token = getAuthToken();
    if (!token) {
      throw new Error('User not authenticated. Please login to create projects.');
    }

    try {
      const res = await fetch('https://pipe-it-backend.onrender.com/projects', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(projectData),
      });
      
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to create project');
      
      console.log('Project created successfully:', json);
      return json;
    } catch (err) {
      console.error('Unexpected error:', err);
      throw err;
    }
  }

  // Get all projects for the current user
  async getProjects(): Promise<Project[]> {
    try {
      const token = getAuthToken();
      if (!token) {
        console.log('User not authenticated, returning empty projects list');
        return [];
      }

      const res = await fetch('https://pipe-it-backend.onrender.com/projects', {
        method: 'GET',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      });
      
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to fetch projects');
      
      console.log('Loaded projects from backend:', json.length, 'projects');
      return json;
    } catch (err) {
      console.error('Unexpected error fetching projects:', err);
      throw err;
    }
  }

  // Get a single project
  async getProject(projectId: string): Promise<Project | null> {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated. Please login to view projects.');
    }

    const userId = user.id;

    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .eq('user_id', userId)
      .single();

    if (error) {
      throw new Error(`Failed to fetch project: ${error.message}`);
    }

    return data;
  }

  // Update a project
  async updateProject(projectId: string, updates: Partial<Project>): Promise<Project> {
    const token = getAuthToken();
    if (!token) {
      throw new Error('User not authenticated. Please login to update projects.');
    }

    try {
      const res = await fetch(`https://pipe-it-backend.onrender.com/projects/${projectId}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updates),
      });
      
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to update project');
      
      return json;
    } catch (err) {
      console.error('Unexpected error updating project:', err);
      throw err;
    }
  }

  // Delete a project
  async deleteProject(projectId: string): Promise<void> {
    const token = getAuthToken();
    if (!token) {
      throw new Error('User not authenticated. Please login to delete projects.');
    }

    try {
      const res = await fetch(`https://pipe-it-backend.onrender.com/projects/${projectId}`, {
        method: 'DELETE',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      });
      
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error || 'Failed to delete project');
      }
    } catch (err) {
      console.error('Unexpected error deleting project:', err);
      throw err;
    }
  }

  // Get project persona nodes
  async getProjectPersonaNodes(projectId: string): Promise<ProjectPersonaNode[]> {
    // Skip Supabase call for local projects (non-UUID format)
    if (projectId.startsWith('local-')) {
      console.log('Skipping Supabase fetch for local project persona nodes:', projectId);
      return [];
    }

    const { data, error } = await supabase
      .from('project_persona_nodes')
      .select(`
        *,
        persona:personas(
          *,
          country:countries(*)
        )
      `)
      .eq('project_id', projectId)
      .order('node_id');

    if (error) {
      throw new Error(`Failed to fetch project persona nodes: ${error.message}`);
    }

    return data || [];
  }

  // Create analysis session
  async createAnalysisSession(sessionData: {
    project_id: string;
    name: string;
    description?: string;
  }): Promise<AnalysisSession> {
    const token = getAuthToken();
    if (!token) {
      throw new Error('User not authenticated. Please login to create sessions.');
    }

    try {
      const res = await fetch('https://pipe-it-backend.onrender.com/analysis-sessions', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(sessionData),
      });
      
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to create analysis session');
      
      return json;
    } catch (err) {
      console.error('Unexpected error creating analysis session:', err);
      throw err;
    }
  }

  // Get analysis sessions for a project
  async getAnalysisSessions(projectId: string): Promise<AnalysisSession[]> {
    const { data, error } = await supabase
      .from('analysis_sessions')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch analysis sessions: ${error.message}`);
    }

    return data || [];
  }

  // Subscribe to real-time project changes
  subscribeToProjectChanges(callback: (payload: any) => void) {
    return supabase
      .channel('project_changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'projects' 
        }, 
        callback
      )
      .subscribe();
  }
}
