import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, TrendingUp } from "lucide-react";

const Insights = () => {
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
              <TrendingUp className="w-5 h-5 text-primary" />
              <div>
                <span className="text-lg font-semibold">PipeIt</span>
                <p className="text-xs text-muted-foreground">Market Insights</p>
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
              onClick={() => navigate("/projects")}
            >
              Projects
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
            <h1 className="text-4xl font-bold">Market Insights</h1>
            <p className="text-muted-foreground text-lg">
              AI-powered market analysis and trend predictions
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-4">Trending Topics</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">AI Integration</span>
                  <span className="text-sm text-green-500">+24%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Sustainability</span>
                  <span className="text-sm text-green-500">+18%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Remote Work</span>
                  <span className="text-sm text-blue-500">+12%</span>
                </div>
              </div>
            </div>
            
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-4">Market Sentiment</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Positive</span>
                  <span className="text-sm text-green-500">68%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Neutral</span>
                  <span className="text-sm text-yellow-500">22%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Negative</span>
                  <span className="text-sm text-red-500">10%</span>
                </div>
              </div>
            </div>
            
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-4">Geographic Analysis</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">North America</span>
                  <span className="text-sm text-blue-500">45%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Europe</span>
                  <span className="text-sm text-green-500">32%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Asia Pacific</span>
                  <span className="text-sm text-purple-500">23%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Insights;
