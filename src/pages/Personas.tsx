import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Users, MapPin, Building, Calendar } from "lucide-react";
import { usePersonas } from "@/hooks/useTunnel";

const Personas = () => {
  const navigate = useNavigate();
  const { personas, isLoading, error } = usePersonas();

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
              <Users className="w-5 h-5 text-primary" />
              <div>
                <span className="text-lg font-semibold">PipeIt</span>
                <p className="text-xs text-muted-foreground">Persona Explorer</p>
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
      <main className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Global Persona Database</h1>
          <p className="text-muted-foreground">
            Explore our diverse collection of AI personas from around the world
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary">{personas.length}</div>
              <div className="text-sm text-muted-foreground">Total Personas</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary">6</div>
              <div className="text-sm text-muted-foreground">Continents</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary">30+</div>
              <div className="text-sm text-muted-foreground">Countries</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary">11</div>
              <div className="text-sm text-muted-foreground">Industries</div>
            </CardContent>
          </Card>
        </div>

        {/* Personas Grid */}
        {isLoading ? (
          <div className="text-center py-8">
            <div className="text-muted-foreground">Loading personas...</div>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <div className="text-destructive">Error loading personas: {error}</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {personas.map((persona) => (
              <Card key={persona.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">{persona.name}</CardTitle>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    {persona.age} years old
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <span>{persona.location}</span>
                    <Badge variant="outline" className="text-xs">
                      {(persona as any).continent || 'Unknown'}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm">
                    <Building className="w-4 h-4 text-muted-foreground" />
                    <span>{persona.role}</span>
                    <Badge variant="secondary" className="text-xs">
                      {persona.industry}
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    <div className="text-xs">
                      <span className="font-medium">Risk Tolerance:</span> {persona.psychographics.riskTolerance}
                    </div>
                    <div className="text-xs">
                      <span className="font-medium">Tech Adoption:</span> {persona.psychographics.techAdoption}
                    </div>
                    <div className="text-xs">
                      <span className="font-medium">Innovation:</span> {persona.psychographics.innovation}
                    </div>
                  </div>

                  <div className="pt-2">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="w-full"
                      onClick={() => navigate('/tunnel-demo')}
                    >
                      Analyze with this Persona
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Personas;
