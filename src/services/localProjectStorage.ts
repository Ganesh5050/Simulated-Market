// Local storage fallback for projects
class LocalProjectStorage {
  private static instance: LocalProjectStorage;
  private projects: Project[] = [];

  public static getInstance(): LocalProjectStorage {
    if (!LocalProjectStorage.instance) {
      LocalProjectStorage.instance = new LocalProjectStorage();
      LocalProjectStorage.instance.loadFromStorage();
    }
    return LocalProjectStorage.instance;
  }

  private loadFromStorage() {
    try {
      const stored = localStorage.getItem('localProjects');
      if (stored) {
        this.projects = JSON.parse(stored);
        console.log('Loaded', this.projects.length, 'projects from local storage');
      } else {
        console.log('No projects found in local storage');
      }
    } catch (error) {
      console.error('Error loading projects from local storage:', error);
      this.projects = [];
    }
  }

  createProject(projectData: {
    name: string;
    description?: string;
    prompt?: string;
  }): Project {
    const project: Project = {
      id: 'local-' + Date.now(),
      name: projectData.name,
      description: projectData.description || '',
      prompt: projectData.prompt || '',
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      user_id: '00000000-0000-0000-0000-000000000000'
    };
    
    this.projects.unshift(project);
    this.saveToStorage();
    console.log('Created local project:', project);
    return project;
  }

  getProjects(): Project[] {
    this.loadFromStorage();
    console.log('Returning', this.projects.length, 'projects from local storage');
    return this.projects;
  }

  getProject(id: string): Project | null {
    this.loadFromStorage();
    return this.projects.find(p => p.id === id) || null;
  }

  deleteProject(id: string): boolean {
    this.loadFromStorage();
    const before = this.projects.length;
    this.projects = this.projects.filter(p => p.id !== id);
    const changed = this.projects.length !== before;
    if (changed) this.saveToStorage();
    return changed;
  }

  private saveToStorage() {
    try {
      localStorage.setItem('localProjects', JSON.stringify(this.projects));
      console.log('Saved', this.projects.length, 'projects to local storage');
    } catch (error) {
      console.error('Error saving projects to local storage:', error);
    }
  }
}

export const localProjectStorage = LocalProjectStorage.getInstance();
