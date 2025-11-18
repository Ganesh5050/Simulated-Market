import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Zap, Play, Target, Users, BarChart3, Globe } from "lucide-react";
import { useRealTimeData } from "@/hooks/useRealTimeData";
import { motion } from "framer-motion";

const QuickActions = () => {
  const navigate = useNavigate();
  const { stats, isLoading } = useRealTimeData();

  const actions = [
    {
      title: "Start New Analysis",
      description: "Launch your idea into the market simulation",
      icon: <Play className="w-6 h-6" />,
      color: "bg-primary",
      action: () => navigate("/simulation")
    },
    {
      title: "View Personas",
      description: "Explore AI personas and their profiles",
      icon: <Users className="w-6 h-6" />,
      color: "bg-blue-500",
      action: () => navigate("/personas")
    },
    {
      title: "Market Insights",
      description: "Get real-time market analysis",
      icon: <BarChart3 className="w-6 h-6" />,
      color: "bg-green-500",
      action: () => navigate("/market-insights")
    },
    {
      title: "Global Analysis",
      description: "Worldwide market penetration study",
      icon: <Globe className="w-6 h-6" />,
      color: "bg-purple-500",
      action: () => navigate("/tunnel")
    }
  ];

  const quickStats = stats ? [
    { label: "Active Projects", value: Math.floor(stats.totalIdeasAnalyzed / 100).toString(), trend: "+3" },
    { label: "Personas Analyzed", value: stats.totalPersonas.toLocaleString(), trend: "+156" },
    { label: "Market Insights", value: Math.floor(stats.totalIdeasAnalyzed / 50).toString(), trend: "+12" },
    { label: "Success Rate", value: `${stats.successRate}%`, trend: "+8%" }
  ] : [
    { label: "Active Projects", value: "12", trend: "+3" },
    { label: "Personas Analyzed", value: "1,247", trend: "+156" },
    { label: "Market Insights", value: "89", trend: "+12" },
    { label: "Success Rate", value: "73%", trend: "+8%" }
  ];

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
              Quick Actions
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Fast access to all PipeIt features and tools
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {quickStats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="bg-card/50 backdrop-blur-lg border border-border hover:border-primary/50 transition-colors">
                  <CardContent className="p-4 text-center">
                    <motion.div 
                      className="text-2xl font-bold"
                      key={stat.value}
                      initial={{ scale: 1.1 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.2 }}
                    >
                      {stat.value}
                    </motion.div>
                    <div className="text-sm text-muted-foreground">{stat.label}</div>
                    <Badge variant="outline" className="text-xs mt-1">
                      {stat.trend}
                    </Badge>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Action Cards */}
          <div className="grid md:grid-cols-2 gap-6">
            {actions.map((action, index) => (
              <motion.div
                key={action.title}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card 
                  className="bg-card/50 backdrop-blur-lg border border-border hover:border-primary/50 transition-colors cursor-pointer group"
                  onClick={action.action}
                >
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${action.color} text-white`}>
                        {action.icon}
                      </div>
                      {action.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{action.description}</p>
                    <Button 
                      className="mt-4 w-full group-hover:bg-primary/90 transition-colors"
                      variant="outline"
                    >
                      <Zap className="w-4 h-4 mr-2" />
                      Launch
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Recent Activity */}
          <Card className="bg-card/50 backdrop-blur-lg border border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {(stats?.recentActivity || [
                  { action: "AI-powered finance app", time: "2 hours ago", status: "Completed" },
                  { action: "Healthcare platform analysis", time: "5 hours ago", status: "In Progress" },
                  { action: "E-commerce solution", time: "1 day ago", status: "Completed" },
                  { action: "EdTech startup idea", time: "2 days ago", status: "Completed" }
                ]).slice(0, 4).map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div>
                      <p className="font-medium">{item.action}</p>
                      <p className="text-sm text-muted-foreground">{item.time}</p>
                    </div>
                    <Badge 
                      variant={item.status === 'Completed' ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {item.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Start */}
          <Card className="bg-card/50 backdrop-blur-lg border border-border">
            <CardHeader>
              <CardTitle>Quick Start Guide</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="text-center space-y-2">
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-bold mx-auto">
                    1
                  </div>
                  <h3 className="font-semibold">Enter Your Idea</h3>
                  <p className="text-sm text-muted-foreground">Describe your product or service concept</p>
                </div>
                <div className="text-center space-y-2">
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-bold mx-auto">
                    2
                  </div>
                  <h3 className="font-semibold">AI Analysis</h3>
                  <p className="text-sm text-muted-foreground">Our AI personas analyze your idea</p>
                </div>
                <div className="text-center space-y-2">
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-bold mx-auto">
                    3
                  </div>
                  <h3 className="font-semibold">Get Insights</h3>
                  <p className="text-sm text-muted-foreground">Receive detailed market feedback</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default QuickActions;
