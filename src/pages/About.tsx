import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Info, Users, Target, Zap, Globe } from "lucide-react";

const About = () => {
  const navigate = useNavigate();

  const features = [
    {
      title: "AI-Powered Personas",
      description: "Realistic personas based on global demographics and psychographics",
      icon: <Users className="w-6 h-6" />
    },
    {
      title: "Market Simulation",
      description: "Test your ideas against simulated market conditions",
      icon: <Target className="w-6 h-6" />
    },
    {
      title: "Real-Time Analysis",
      description: "Get instant feedback and insights from AI personas",
      icon: <Zap className="w-6 h-6" />
    },
    {
      title: "Global Reach",
      description: "Analyze market potential across continents and industries",
      icon: <Globe className="w-6 h-6" />
    }
  ];

  const team = [
    {
      name: "AI Research Team",
      role: "Persona Development",
      description: "Creating realistic AI personas for market analysis"
    },
    {
      name: "Data Science Team", 
      role: "Market Intelligence",
      description: "Building predictive models and trend analysis"
    },
    {
      name: "Product Team",
      role: "User Experience",
      description: "Designing intuitive interfaces for market research"
    }
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
        <div className="space-y-12">
          {/* Hero Section */}
          <div className="text-center space-y-6">
            <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
              About PipeIt
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              The future of market research is here. PipeIt uses AI-powered personas to simulate 
              real market conditions and provide instant feedback on your ideas.
            </p>
          </div>

          {/* Mission Statement */}
          <Card className="bg-card/50 backdrop-blur-lg border border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="w-5 h-5" />
                Our Mission
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg leading-relaxed">
                PipeIt democratizes market research by making it accessible, fast, and accurate. 
                We believe every entrepreneur and innovator deserves access to high-quality market 
                insights without the traditional barriers of time, cost, and complexity.
              </p>
            </CardContent>
          </Card>

          {/* Features */}
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-center">Key Features</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {features.map((feature, index) => (
                <Card key={index} className="bg-card/50 backdrop-blur-lg border border-border">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      <div className="p-2 bg-primary rounded-lg text-white">
                        {feature.icon}
                      </div>
                      {feature.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Technology */}
          <Card className="bg-card/50 backdrop-blur-lg border border-border">
            <CardHeader>
              <CardTitle>Technology Stack</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <h3 className="font-semibold mb-2">AI & Machine Learning</h3>
                  <div className="space-y-1">
                    <Badge variant="outline">Cohere AI</Badge>
                    <Badge variant="outline">GPT-4</Badge>
                    <Badge variant="outline">Custom Models</Badge>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Frontend</h3>
                  <div className="space-y-1">
                    <Badge variant="outline">React</Badge>
                    <Badge variant="outline">TypeScript</Badge>
                    <Badge variant="outline">Three.js</Badge>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Backend</h3>
                  <div className="space-y-1">
                    <Badge variant="outline">Supabase</Badge>
                    <Badge variant="outline">PostgreSQL</Badge>
                    <Badge variant="outline">Real-time</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Team */}
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-center">Our Team</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {team.map((member, index) => (
                <Card key={index} className="bg-card/50 backdrop-blur-lg border border-border">
                  <CardHeader>
                    <CardTitle>{member.name}</CardTitle>
                    <Badge variant="secondary">{member.role}</Badge>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{member.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "AI Personas", value: "1,000+" },
                { label: "Ideas Analyzed", value: "10,000+" },
                { label: "Countries Covered", value: "195" },
                { label: "Industries", value: "50+" }
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
            <h2 className="text-3xl font-bold">Ready to Get Started?</h2>
            <p className="text-muted-foreground">
              Join thousands of entrepreneurs who trust PipeIt for their market research
            </p>
            <div className="flex justify-center gap-4">
              <Button 
                onClick={() => navigate("/simulation")}
                className="bg-primary hover:bg-primary/90"
              >
                Start Analysis
              </Button>
              <Button 
                variant="outline"
                onClick={() => navigate("/pricing")}
              >
                View Pricing
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
