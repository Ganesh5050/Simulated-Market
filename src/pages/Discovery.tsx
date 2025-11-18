import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Search, Globe, Users, Target, Zap, TrendingUp } from "lucide-react";

const Discovery = () => {
  const navigate = useNavigate();

  const categories = [
    {
      title: "Technology",
      count: "2,847 ideas",
      description: "AI, blockchain, IoT, and emerging tech",
      icon: <Zap className="w-6 h-6" />,
      color: "bg-blue-500"
    },
    {
      title: "Healthcare",
      count: "1,923 ideas", 
      description: "Medical devices, telemedicine, health tech",
      icon: <Target className="w-6 h-6" />,
      color: "bg-green-500"
    },
    {
      title: "Finance",
      count: "1,456 ideas",
      description: "Fintech, payments, investment platforms",
      icon: <Globe className="w-6 h-6" />,
      color: "bg-purple-500"
    },
    {
      title: "Education",
      count: "1,234 ideas",
      description: "EdTech, online learning, skill development",
      icon: <Users className="w-6 h-6" />,
      color: "bg-orange-500"
    }
  ];

  const trendingIdeas = [
    {
      title: "AI-Powered Personal Finance Assistant",
      category: "Finance",
      sentiment: "Positive",
      score: 87,
      description: "An AI that helps users manage their finances with personalized advice"
    },
    {
      title: "Virtual Reality Therapy Platform",
      category: "Healthcare", 
      sentiment: "Positive",
      score: 92,
      description: "VR-based therapy sessions for mental health treatment"
    },
    {
      title: "Blockchain Supply Chain Tracker",
      category: "Technology",
      sentiment: "Neutral", 
      score: 74,
      description: "Transparent supply chain management using blockchain technology"
    },
    {
      title: "AI Language Learning Tutor",
      category: "Education",
      sentiment: "Positive",
      score: 89,
      description: "Personalized language learning with AI-powered conversation practice"
    }
  ];

      const regions = [
        { name: "North America", ideas: "4,523", growth: "+12%" },
        { name: "Europe", ideas: "3,847", growth: "+8%" },
        { name: "Asia Pacific", ideas: "5,234", growth: "+18%" },
        { name: "Latin America", ideas: "1,456", growth: "+15%" },
        { name: "Middle East", ideas: "892", growth: "+22%" },
        { name: "Africa", ideas: "1,234", growth: "+25%" }
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
              Discovery
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Explore trending ideas, market categories, and global innovation patterns
            </p>
          </div>

          {/* Search Bar */}
          <Card className="bg-card/50 backdrop-blur-lg border border-border">
            <CardContent className="p-6">
              <div className="flex gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search ideas, categories, or trends..."
                    className="w-full pl-10 pr-4 py-3 bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <Button className="bg-primary hover:bg-primary/90">
                  <Search className="w-4 h-4 mr-2" />
                  Search
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Categories */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Popular Categories</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {categories.map((category, index) => (
                <Card 
                  key={index} 
                  className="bg-card/50 backdrop-blur-lg border border-border hover:border-primary/50 transition-colors cursor-pointer group"
                >
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${category.color} text-white`}>
                        {category.icon}
                      </div>
                      {category.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">{category.description}</p>
                      <div className="flex items-center justify-between">
                        <Badge variant="outline">{category.count}</Badge>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="group-hover:text-primary transition-colors"
                        >
                          Explore →
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Trending Ideas */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Trending Ideas</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {trendingIdeas.map((idea, index) => (
                <Card key={index} className="bg-card/50 backdrop-blur-lg border border-border">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{idea.title}</CardTitle>
                      <Badge 
                        variant={idea.sentiment === 'Positive' ? 'default' : 'secondary'}
                        className="text-xs"
                      >
                        {idea.sentiment}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{idea.category}</Badge>
                      <div className="text-sm text-muted-foreground">
                        Score: {idea.score}/100
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">{idea.description}</p>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        View Analysis
                      </Button>
                      <Button size="sm" variant="ghost">
                        Similar Ideas
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Global Distribution */}
          <Card className="bg-card/50 backdrop-blur-lg border border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5" />
                Global Innovation Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {regions.map((region, index) => (
                  <div key={index} className="p-4 bg-muted/50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold">{region.name}</h3>
                      <Badge variant="outline" className="text-xs">
                        {region.growth}
                      </Badge>
                    </div>
                    <div className="text-2xl font-bold">{region.ideas}</div>
                    <div className="text-sm text-muted-foreground">ideas analyzed</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Total Ideas", value: "17,186" },
                { label: "Active Categories", value: "24" },
                { label: "Countries", value: "195" },
                { label: "Success Rate", value: "73%" }
              ].map((stat, index) => (
                <Card key={index} className="bg-card/50 backdrop-blur-lg border border-border">
                  <CardContent className="p-6 text-center">
                    <div className="text-3xl font-bold text-primary">{stat.value}</div>
                    <div className="text-sm text-muted-foreground">{stat.label}</div>
                  </CardContent>
                </Card>
              ))}
            </div>

          {/* CTA */}
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-bold">Ready to Analyze Your Idea?</h2>
            <p className="text-muted-foreground">
              Join thousands of innovators who use PipeIt to validate their ideas
            </p>
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
                onClick={() => navigate("/quick-actions")}
              >
                Quick Actions
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Discovery;
