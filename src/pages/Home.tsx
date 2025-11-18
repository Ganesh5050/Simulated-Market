import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import BackgroundGlobeComponent from "@/components/BackgroundGlobeComponent";

const Home = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleExplore = () => {
    setIsLoading(true);
    setTimeout(() => {
      navigate("/loading");
    }, 300);
  };

  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden font-mono relative">
      {/* Background Globe */}
      <BackgroundGlobeComponent className="opacity-20" />
      
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/80 backdrop-blur-sm">
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
            <span className="text-lg font-semibold">PipeIt</span>
          </div>
          
          <div className="hidden md:flex items-center gap-8">
            <a href="#home" className="text-sm hover:text-primary transition-colors">Home</a>
            <button 
              onClick={() => navigate("/market-insights")}
              className="text-sm hover:text-primary transition-colors"
            >
              Market Insights
            </button>
            <button 
              onClick={() => navigate("/personas")}
              className="text-sm hover:text-primary transition-colors"
            >
              Personas
            </button>
            <button 
              onClick={() => navigate("/quick-actions")}
              className="text-sm hover:text-primary transition-colors"
            >
              Quick Actions
            </button>
            <button 
              onClick={() => navigate("/about")}
              className="text-sm hover:text-primary transition-colors"
            >
              About
            </button>
            <button 
              onClick={() => navigate("/pricing")}
              className="text-sm hover:text-primary transition-colors"
            >
              Pricing
            </button>
            <button 
              onClick={() => navigate("/discovery")}
              className="text-sm hover:text-primary transition-colors flex items-center gap-1"
            >
              Discovery <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <Button
            variant="ghost"
            className="text-sm"
            onClick={() => navigate("/login")}
          >
            Login <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative min-h-screen flex flex-col items-center justify-center">
        {/* Content */}
        <div className="relative z-10 text-center px-6 space-y-8 animate-fade-in" style={{animationDelay: '0.3s'}}>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border bg-card/50 backdrop-blur-sm text-xs mb-4">
            <span className="text-muted-foreground">Latest update</span>
            <span className="text-foreground">Cloudflare Workers AI Support Is Here!</span>
            <ArrowRight className="w-3 h-3" />
          </div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
            AI agents for simulated
            <br />
            <span className="text-green-500">market research</span>
          </h1>

          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Get a market analysis in minutes, not months.
          </p>

          <Button
            onClick={handleExplore}
            disabled={isLoading}
            className="bg-foreground text-background hover:bg-foreground/90 px-8 py-6 text-base font-semibold"
          >
            Explore PipeIt <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>

        {/* Bottom Preview Section */}
        <div className="absolute bottom-0 left-0 right-0 h-64 border-t border-border bg-gradient-to-t from-background to-transparent">
          <div className="container mx-auto px-6 pt-8">
            <div className="bg-card border border-border rounded-lg p-6 max-w-4xl mx-auto">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2">
                  <img 
                    src="/logo.png" 
                    alt="PipeIt Logo" 
                    className="w-6 h-6 object-contain"
                  />
                  <span className="text-sm font-semibold">PipeIt</span>
                </div>
                <Button variant="ghost" size="sm" className="text-xs">
                  Share Simulation
                </Button>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">← Projects View</span>
                </div>
                <div className="flex gap-2">
                  <span className="px-2 py-1 bg-secondary rounded text-xs">ANALYSIS MODE</span>
                  <span className="px-2 py-1 bg-muted rounded text-xs">Ideation Scoring</span>
                </div>
                <Button variant="outline" size="sm" className="w-full">
                  + Create New Session
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Home;
