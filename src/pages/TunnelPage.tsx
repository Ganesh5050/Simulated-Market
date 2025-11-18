import { useState, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import { generatePersonas, selectFocusGroup, generatePersonaFeedback } from '@/utils/generatePersonas';
import { Persona } from '@/types/persona';
import Tunnel from '@/components/Tunnel';
import { GlobeScene } from '@/components/ui/globe-fallback';

const TunnelPage = () => {
  const [idea, setIdea] = useState('');
  const [isLaunching, setIsLaunching] = useState(false);
  const [showTunnel, setShowTunnel] = useState(false);
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [focusGroup, setFocusGroup] = useState<Persona[]>([]);
  const [selectedPersona, setSelectedPersona] = useState<Persona | null>(null);
  const [showPersonas, setShowPersonas] = useState(false);
  const [showFocusGroup, setShowFocusGroup] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisComplete, setAnalysisComplete] = useState(false);

  // Generate personas on mount
  useEffect(() => {
    const generatedPersonas = generatePersonas(200);
    setPersonas(generatedPersonas);
  }, []);

  const handleLaunch = () => {
    if (!idea.trim()) return;
    
    setIsLaunching(true);
    setShowTunnel(true);
    
    // Simulate tunnel animation
    setTimeout(() => {
      setShowTunnel(false);
      setShowPersonas(true);
      setIsLaunching(false);
    }, 3000);
  };

  const handleFocusGroup = () => {
    if (!idea.trim()) return;
    
    setIsAnalyzing(true);
    const selected = selectFocusGroup(personas, idea, 5);
    
    // Generate feedback for focus group
    const focusGroupWithFeedback = selected.map(persona => {
      const feedback = generatePersonaFeedback(persona, idea);
      return {
        ...persona,
        sentiment: feedback.sentiment,
        feedback: feedback.feedback,
        reasoning: feedback.reasoning,
      };
    });
    
    setFocusGroup(focusGroupWithFeedback);
    
    setTimeout(() => {
      setIsAnalyzing(false);
      setShowFocusGroup(true);
      setAnalysisComplete(true);
    }, 2000);
  };

  const handleGlobalDeployment = () => {
    // Generate feedback for all personas
    const allPersonasWithFeedback = personas.map(persona => {
      const feedback = generatePersonaFeedback(persona, idea);
      return {
        ...persona,
        sentiment: feedback.sentiment,
        feedback: feedback.feedback,
        reasoning: feedback.reasoning,
      };
    });
    
    setPersonas(allPersonasWithFeedback);
    setShowPersonas(true);
  };

  const getSentimentColor = (sentiment?: string) => {
    switch (sentiment) {
      case 'positive': return 'bg-green-500';
      case 'negative': return 'bg-red-500';
      default: return 'bg-yellow-500';
    }
  };

  const getSentimentCounts = () => {
    const withSentiment = personas.filter(p => p.sentiment);
    return {
      positive: withSentiment.filter(p => p.sentiment === 'positive').length,
      neutral: withSentiment.filter(p => p.sentiment === 'neutral').length,
      negative: withSentiment.filter(p => p.sentiment === 'negative').length,
    };
  };

  const counts = getSentimentCounts();

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <nav className="border-b border-white/10 bg-black/80 backdrop-blur-md">
        <div className="px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-lg flex items-center justify-center font-bold text-black text-lg">
              T
            </div>
            <span className="text-xl font-bold">Tunnel</span>
          </div>
          <div className="text-sm text-gray-400">
            AI-Powered Market Simulation
          </div>
        </div>
      </nav>

      <div className="flex h-screen">
        {/* Left Panel - Input */}
        <div className="w-1/3 border-r border-white/10 p-6 flex flex-col">
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold mb-2">Test Your Idea</h1>
              <p className="text-gray-400">
                Enter your product idea and watch it travel through our AI-powered market simulation tunnel.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Your Product Idea</label>
                <Textarea
                  value={idea}
                  onChange={(e) => setIdea(e.target.value)}
                  placeholder="Describe your product idea... e.g., 'AI-powered tool for lost car keys'"
                  className="bg-black/50 border-white/20 text-white placeholder-gray-500 min-h-[120px]"
                />
              </div>

              <Button
                onClick={handleLaunch}
                disabled={!idea.trim() || isLaunching}
                className="w-full bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700"
              >
                {isLaunching ? '🚀 Launching...' : '🚀 Launch Into Tunnel'}
              </Button>
            </div>

            {/* Analysis Controls */}
            <AnimatePresence>
              {showPersonas && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  <div className="border-t border-white/10 pt-4">
                    <h3 className="font-semibold mb-3">Analysis Controls</h3>
                    
                    <div className="space-y-2">
                      <Button
                        onClick={handleFocusGroup}
                        disabled={isAnalyzing}
                        variant="outline"
                        className="w-full border-white/20 hover:bg-white/10"
                      >
                        {isAnalyzing ? '🎯 Analyzing...' : '🎯 Focus Group (5 personas)'}
                      </Button>
                      
                      <Button
                        onClick={handleGlobalDeployment}
                        variant="outline"
                        className="w-full border-white/20 hover:bg-white/10"
                      >
                        🌍 Global Deployment (200+ personas)
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Results Summary */}
            <AnimatePresence>
              {analysisComplete && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="border-t border-white/10 pt-4"
                >
                  <h3 className="font-semibold mb-3">Market Analysis</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-green-400">Positive</span>
                      <span>{counts.positive}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-yellow-400">Neutral</span>
                      <span>{counts.neutral}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-red-400">Negative</span>
                      <span>{counts.negative}</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Right Panel - Visualization */}
        <div className="flex-1 relative">
          {/* Tunnel Animation */}
          <AnimatePresence>
            {showTunnel && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-10"
              >
                <div className="w-full h-full bg-black flex items-center justify-center">
                  <div className="w-96 h-96">
                    <GlobeScene nodes={[]} />
                    <Tunnel isActive={true} />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Globe with Personas */}
          <AnimatePresence>
            {showPersonas && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="w-full h-full"
              >
                <GlobeScene 
                  nodes={personas.map(p => ({
                    id: p.id,
                    lat: p.demographics.location.coordinates.lat,
                    lon: p.demographics.location.coordinates.lon,
                    status: p.sentiment === 'positive' ? 'green' : 
                           p.sentiment === 'negative' ? 'red' : 'yellow',
                    name: p.name,
                  }))} 
                  onNodeClick={(node) => {
                    const persona = personas.find(p => p.id === node.id);
                    if (persona) setSelectedPersona(persona);
                  }}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Focus Group Highlight */}
          <AnimatePresence>
            {showFocusGroup && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute top-4 left-4 bg-black/80 backdrop-blur-md p-4 rounded-lg border border-white/20"
              >
                <h3 className="font-semibold mb-2">Focus Group Results</h3>
                <div className="space-y-2">
                  {focusGroup.map((persona, index) => (
                    <div key={persona.id} className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${getSentimentColor(persona.sentiment)}`} />
                      <span className="text-sm">{persona.name}</span>
                      <Badge variant="outline" className="text-xs">
                        {persona.sentiment}
                      </Badge>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Persona Detail Modal */}
      <AnimatePresence>
        {selectedPersona && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedPersona(null)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-black border border-white/20 rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-bold">{selectedPersona.name}</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedPersona(null)}
                >
                  ✕
                </Button>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Demographics</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>Age: {selectedPersona.demographics.age}</div>
                    <div>Role: {selectedPersona.demographics.role}</div>
                    <div>Industry: {selectedPersona.demographics.industry}</div>
                    <div>Location: {selectedPersona.demographics.location.city}</div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Psychographics</h3>
                  <div className="text-sm space-y-1">
                    <div>Risk Tolerance: {selectedPersona.psychographics.riskTolerance}</div>
                    <div>Tech Adoption: {selectedPersona.psychographics.techAdoption}</div>
                    <div>Communication: {selectedPersona.psychographics.communicationStyle}</div>
                  </div>
                </div>

                {selectedPersona.feedback && (
                  <div>
                    <h3 className="font-semibold mb-2">Feedback</h3>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className={getSentimentColor(selectedPersona.sentiment)}>
                        {selectedPersona.sentiment}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-300 mb-2">{selectedPersona.feedback}</p>
                    <p className="text-xs text-gray-400">{selectedPersona.reasoning}</p>
                  </div>
                )}

                <div>
                  <h3 className="font-semibold mb-2">Interests & Goals</h3>
                  <div className="text-sm">
                    <div className="mb-2">
                      <span className="text-gray-400">Interests: </span>
                      {selectedPersona.interests.join(', ')}
                    </div>
                    <div className="mb-2">
                      <span className="text-gray-400">Goals: </span>
                      {selectedPersona.goals.join(', ')}
                    </div>
                    <div>
                      <span className="text-gray-400">Pain Points: </span>
                      {selectedPersona.painPoints.join(', ')}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TunnelPage;
