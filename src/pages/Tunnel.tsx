import React, { useState, useEffect } from 'react';
import { useTunnel } from '@/hooks/useTunnel';
import { voiceRecordingService, VoiceCall } from '@/services/voiceRecordingService';
import { directPersonaVoiceService, DirectVoiceCall } from '@/services/directPersonaVoiceService';
import { professionalVoiceService, ProfessionalVoiceCall } from '@/services/professionalVoiceService'; // Keep import to prevent TypeScript errors
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, ArrowLeft, Users, TrendingUp, Mic, MicOff, Play, Download, Brain, Globe, BarChart3, MessageSquare, Star, AlertCircle, CheckCircle, Phone, PhoneOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import GlobeScene from '@/components/GlobeScene';
import { Node } from '@/components/GlobeNodes';

type AnalysisPhase = 'idle' | 'analyzing' | 'completed' | 'focus-group';
type AnalysisStep = 'initializing' | 'generating-personas' | 'analyzing-sentiment' | 'calculating-insights' | 'building-report';

const Tunnel: React.FC = () => {
  const navigate = useNavigate();
  const [analysisPhase, setAnalysisPhase] = useState<AnalysisPhase>('idle');
  const [userIdea, setUserIdea] = useState('');
  const [userId] = useState('demo-user-123'); // In real app, this would come from auth
  const [currentVoiceCall, setCurrentVoiceCall] = useState<VoiceCall | null>(null);
  const [currentProfessionalCall, setCurrentProfessionalCall] = useState<ProfessionalVoiceCall | null>(null); // Keep state to prevent TypeScript errors
  const [currentDirectCall, setCurrentDirectCall] = useState<DirectVoiceCall | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [voiceMode, setVoiceMode] = useState<'offline' | 'direct' | 'professional'>('professional'); // Use Professional mode (Vapi.ai) as default
  const [currentStep, setCurrentStep] = useState<AnalysisStep>('initializing');
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [selectedPersona, setSelectedPersona] = useState<any>(null);
  
  // Sample ideas for quick testing
  const sampleIdeas = [
    "AI-powered personal shopping assistant that learns your style",
    "Virtual reality platform for remote team collaboration",
    "Smart home system that predicts and adjusts to your needs",
    "Mobile app that translates sign language in real-time",
    "Blockchain-based voting system for secure elections"
  ];
  
  const {
    analysis,
    isLoading,
    error,
    analyzeIdea,
    clearError,
  } = useTunnel();

  const handleAnalyze = async () => {
    if (!userIdea.trim()) {
      alert('Please enter an idea to analyze!');
      return;
    }

    console.log('=== TUNNEL SIMULATION START ===');
    console.log('User idea:', userIdea);
    
    setAnalysisPhase('analyzing');
    setAnalysisProgress(0);
    
    // Simulate real-time progress
    const steps: AnalysisStep[] = ['initializing', 'generating-personas', 'analyzing-sentiment', 'calculating-insights', 'building-report'];
    
    for (let i = 0; i < steps.length; i++) {
      setCurrentStep(steps[i]);
      setAnalysisProgress((i + 1) * 20);
      await new Promise(resolve => setTimeout(resolve, 800)); // Simulate processing time
    }
    
    await analyzeIdea(userId, userIdea);
    setAnalysisPhase('completed');
    setAnalysisProgress(100);
    console.log('=== TUNNEL SIMULATION COMPLETE ===');
  };

  const handleFocusGroup = () => {
    console.log('=== FOCUS GROUP ACTIVATED ===');
    setAnalysisPhase('focus-group');
  };

  const handleNodeClick = (persona: any) => {
    console.log('=== PERSONA CLICKED ===');
    console.log('Clicked persona:', persona);
    
    // Show persona info and enable voice call
    if (analysis && persona.id) {
      const personaData = analysis.focusGroupPersonas.find(p => p.id === persona.id);
      if (personaData) {
        // Start voice call with this specific persona
        handleVoiceCall(persona.id);
      }
    }
  };

  const handleVoiceCall = async (personaId: string) => {
    if (!analysis) return;
    
    const persona = analysis.focusGroupPersonas.find(p => p.id === personaId);
    if (!persona) return;

    try {
      if (voiceMode === 'direct') {
        // Use direct voice service (like your previous project with GPT-3.5)
        if (currentDirectCall) {
          // End current call
          console.log('Ending direct voice call...');
          await directPersonaVoiceService.endCall();
          setCurrentDirectCall(null);
        } else {
          // Start direct voice call
          console.log('Starting direct voice call with persona:', persona.name);
          
          // Check for OpenAI API key
          const openaiKey = import.meta.env.VITE_OPENAI_API_KEY;
          if (!openaiKey) {
            alert('OpenAI API key not found. Please add VITE_OPENAI_API_KEY to your environment variables.');
            return;
          }
          
          const call = await directPersonaVoiceService.startVoiceCall(
            persona,
            analysis.idea,
            {
              onCallStart: () => {
                console.log('Direct voice call started');
              },
              onCallEnd: () => {
                console.log('Direct voice call ended');
                setCurrentDirectCall(null);
              },
              onSpeechStart: () => {
                console.log('Persona started speaking');
              },
              onSpeechEnd: () => {
                console.log('Persona stopped speaking');
              },
              onTranscript: (transcript: string, role: 'user' | 'assistant') => {
                console.log(`${role}: ${transcript}`);
              },
              onError: (error: any) => {
                console.error('Direct voice call error:', error);
                alert(`Voice call error: ${error.message}`);
              }
            }
          );
          
          setCurrentDirectCall(call);
        }
      } else if (voiceMode === 'professional') {
        // Use professional voice service (Vapi.ai + ElevenLabs + GPT-4) - Real-time voice AI
        if (currentProfessionalCall) {
          // End current call
          console.log('Ending professional voice call...');
          await professionalVoiceService.endCall();
          setCurrentProfessionalCall(null);
        } else {
          // Start professional voice call
          console.log('Starting professional voice call with persona:', persona.name);
          
          // Check for Vapi API key
          const vapiKey = import.meta.env.VITE_VAPI_API_KEY;
          if (!vapiKey) {
            alert('Vapi API key not found. Please add VITE_VAPI_API_KEY to your environment variables.');
            return;
          }
          
          // Initialize Vapi.ai service
          professionalVoiceService.initialize(vapiKey);
          
          const call = await professionalVoiceService.startVoiceCall(
            persona,
            analysis.idea,
            {
              onCallStart: () => {
                console.log('Professional voice call started');
              },
              onCallEnd: () => {
                console.log('Professional voice call ended');
                setCurrentProfessionalCall(null);
              },
              onSpeechStart: () => {
                console.log('Persona started speaking');
              },
              onSpeechEnd: () => {
                console.log('Persona stopped speaking');
              },
              onTranscript: (transcript: string, role: 'user' | 'assistant') => {
                console.log(`${role}: ${transcript}`);
              },
              onError: (error: any) => {
                console.error('Professional voice call error:', error);
                alert(`Voice call error: ${error.message}`);
              }
            }
          );
          
          setCurrentProfessionalCall(call);
        }
      } else {
        // Use offline voice service
        if (isRecording && currentVoiceCall) {
          // Stop recording
          console.log('Stopping voice recording...');
          const call = await voiceRecordingService.stopRecording();
          setIsRecording(false);
          
          if (call) {
            setCurrentVoiceCall(call);
            
            // Wait for processing to complete
            if (call.status === 'processing') {
              // Check every 500ms for completion
              const checkStatus = setInterval(() => {
                const updatedCall = voiceRecordingService.getCurrentCall();
                if (updatedCall && updatedCall.status === 'completed') {
                  setCurrentVoiceCall(updatedCall);
                  clearInterval(checkStatus);
                  console.log('Voice call completed with persona response:', updatedCall.personaResponse);
                } else if (updatedCall && updatedCall.status === 'error') {
                  setCurrentVoiceCall(updatedCall);
                  clearInterval(checkStatus);
                  console.error('Voice call failed:', updatedCall.error);
                }
              }, 500);
            }
          }
        } else {
          // Start recording
          console.log('Starting voice recording with persona:', persona.name);
          const call = await voiceRecordingService.startRecording(personaId, persona.name);
          setCurrentVoiceCall(call);
          setIsRecording(true);
        }
      }
    } catch (error) {
      console.error('Voice call error:', error);
      if (voiceMode === 'direct') {
        alert(`Direct voice call failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      } else if (voiceMode === 'professional') {
        alert(`Professional voice call failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      } else {
        alert('Voice recording failed. Please check microphone permissions and use http://localhost or HTTPS.');
      }
    }
  };

  // Helper function to get country flag emoji
  const getCountryFlag = (location: string) => {
    const countryMap: { [key: string]: string } = {
      'San Francisco, CA': '🇺🇸',
      'Austin, TX': '🇺🇸',
      'Boston, MA': '🇺🇸',
      'New York, NY': '🇺🇸',
      'London, UK': '🇬🇧',
      'Paris, France': '🇫🇷',
      'Tokyo, Japan': '🇯🇵',
      'Mumbai, India': '🇮🇳',
      'Singapore': '🇸🇬',
      'São Paulo, Brazil': '🇧🇷',
      'Buenos Aires, Argentina': '🇦🇷',
      'Lagos, Nigeria': '🇳🇬',
      'Cairo, Egypt': '🇪🇬',
      'Sydney, Australia': '🇦🇺',
      'Melbourne, Australia': '🇦🇺',
      'Auckland, New Zealand': '🇳🇿'
    };
    return countryMap[location] || '🌍';
  };

  // Helper functions for progress tracking
  const getStepDescription = (step: AnalysisStep): string => {
    const descriptions = {
      'initializing': '🚀 Initializing AI analysis engine...',
      'generating-personas': '👥 Generating global personas...',
      'analyzing-sentiment': '🧠 Analyzing sentiment patterns...',
      'calculating-insights': '📊 Calculating market insights...',
      'building-report': '📋 Building comprehensive report...'
    };
    return descriptions[step] || 'Processing...';
  };

  const getStepIndex = (step: AnalysisStep): number => {
    const steps: AnalysisStep[] = ['initializing', 'generating-personas', 'analyzing-sentiment', 'calculating-insights', 'building-report'];
    return steps.indexOf(step);
  };

  // Get sentiment color and icon
  const getSentimentInfo = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return { color: 'text-green-400', bgColor: 'bg-green-400/20', icon: '😊', label: 'Positive' };
      case 'negative':
        return { color: 'text-red-400', bgColor: 'bg-red-400/20', icon: '😟', label: 'Negative' };
      default:
        return { color: 'text-yellow-400', bgColor: 'bg-yellow-400/20', icon: '😐', label: 'Neutral' };
    }
  };

  // Helper function to get persona theme colors
  const getPersonaTheme = (persona: any) => {
    const { demographics, psychographics, personality } = persona;
    
    // Theme based on industry
    const industryThemes: { [key: string]: { from: string; to: string; icon: string } } = {
      'Technology': { from: 'from-blue-400', to: 'to-purple-400', icon: '💻' },
      'Healthcare': { from: 'from-green-400', to: 'to-emerald-400', icon: '🏥' },
      'Finance': { from: 'from-yellow-400', to: 'to-amber-400', icon: '💰' },
      'Education': { from: 'from-indigo-400', to: 'to-blue-400', icon: '📚' },
      'Marketing': { from: 'from-pink-400', to: 'to-rose-400', icon: '📢' },
      'Retail': { from: 'from-orange-400', to: 'to-red-400', icon: '🛍️' },
      'Manufacturing': { from: 'from-gray-400', to: 'to-slate-400', icon: '🏭' },
      'Consulting': { from: 'from-teal-400', to: 'to-cyan-400', icon: '👔' }
    };
    
    // Get industry theme
    const industryTheme = industryThemes[demographics.industry] || 
                         { from: 'from-blue-400', to: 'to-purple-400', icon: '👤' };
    
    // Override with personality theme if strong trait
    let finalTheme = industryTheme;
    
    if (personality.openness > 8) {
      finalTheme = { ...finalTheme, from: 'from-purple-400', to: 'to-pink-400', icon: '🎨' };
    } else if (personality.conscientiousness > 8) {
      finalTheme = { ...finalTheme, from: 'from-blue-400', to: 'to-indigo-400', icon: '📋' };
    } else if (personality.extraversion > 8) {
      finalTheme = { ...finalTheme, from: 'from-orange-400', to: 'to-yellow-400', icon: '🎉' };
    } else if (personality.agreeableness > 8) {
      finalTheme = { ...finalTheme, from: 'from-green-400', to: 'to-teal-400', icon: '🤝' };
    } else if (personality.neuroticism > 8) {
      finalTheme = { ...finalTheme, from: 'from-red-400', to: 'to-pink-400', icon: '⚠️' };
    }
    
    return finalTheme;
  };

  // Convert analysis results to globe nodes
  const getGlobeNodes = (): Node[] => {
    if (!analysis || !analysis.globalDeployment) return [];
    
    return analysis.globalPersonas.map((persona, index) => {
      const reaction = analysis.reactions.find(r => r.personaId === persona.id);
      const sentiment = reaction?.reaction || 'neutral';
      
      return {
        id: persona.id,
        lat: persona.demographics.location.coordinates.lat,
        lon: persona.demographics.location.coordinates.lon,
        status: sentiment === 'positive' ? 'green' : sentiment === 'negative' ? 'red' : 'yellow',
        name: persona.name
      };
    });
  };

  // Handle globe node click
  const handleGlobeNodeClick = (node: Node) => {
    const persona = analysis?.globalPersonas.find(p => p.id === node.id);
    if (persona) {
      setSelectedPersona(persona);
      setAnalysisPhase('focus-group');
    }
  };

  return (
    <div className="w-full h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-black/20"></div>
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10"></div>
      
      {/* Floating Particles Background */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white/20 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 3}s`
            }}
          />
        ))}
      </div>

      {/* Enhanced Tunnel Input Panel */}
      <div className="absolute top-8 left-8 z-10">
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 max-w-lg">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              AI Tunnel Analysis
            </h1>
          </div>
          <p className="text-white/70 text-sm mb-6">
            Transform your idea through AI-powered global market simulation
          </p>
          
          {analysisPhase === 'analyzing' && (
            <div className="mb-6 p-4 bg-white/5 rounded-lg border border-white/10">
              <div className="flex items-center gap-2 mb-3">
                <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
                <span className="text-white/80 text-sm font-medium">
                  {getStepDescription(currentStep)}
                </span>
              </div>
              <Progress value={analysisProgress} className="h-2 mb-2" />
              <div className="flex justify-between text-xs text-white/60">
                <span>Analysis Progress</span>
                <span>{analysisProgress}%</span>
              </div>
              
              {/* Step Indicators */}
              <div className="flex gap-2 mt-4">
                {['initializing', 'generating-personas', 'analyzing-sentiment', 'calculating-insights', 'building-report'].map((step, index) => (
                  <div
                    key={step}
                    className={`flex-1 h-1 rounded-full transition-all duration-300 ${
                      getStepIndex(currentStep) >= index 
                        ? 'bg-gradient-to-r from-blue-500 to-purple-500' 
                        : 'bg-white/20'
                    }`}
                  />
                ))}
              </div>
            </div>
          )}
          
          <div className="space-y-4">
            <div>
              <label className="block text-white/80 text-sm mb-2 font-medium">Your Innovation Idea</label>
              <textarea
                value={userIdea}
                onChange={(e) => {
                  if (e.target.value.length <= 500) {
                    setUserIdea(e.target.value);
                  }
                }}
                placeholder="What if there was an app that translates emotions into music in real-time?"
                className="w-full h-28 bg-white/10 border border-white/20 rounded-lg p-3 text-white placeholder-white/50 resize-none focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-300"
                disabled={analysisPhase === 'analyzing'}
              />
              <div className="mt-2 text-xs text-white/60 flex justify-between">
                <span>Character limit: 500</span>
                <span className={userIdea.length > 450 ? 'text-yellow-400' : ''}>
                  {userIdea.length}/500
                </span>
              </div>
            </div>
            
            {/* Sample Ideas */}
            <div>
              <label className="block text-white/80 text-sm mb-2 font-medium">Quick Start Ideas</label>
              <div className="grid grid-cols-1 gap-2">
                {sampleIdeas.slice(0, 3).map((idea, index) => (
                  <button
                    key={index}
                    onClick={() => setUserIdea(idea)}
                    disabled={analysisPhase === 'analyzing'}
                    className="text-left p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white/80 text-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    💡 {idea}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={handleAnalyze}
                disabled={isLoading || !userIdea.trim()}
                className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 disabled:transform-none flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Globe className="w-4 h-4" />
                    Launch Analysis
                  </>
                )}
              </button>
              {analysisPhase === 'completed' && (
                <button
                  onClick={() => setAnalysisPhase('idle')}
                  className="bg-white/10 hover:bg-white/20 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 border border-white/20"
                >
                  Reset
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Results Panel */}
      {analysis && analysisPhase === 'completed' && (
        <div className="absolute top-8 right-8 z-10 w-96 max-h-[80vh] overflow-y-auto">
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Analysis Complete</h2>
                <p className="text-white/60 text-sm">Global feedback received</p>
              </div>
            </div>

            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-4 bg-white/5 border border-white/10">
                <TabsTrigger value="overview" className="text-white/80 data-[state=active]:text-white">Overview</TabsTrigger>
                <TabsTrigger value="personas" className="text-white/80 data-[state=active]:text-white">Personas</TabsTrigger>
                <TabsTrigger value="globe" className="text-white/80 data-[state=active]:text-white">🌐 Globe</TabsTrigger>
                <TabsTrigger value="insights" className="text-white/80 data-[state=active]:text-white">Insights</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="mt-4 space-y-4">
                <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                  <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                    <BarChart3 className="w-4 h-4" />
                    Sentiment Analysis
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-white/60 text-sm">Positive</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-white/10 rounded-full h-2">
                          <div 
                            className="bg-green-400 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${(analysis.sentiment.positive / (analysis.sentiment.positive + analysis.sentiment.neutral + analysis.sentiment.negative)) * 100}%` }}
                          />
                        </div>
                        <span className="text-green-400 text-sm font-medium">{analysis.sentiment.positive}</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-white/60 text-sm">Neutral</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-white/10 rounded-full h-2">
                          <div 
                            className="bg-yellow-400 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${(analysis.sentiment.neutral / (analysis.sentiment.positive + analysis.sentiment.neutral + analysis.sentiment.negative)) * 100}%` }}
                          />
                        </div>
                        <span className="text-yellow-400 text-sm font-medium">{analysis.sentiment.neutral}</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-white/60 text-sm">Negative</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-white/10 rounded-full h-2">
                          <div 
                            className="bg-red-400 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${(analysis.sentiment.negative / (analysis.sentiment.positive + analysis.sentiment.neutral + analysis.sentiment.negative)) * 100}%` }}
                          />
                        </div>
                        <span className="text-red-400 text-sm font-medium">{analysis.sentiment.negative}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                  <h3 className="text-white font-semibold mb-2 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    Viral Coefficient
                  </h3>
                  <div className="flex items-center gap-3">
                    <div className="text-2xl font-bold text-white">{analysis.viralCoefficient?.toFixed(1) || '0.0'}</div>
                    <div className="flex-1">
                      <div className="w-full bg-white/10 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-purple-400 to-pink-400 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${((analysis.viralCoefficient || 0) / 10) * 100}%` }}
                        />
                      </div>
                      <div className="text-xs text-white/60 mt-1">Market potential</div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="personas" className="mt-4 space-y-3">
                <div className="max-h-60 overflow-y-auto space-y-2">
                  {analysis.focusGroupPersonas.map((persona, index) => {
                    const theme = getPersonaTheme(persona);
                    return (
                    <div 
                      key={persona.id}
                      className="p-3 bg-white/5 rounded-lg border border-white/10 cursor-pointer hover:bg-white/10 transition-all duration-200"
                      onClick={() => setSelectedPersona(persona)}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 bg-gradient-to-r ${theme.from} ${theme.to} rounded-full flex items-center justify-center text-white text-sm font-bold`}>
                          {theme.icon}
                        </div>
                        <div className="flex-1">
                          <div className="text-white font-medium text-sm">{persona.name}</div>
                          <div className="text-white/60 text-xs">{persona.location} • {persona.role}</div>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleVoiceCall(persona.id);
                          }}
                          className={`p-2 rounded-lg transition-all duration-200 ${
                            voiceMode === 'direct' && currentDirectCall?.personaId === persona.id
                              ? 'bg-red-500/20 text-red-300 hover:bg-red-500/30'
                              : voiceMode === 'professional' && currentProfessionalCall?.personaId === persona.id
                              ? 'bg-red-500/20 text-red-300 hover:bg-red-500/30'
                              : voiceMode === 'offline' && isRecording && currentVoiceCall?.personaId === persona.id
                              ? 'bg-red-500/20 text-red-300 hover:bg-red-500/30'
                              : `bg-gradient-to-r ${theme.from} ${theme.to}/20 text-white hover:${theme.from}/30`
                          }`}
                          title={
                            voiceMode === 'direct' ? "Direct GPT-3.5 Voice Call (Like Previous Project)" :
                            voiceMode === 'professional' ? "Professional AI Voice Call" :
                            "Voice Chat with Persona"
                          }
                        >
                          {voiceMode === 'direct' ? (
                            currentDirectCall?.personaId === persona.id ? (
                              <PhoneOff className="w-4 h-4" />
                            ) : (
                              <Phone className="w-4 h-4" />
                            )
                          ) : voiceMode === 'professional' ? (
                            currentProfessionalCall?.personaId === persona.id ? (
                              <PhoneOff className="w-4 h-4" />
                            ) : (
                              <Phone className="w-4 h-4" />
                            )
                          ) : (
                            isRecording && currentVoiceCall?.personaId === persona.id ? (
                              <MicOff className="w-4 h-4" />
                            ) : (
                              <Mic className="w-4 h-4" />
                            )
                          )}
                        </button>
                        <div className="text-white/60 text-xs">
                          {getCountryFlag(persona.location)}
                        </div>
                      </div>
                    </div>
                    );
                  })}
                </div>
                
                {/* Voice Mode Toggle */}
                <div className="p-3 bg-white/5 rounded-lg border border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <div className="text-white font-medium text-sm">Voice Mode</div>
                      <div className="text-white/60 text-xs">
                        {voiceMode === 'direct' ? 'Direct GPT-3.5 Voice (Like Previous Project)' : 
                         voiceMode === 'professional' ? 'Professional AI Voice (Online)' : 
                         'Offline Voice Recording'}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setVoiceMode('direct');
                          // End any current calls when switching modes
                          if (currentDirectCall) {
                            directPersonaVoiceService.endCall();
                            setCurrentDirectCall(null);
                          }
                        }}
                        className={`px-3 py-1 rounded text-xs font-medium transition-all ${
                          voiceMode === 'direct'
                            ? 'bg-blue-500 text-white'
                            : 'bg-white/10 text-white/60 hover:bg-white/20'
                        }`}
                      >
                        🎯 Direct
                      </button>
                      <button
                        onClick={() => {
                          setVoiceMode('professional');
                          // End any current calls when switching modes
                          if (currentProfessionalCall) {
                            professionalVoiceService.endCall();
                            setCurrentProfessionalCall(null);
                          }
                        }}
                        className={`px-3 py-1 rounded text-xs font-medium transition-all ${
                          voiceMode === 'professional'
                            ? 'bg-purple-500 text-white'
                            : 'bg-white/10 text-white/60 hover:bg-white/20'
                        }`}
                      >
                        🌐 Professional
                      </button>
                      <button
                        onClick={() => {
                          setVoiceMode('offline');
                          // End any current calls when switching modes
                          if (currentVoiceCall && isRecording) {
                            voiceRecordingService.stopRecording();
                            setCurrentVoiceCall(null);
                            setIsRecording(false);
                          }
                        }}
                        className={`px-3 py-1 rounded text-xs font-medium transition-all ${
                          voiceMode === 'offline'
                            ? 'bg-gray-500 text-white'
                            : 'bg-white/10 text-white/60 hover:bg-white/20'
                        }`}
                      >
                        📱 Offline
                      </button>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="globe" className="mt-4 space-y-4">
                <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                  <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                    <Globe className="w-4 h-4" />
                    Global Market Visualization
                  </h3>
                  <div className="space-y-3">
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                        <span className="text-white/60">Positive</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                        <span className="text-white/60">Neutral</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                        <span className="text-white/60">Negative</span>
                      </div>
                    </div>
                    <div className="text-white/60 text-sm">
                      Click any node on the globe to see detailed persona feedback
                    </div>
                  </div>
                </div>
                
                {/* 3D Globe Visualization */}
                <div className="w-full h-64 bg-black/30 rounded-lg border border-white/10 overflow-hidden">
                  <GlobeScene 
                    nodes={getGlobeNodes()} 
                    onNodeClick={handleGlobeNodeClick}
                  />
                </div>
                
                <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                  <h4 className="text-white font-medium mb-2">Global Reach</h4>
                  <div className="text-2xl font-bold text-white mb-1">
                    {analysis.globalPersonas.length}+ Personas
                  </div>
                  <div className="text-sm text-white/60">
                    Across {new Set(analysis.globalPersonas.map(p => p.demographics.location.country)).size} countries
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="insights" className="mt-4 space-y-4">
                <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                  <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                    <Brain className="w-4 h-4" />
                    Key Insights
                  </h3>
                  <div className="space-y-2">
                    {analysis.insights.split('\n').slice(0, 3).map((insight, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <Star className="w-3 h-3 text-yellow-400 mt-0.5 flex-shrink-0" />
                        <span className="text-white/80 text-sm">{insight}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            <div className="mt-6 flex gap-3">
              <button
                onClick={handleFocusGroup}
                className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-300 flex items-center justify-center gap-2"
              >
                <Users className="w-4 h-4" />
                Focus Group
              </button>
              <button
                onClick={() => {
                  const data = JSON.stringify(analysis, null, 2);
                  const blob = new Blob([data], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `analysis-${Date.now()}.json`;
                  a.click();
                }}
                className="bg-white/10 hover:bg-white/20 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-300 border border-white/20 flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Neural Network Overlay */}
      {isLoading && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="w-96 h-96 border border-blue-400/30 rounded-full animate-spin">
              <div className="w-full h-full border border-purple-400/20 rounded-full animate-spin" style={{animationDirection: 'reverse', animationDuration: '3s'}}>
                <div className="w-full h-full border border-pink-400/10 rounded-full animate-spin" style={{animationDuration: '2s'}}>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Voice Call Status */}
      {(currentVoiceCall || currentProfessionalCall || currentDirectCall) && (
        <div className="absolute top-8 right-8 z-10 w-80">
          <div className={`backdrop-blur-md border rounded-2xl p-4 ${
            voiceMode === 'direct' && currentDirectCall ? 
              (currentDirectCall.status === 'connecting' ? 'bg-blue-500/20 border-blue-500/30' :
               currentDirectCall.status === 'speaking' ? 'bg-purple-500/20 border-purple-500/30' :
               currentDirectCall.status === 'listening' ? 'bg-yellow-500/20 border-yellow-500/30' :
               currentDirectCall.status === 'ended' ? 'bg-gray-500/20 border-gray-500/30' :
               'bg-green-500/20 border-green-500/30') :
            voiceMode === 'professional' && currentProfessionalCall ? 
              (currentProfessionalCall.status === 'connected' ? 'bg-green-500/20 border-green-500/30' :
               currentProfessionalCall.status === 'calling' ? 'bg-blue-500/20 border-blue-500/30' :
               currentProfessionalCall.status === 'speaking' ? 'bg-purple-500/20 border-purple-500/30' :
               currentProfessionalCall.status === 'listening' ? 'bg-yellow-500/20 border-yellow-500/30' :
               currentProfessionalCall.status === 'ended' ? 'bg-gray-500/20 border-gray-500/30' :
               'bg-red-500/20 border-red-500/30') :
            (isRecording ? 'bg-red-500/20 border-red-500/30' : 
             currentVoiceCall?.status === 'completed' ? 'bg-green-500/20 border-green-500/30' :
             currentVoiceCall?.status === 'processing' ? 'bg-yellow-500/20 border-yellow-500/30' :
             currentVoiceCall?.status === 'error' ? 'bg-red-500/20 border-red-500/30' :
             'bg-blue-500/20 border-blue-500/30')
          }`}>
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-3 h-3 rounded-full animate-pulse ${
                voiceMode === 'direct' && currentDirectCall ? 
                  (currentDirectCall.status === 'connecting' ? 'bg-blue-400' :
                   currentDirectCall.status === 'speaking' ? 'bg-purple-400' :
                   currentDirectCall.status === 'listening' ? 'bg-yellow-400' :
                   currentDirectCall.status === 'ended' ? 'bg-gray-400' :
                   'bg-green-400') :
                voiceMode === 'professional' && currentProfessionalCall ? 
                  (currentProfessionalCall.status === 'connected' ? 'bg-green-400' :
                   currentProfessionalCall.status === 'calling' ? 'bg-blue-400' :
                   currentProfessionalCall.status === 'speaking' ? 'bg-purple-400' :
                   currentProfessionalCall.status === 'listening' ? 'bg-yellow-400' :
                   currentProfessionalCall.status === 'ended' ? 'bg-gray-400' :
                   'bg-red-400') :
                (isRecording ? 'bg-red-400' : 
                 currentVoiceCall?.status === 'completed' ? 'bg-green-400' :
                 currentVoiceCall?.status === 'processing' ? 'bg-yellow-400' :
                 currentVoiceCall?.status === 'error' ? 'bg-red-400' :
                 'bg-blue-400')
              }`}></div>
              <span className={`font-medium text-sm ${
                voiceMode === 'professional' && currentProfessionalCall ? 
                  (currentProfessionalCall.status === 'connected' ? 'text-green-300' :
                   currentProfessionalCall.status === 'calling' ? 'text-blue-300' :
                   currentProfessionalCall.status === 'speaking' ? 'text-purple-300' :
                   currentProfessionalCall.status === 'listening' ? 'text-yellow-300' :
                   currentProfessionalCall.status === 'ended' ? 'text-gray-300' :
                   'text-red-300') :
                (isRecording ? 'text-red-300' : 
                 currentVoiceCall?.status === 'completed' ? 'text-green-300' :
                 currentVoiceCall?.status === 'processing' ? 'text-yellow-300' :
                 currentVoiceCall?.status === 'error' ? 'text-red-300' :
                 'text-blue-300')
              }`}>
                {voiceMode === 'direct' && currentDirectCall ? 
                  (currentDirectCall.status === 'connecting' ? `🔄 Connecting to ${currentDirectCall.personaName}...` :
                   currentDirectCall.status === 'speaking' ? `🎤 ${currentDirectCall.personaName} is speaking...` :
                   currentDirectCall.status === 'listening' ? `👂 Listening...` :
                   currentDirectCall.status === 'ended' ? `✅ Call ended` :
                   `📞 Connected with ${currentDirectCall.personaName}`) :
                voiceMode === 'professional' && currentProfessionalCall ? 
                  (currentProfessionalCall.status === 'connected' ? `📞 Connected with ${currentProfessionalCall.personaName}` :
                   currentProfessionalCall.status === 'calling' ? `🔄 Calling ${currentProfessionalCall.personaName}...` :
                   currentProfessionalCall.status === 'speaking' ? `🎤 ${currentProfessionalCall.personaName} is speaking...` :
                   currentProfessionalCall.status === 'listening' ? `👂 Listening...` :
                   currentProfessionalCall.status === 'ended' ? `✅ Call ended` :
                   `❌ Call failed`) :
                (isRecording ? `🎤 Recording with ${currentVoiceCall?.personaName}...` :
                 currentVoiceCall?.status === 'completed' ? `✅ Call completed with ${currentVoiceCall?.personaName}` :
                 currentVoiceCall?.status === 'processing' ? `⏳ Processing ${currentVoiceCall?.personaName}'s response...` :
                 currentVoiceCall?.status === 'error' ? `❌ Call failed` :
                 `📞 Calling ${currentVoiceCall?.personaName}...`)}
              </span>
              {(isRecording || currentProfessionalCall || currentDirectCall) && (
                <button 
                  onClick={() => {
                    if (voiceMode === 'direct' && currentDirectCall) {
                      directPersonaVoiceService.endCall();
                      setCurrentDirectCall(null);
                    } else if (voiceMode === 'professional' && currentProfessionalCall) {
                      professionalVoiceService.endCall();
                      setCurrentProfessionalCall(null);
                    } else if (isRecording && currentVoiceCall) {
                      voiceRecordingService.stopRecording();
                      setIsRecording(false);
                    }
                  }}
                  className="px-3 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-300 text-xs rounded transition-colors ml-auto"
                >
                  {voiceMode === 'direct' ? <PhoneOff className="w-3 h-3 mr-1 inline" /> : 
                   voiceMode === 'professional' ? <PhoneOff className="w-3 h-3 mr-1 inline" /> : 
                   <MicOff className="w-3 h-3 mr-1 inline" />}
                  {voiceMode === 'direct' ? 'End Call' : 
                   voiceMode === 'professional' ? 'End Call' : 
                   'Stop'}
                </button>
              )}
            </div>
            
            {/* Voice call status details */}
            {(voiceMode === 'direct' && currentDirectCall && currentDirectCall.status === 'listening') && (
              <div className="flex items-center gap-2 text-xs text-yellow-300 mb-3">
                <Mic className="w-3 h-3" />
                <span>Speak now - the persona is listening to your response...</span>
              </div>
            )}
            {(voiceMode === 'professional' && currentProfessionalCall && currentProfessionalCall.status === 'listening') && (
              <div className="flex items-center gap-2 text-xs text-yellow-300 mb-3">
                <Mic className="w-3 h-3" />
                <span>Speak now - the persona is listening to your response...</span>
              </div>
            )}
            {voiceMode === 'offline' && currentVoiceCall && currentVoiceCall.status === 'processing' && (
              <div className="flex items-center gap-2 text-xs text-yellow-300 mb-3">
                <Loader2 className="w-3 h-3 animate-spin" />
                <span>Analyzing voice and generating persona response...</span>
              </div>
            )}
            
            {/* Error message */}
            {currentVoiceCall.status === 'error' && (
              <div className="text-xs text-red-300 mb-3 bg-red-500/10 rounded p-2">
                <strong>Error:</strong> {currentVoiceCall.error}
              </div>
            )}
            
            {/* Transcript */}
            {currentVoiceCall.transcript && (
              <div className="mb-3 text-xs text-white/80 bg-black/20 rounded p-3">
                <strong className="text-blue-300">📝 Your message:</strong> 
                <div className="mt-1 italic">"{currentVoiceCall.transcript}"</div>
              </div>
            )}
            
            {/* Persona Response */}
            {currentVoiceCall.personaResponse && (
              <div className="mb-3 text-xs text-white/90 bg-green-500/10 border border-green-500/20 rounded p-3">
                <strong className="text-green-300">🤖 {currentVoiceCall.personaName} responds:</strong>
                <div className="mt-1">"{currentVoiceCall.personaResponse}"</div>
              </div>
            )}
            
            {/* Recording controls */}
            {currentVoiceCall.recording && (
              <div className="flex gap-2">
                <button
                  onClick={() => voiceRecordingService.playRecording(currentVoiceCall)}
                  className="flex-1 px-2 py-1 bg-white/10 hover:bg-white/20 text-white text-xs rounded transition-colors flex items-center justify-center gap-1"
                >
                  <Play className="w-3 h-3" />
                  Play Recording
                </button>
                <button
                  onClick={() => voiceRecordingService.downloadRecording(currentVoiceCall)}
                  className="flex-1 px-2 py-1 bg-white/10 hover:bg-white/20 text-white text-xs rounded transition-colors flex items-center justify-center gap-1"
                >
                  <Download className="w-3 h-3" />
                  Download
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* AI Agent Responses Panel */}
      {analysis && (
        <div className="absolute bottom-8 right-8 z-10">
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 max-w-md">
            <h3 className="text-lg font-bold text-white mb-4">🌍 Global AI Feedback</h3>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {analysis.reactions.map((reaction, index) => {
                const persona = analysis.focusGroupPersonas[index];
                if (!persona) return null;
                
                const countryFlag = getCountryFlag(persona.location);
                const reactionColor = reaction.reaction === 'positive' ? 'text-green-400' : 
                                   reaction.reaction === 'neutral' ? 'text-orange-400' : 'text-red-400';
                
                return (
                  <div key={persona.id} className="bg-white/5 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-xs">
                        {countryFlag}
                      </div>
                      <span className="text-white/80 text-sm font-medium">{persona.name}, {persona.role}</span>
                      <span className={`text-xs ${reactionColor}`}>{reaction.reaction}</span>
                    </div>
                    <p className="text-white/70 text-sm">"{reaction.reasoning}"</p>
                    <button 
                      onClick={() => handleVoiceCall(persona.id)}
                      className={`mt-2 px-3 py-1 text-xs rounded transition-colors ${
                        isRecording && currentVoiceCall?.personaId === persona.id
                          ? 'bg-red-500/20 hover:bg-red-500/30 text-red-300'
                          : 'bg-blue-500/20 hover:bg-blue-500/30 text-blue-300'
                      }`}
                    >
                      {isRecording && currentVoiceCall?.personaId === persona.id ? (
                        <>
                          <MicOff className="w-3 h-3 mr-1" />
                          Stop Recording
                        </>
                      ) : (
                        <>
                          <Mic className="w-3 h-3 mr-1" />
                          Record with {persona.name}
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tunnel;
