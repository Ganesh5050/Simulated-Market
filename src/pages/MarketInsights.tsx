import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, TrendingUp, BarChart3, Globe, Users, Target } from "lucide-react";
import { useRealTimeData } from "@/hooks/useRealTimeData";
import { LiveDashboard } from "@/components/LiveDashboard";

const MarketInsights = () => {
  const navigate = useNavigate();
  const { stats, isLoading } = useRealTimeData();

  const insights = stats ? [
    {
      title: "AI Market Penetration",
      value: `${stats.successRate}%`,
      change: "+12%",
      trend: "up",
      description: "Global AI adoption across industries"
    },
    {
      title: "Active Personas",
      value: stats.activePersonas.toLocaleString(),
      change: "+5%",
      trend: "up", 
      description: "Currently active AI personas"
    },
    {
      title: "Ideas Analyzed",
      value: stats.totalIdeasAnalyzed.toLocaleString(),
      change: "+18%",
      trend: "up",
      description: "Total ideas processed"
    },
    {
      title: "Market Sentiment",
      value: stats.sentimentAnalysis.positive > stats.sentimentAnalysis.negative ? "Positive" : "Neutral",
      change: "+8%",
      trend: "up",
      description: "Overall market confidence"
    }
  ] : [];

  const trends = stats ? [
    {
      category: "Technology",
      trend: "AI Integration",
      impact: "High",
      timeframe: "6 months",
      personas: stats.industryBreakdown.technology
    },
    {
      category: "Finance", 
      trend: "Digital Banking",
      impact: "Medium",
      timeframe: "12 months",
      personas: stats.industryBreakdown.finance
    },
    {
      category: "Healthcare",
      trend: "Telemedicine",
      impact: "High", 
      timeframe: "18 months",
      personas: stats.industryBreakdown.healthcare
    },
    {
      category: "Education",
      trend: "Online Learning",
      impact: "Medium",
      timeframe: "24 months",
      personas: stats.industryBreakdown.education
    }
  ] : [];

  return (
    <div className="min-h-screen bg-background text-foreground font-mono">
      {/* Header */}
      <header className="border-b border-white/10 bg-background/80 backdrop-blur-md">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div 
            className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => navigate("/")}
          >
            <img src="/logo.png" alt="PipeIt Logo" className="h-8 w-auto" />
            <span className="text-xl font-bold">PipeIt</span>
          </div>
          <Button
            variant="ghost"
            className="text-sm"
            onClick={() => navigate("/projects")}
          >
            <ArrowLeft className="w-4 h-4 mr-1" /> Back to Projects
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        <div className="space-y-8">
          {/* Page Header */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
              Market Insights
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Real-time market analysis and trend predictions powered by AI personas
            </p>
          </div>

          {/* Live Dashboard */}
          <LiveDashboard />

          {/* Key Metrics */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {insights.map((insight, index) => (
              <Card key={index} className="bg-card/50 backdrop-blur-lg border border-border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {insight.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="text-2xl font-bold">{insight.value}</div>
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant={insight.trend === 'up' ? 'default' : 'destructive'}
                        className="text-xs"
                      >
                        <TrendingUp className="w-3 h-3 mr-1" />
                        {insight.change}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{insight.description}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Market Trends */}
          <Card className="bg-card/50 backdrop-blur-lg border border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Emerging Market Trends
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                {trends.map((trend, index) => (
                  <div key={index} className="space-y-3 p-4 bg-muted/50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold">{trend.category}</h3>
                      <Badge 
                        variant={trend.impact === 'High' ? 'default' : 'secondary'}
                        className="text-xs"
                      >
                        {trend.impact} Impact
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-medium">{trend.trend}</p>
                      <p className="text-xs text-muted-foreground">
                        Expected timeframe: {trend.timeframe}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Global Analysis */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="bg-card/50 backdrop-blur-lg border border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="w-5 h-5" />
                  Global Market Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">North America</span>
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-2 bg-muted rounded-full">
                        <div className="w-16 h-2 bg-primary rounded-full"></div>
                      </div>
                      <span className="text-sm font-medium">80%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Europe</span>
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-2 bg-muted rounded-full">
                        <div className="w-12 h-2 bg-primary rounded-full"></div>
                      </div>
                      <span className="text-sm font-medium">60%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Asia Pacific</span>
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-2 bg-muted rounded-full">
                        <div className="w-14 h-2 bg-primary rounded-full"></div>
                      </div>
                      <span className="text-sm font-medium">70%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/50 backdrop-blur-lg border border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Persona Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Early Adopters</span>
                    <Badge variant="default">35%</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Mainstream Users</span>
                    <Badge variant="secondary">45%</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Late Adopters</span>
                    <Badge variant="outline">20%</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center gap-4">
            <Button 
              onClick={() => navigate("/simulation")}
              className="bg-primary hover:bg-primary/90"
            >
              <Target className="w-4 h-4 mr-2" />
              Start Analysis
            </Button>
            <Button 
              variant="outline"
              onClick={() => navigate("/personas")}
            >
              <Users className="w-4 h-4 mr-2" />
              View Personas
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketInsights;
