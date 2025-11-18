import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Zap, Play, BarChart3, Users, Globe } from "lucide-react";

const Actions = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background text-foreground font-mono">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img 
              src="/logo.png" 
              alt="PipeIt Logo" 
              className="w-8 h-8 object-contain cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => navigate("/")}
            />
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-primary" />
              <div>
                <span className="text-lg font-semibold">PipeIt</span>
                <p className="text-xs text-muted-foreground">Quick Actions</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate("/simulation")}
            >
              Simulation
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate("/insights")}
            >
              Market Insights
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate("/personas")}
            >
              Personas
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate("/")}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Home
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-12">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold">Quick Actions</h1>
            <p className="text-muted-foreground text-lg">
              Fast access to common tasks and workflows
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Button 
              variant="outline" 
              className="h-32 flex flex-col items-center justify-center gap-3 hover:bg-primary hover:text-primary-foreground transition-colors"
              onClick={() => navigate("/simulation")}
            >
              <Play className="w-8 h-8" />
              <span className="font-semibold">Start Simulation</span>
            </Button>
            
            <Button 
              variant="outline" 
              className="h-32 flex flex-col items-center justify-center gap-3 hover:bg-primary hover:text-primary-foreground transition-colors"
              onClick={() => navigate("/insights")}
            >
              <BarChart3 className="w-8 h-8" />
              <span className="font-semibold">View Analytics</span>
            </Button>
            
            <Button 
              variant="outline" 
              className="h-32 flex flex-col items-center justify-center gap-3 hover:bg-primary hover:text-primary-foreground transition-colors"
              onClick={() => navigate("/personas")}
            >
              <Users className="w-8 h-8" />
              <span className="font-semibold">Explore Personas</span>
            </Button>
            
            <Button 
              variant="outline" 
              className="h-32 flex flex-col items-center justify-center gap-3 hover:bg-primary hover:text-primary-foreground transition-colors"
              onClick={() => navigate("/tunnel")}
            >
              <Globe className="w-8 h-8" />
              <span className="font-semibold">Global Analysis</span>
            </Button>
          </div>
          
          <div className="bg-card border border-border rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-4">Recent Activity</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded">
                <span className="text-sm">Started simulation for "AI Chatbot"</span>
                <span className="text-xs text-muted-foreground">2 hours ago</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded">
                <span className="text-sm">Completed focus group analysis</span>
                <span className="text-xs text-muted-foreground">1 day ago</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded">
                <span className="text-sm">Generated market insights report</span>
                <span className="text-xs text-muted-foreground">3 days ago</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Actions;
