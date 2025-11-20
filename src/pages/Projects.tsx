import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ArrowRight, Plus, Trash2 } from "lucide-react";
import { ProjectService } from "@/services/projectService";
import { Project } from "@/lib/supabase";
import { getApiUrl } from "@/lib/api";

const Projects = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectDescription, setNewProjectDescription] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [projectService] = useState(() => ProjectService.getInstance());

  // Load projects from Supabase
  useEffect(() => {
    loadProjects();
    // fetch user name for greeting
    const token = localStorage.getItem('auth_token');
    if (token) {
      fetch(getApiUrl('/auth/me'), { headers: { Authorization: `Bearer ${token}` } })
        .then(r => r.json())
        .then(json => {
          const name = json?.user?.firstName || 'there';
          const el = document.getElementById('welcome-name');
          if (el) el.textContent = name + ',';
        })
        .catch(() => {});
    }
  }, []);

  const loadProjects = async () => {
    try {
      setIsLoading(true);
      const projectsData = await projectService.getProjects();
      setProjects(projectsData);
    } catch (error) {
      console.error('Failed to load projects:', error);
      // Fallback to mock data if Supabase fails
      setProjects([
        { id: '1', name: "Hack the North", description: "Sample project", status: "active", created_at: "2025-01-14T00:00:00Z", updated_at: "2025-01-14T00:00:00Z", user_id: "user-1" },
        { id: '2', name: "testing123", description: "Test project", status: "active", created_at: "2025-01-14T00:00:00Z", updated_at: "2025-01-14T00:00:00Z", user_id: "user-1" },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateProject = async () => {
    if (newProjectName.trim()) {
      try {
        const newProject = await projectService.createProject({
          name: newProjectName,
          description: newProjectDescription
        });
        
        setProjects(prev => [newProject, ...prev]);
        setNewProjectName("");
        setNewProjectDescription("");
        setIsDialogOpen(false);
      } catch (error) {
        console.error('Failed to create project:', error);
        alert('Failed to create project. Please try again.');
      }
    }
  };

  const handleDeleteProject = async (projectId: string, projectName: string) => {
    if (confirm(`Are you sure you want to delete "${projectName}"? This action cannot be undone.`)) {
      try {
        await projectService.deleteProject(projectId);
        setProjects(prev => prev.filter(p => p.id !== projectId));
      } catch (error) {
        console.error('Failed to delete project:', error);
        alert('Failed to delete project. Please try again.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-mono">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div 
            className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => navigate("/")}
          >
            <img 
              src="/logo.png" 
              alt="PipeIt Logo" 
              className="w-8 h-8 object-contain"
            />
            <div>
              <span className="text-lg font-semibold">PipeIt</span>
              <p className="text-xs text-muted-foreground">Projects</p>
            </div>
          </div>
          
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-sm"
            onClick={() => navigate("/login")}
          >
            Logout <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-12">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Welcome <span id="welcome-name">there,</span></h1>
              <p className="text-muted-foreground">
                Manage your AI simulation projects and view insights
              </p>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-foreground text-background hover:bg-foreground/90">
                  <Plus className="w-4 h-4 mr-2" />
                  New Project
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px] bg-background border-border">
                <DialogHeader className="space-y-2">
                  <DialogTitle className="text-xl font-semibold">Create New Project</DialogTitle>
                  <p className="text-sm text-muted-foreground">
                    Start a new AI simulation project to test your ideas
                  </p>
                </DialogHeader>
                <div className="space-y-6 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-medium">
                      Project Name
                    </Label>
                    <Input
                      id="name"
                      value={newProjectName}
                      onChange={(e) => setNewProjectName(e.target.value)}
                      placeholder="Enter project name"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleCreateProject();
                        }
                      }}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-sm font-medium">
                      Description (Optional)
                    </Label>
                    <Textarea
                      id="description"
                      value={newProjectDescription}
                      onChange={(e) => setNewProjectDescription(e.target.value)}
                      placeholder="Brief description of your project"
                      className="min-h-[80px] resize-none"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-3">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setIsDialogOpen(false);
                      setNewProjectName("");
                      setNewProjectDescription("");
                    }}
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleCreateProject}
                    disabled={!newProjectName.trim()}
                    className="bg-foreground text-background hover:bg-foreground/90"
                  >
                    Create Project
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

              {/* Projects Grid */}
              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...Array(3)].map((_, index) => (
                    <div key={index} className="bg-card border border-border rounded-lg p-6 animate-pulse">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex gap-2">
                            <div className="h-6 w-16 bg-muted rounded"></div>
                            <div className="h-6 w-20 bg-muted rounded"></div>
                          </div>
                          <div className="h-4 w-20 bg-muted rounded"></div>
                        </div>
                        <div className="h-6 w-3/4 bg-muted rounded"></div>
                        <div className="h-4 w-full bg-muted rounded"></div>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <div className="h-8 w-12 bg-muted rounded"></div>
                            <div className="h-6 w-16 bg-muted rounded"></div>
                          </div>
                          <div className="flex gap-1">
                            {Array.from({ length: 10 }).map((_, i) => (
                              <div key={i} className="h-2 flex-1 bg-muted rounded"></div>
                            ))}
                          </div>
                        </div>
                        <div className="h-4 w-24 bg-muted rounded"></div>
                        <div className="h-10 w-full bg-muted rounded"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {projects.map((project) => (
                    <div
                      key={project.id}
                      className="bg-card border border-border rounded-lg p-6 hover:border-primary/50 transition-all group relative"
                    >
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex gap-2">
                            <span className="px-2 py-1 bg-secondary rounded text-xs">
                              simulation
                            </span>
                            <span className="px-2 py-1 bg-secondary rounded text-xs">
                              ai-powered
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">
                              {new Date(project.created_at).toLocaleDateString('en-US', { 
                                year: 'numeric', 
                                month: 'short', 
                                day: 'numeric' 
                              })}
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteProject(project.id, project.name);
                              }}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>

                        <h3 className="text-xl font-semibold">{project.name}</h3>

                        <p className="text-sm text-muted-foreground">
                          {project.description || "AI-powered market research simulation"}
                        </p>

                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-2xl font-bold">0%</span>
                            <span className="px-2 py-1 bg-muted rounded text-xs self-end">
                              {project.status}
                            </span>
                          </div>
                          <div className="flex gap-1">
                            {Array.from({ length: 40 }).map((_, i) => (
                              <div
                                key={i}
                                className={`h-2 flex-1 ${
                                  i < 0 ? "bg-foreground" : "bg-muted"
                                }`}
                              />
                            ))}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                          0 simulations
                        </div>

                        <Button
                          variant="outline"
                          className="w-full group-hover:bg-foreground group-hover:text-background transition-colors"
                          onClick={() => navigate(`/simulation/${project.id}`)}
                        >
                          Open Project <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
        </div>
      </main>
    </div>
  );
};

export default Projects;