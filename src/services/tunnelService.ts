import { PersonaService } from './personaService';
import { SentimentService } from './sentimentService';
import { cohereService } from './cohereService';

export interface MarketAnalysis {
  sessionId: string;
  idea: string;
  reactions: any[];
  insights: string;
  focusGroupPersonas: any[];
  globalPersonas: any[];
  sentiment: {
    positive: number;
    neutral: number;
    negative: number;
  };
  topConcerns: string[];
  topSuggestions: string[];
  viralCoefficient?: number;
  globalDeployment?: {
    totalReactions: number;
    continentBreakdown: { [continent: string]: number };
    industryBreakdown: { [industry: string]: number };
  };
}

export interface Session {
  id: string;
  user_id: string;
  idea: string;
  reactions: any[];
  insights?: string;
  viral_coefficient?: number;
  global_deployment?: any;
  created_at?: string;
  updated_at?: string;
}

export interface User {
  id: string;
  email: string;
  created_at?: string;
  updated_at?: string;
}

export interface PersonaProfile {
  id: string;
  name: string;
  age: number;
  location: string;
  industry: string;
  role: string;
  demographics: any;
  psychographics: any;
  personality: any;
}

export interface PersonaReaction {
  personaId: string;
  reaction: 'positive' | 'neutral' | 'negative';
  reasoning: string;
  suggestions?: string[];
  concerns?: string[];
}

export interface VapiCall {
  id: string;
  status: string;
  personaId: string;
  transcript?: string;
}

export class TunnelService {
  private personaService: PersonaService;
  private sentimentService: SentimentService;

  constructor() {
    this.personaService = PersonaService.getInstance();
    this.sentimentService = SentimentService.getInstance();
  }

  // Initialize personas
  async initializePersonas(): Promise<PersonaProfile[]> {
    const personas = this.personaService.getAllPersonas();
    return personas.map(p => ({
      id: p.id,
      name: p.name,
      age: p.demographics.age,
      location: `${p.demographics.location.city}, ${p.demographics.location.country}`,
      industry: p.demographics.industry,
      role: p.demographics.role,
      demographics: p.demographics,
      psychographics: p.psychographics,
      personality: p.personality
    }));
  }

  // Main analysis function
  async analyzeIdea(userId: string, idea: string): Promise<MarketAnalysis> {
    console.log('=== TUNNEL SERVICE: Starting AI analysis ===');
    console.log('Idea:', idea);
    
    try {
      // Initialize personas
      const allPersonas = await this.initializePersonas();
      console.log('All personas count:', allPersonas.length);
      
      // Use Cohere AI to analyze the idea and get insights
      console.log('Getting AI insights from Cohere...');
      // We'll generate insights after getting reactions
      let aiInsights = 'Analyzing market potential...';
      
      // Create session
      const session: Session = {
        id: `session-${Date.now()}`,
        user_id: userId,
        idea,
        reactions: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      // Select focus group using AI
      const focusGroupPersonas = this.personaService.selectFocusGroup(idea, 5);
      console.log('Focus group personas count:', focusGroupPersonas.length);
      
      // Generate intelligent reactions using Cohere AI
      const focusGroupReactions: PersonaReaction[] = [];
      
      for (const persona of focusGroupPersonas) {
        console.log('Analyzing reaction for persona:', persona.name);
        
        // Use Cohere AI to generate persona-specific reactions
        const personaProfile: PersonaProfile = {
          id: persona.id,
          name: persona.name,
          age: persona.demographics.age,
          location: `${persona.demographics.location.city}, ${persona.demographics.location.country}`,
          industry: persona.demographics.industry,
          role: persona.demographics.role,
          demographics: persona.demographics,
          psychographics: persona.psychographics,
          personality: persona.personality
        };
        const reaction = await cohereService.generatePersonaReaction(personaProfile, idea);
        
        focusGroupReactions.push({
          personaId: persona.id,
          reaction: reaction.reaction,
          reasoning: reaction.reasoning,
          suggestions: reaction.suggestions,
          concerns: reaction.concerns,
          timestamp: new Date().toISOString()
        });
      }
      
      // Generate AI insights from reactions
      console.log('Generating AI insights from reactions...');
      aiInsights = await cohereService.generateInsights(focusGroupReactions);
      console.log('AI insights generated:', aiInsights);
      
      // Generate global deployment simulation using AI
      console.log('Generating global deployment simulation...');
      const globalDeployment = await this.simulateGlobalDeployment(idea, allPersonas);
      
      // Calculate sentiment analysis
      const sentiment = this.calculateSentiment(focusGroupReactions);
      
      // Generate viral coefficient using mock calculation (Cohere method doesn't exist)
      const viralCoefficient = this.calculateMockViralCoefficient(focusGroupReactions);
      
      const result: MarketAnalysis = {
        sessionId: session.id,
        idea,
        reactions: focusGroupReactions,
        insights: aiInsights,
        focusGroupPersonas,
        globalPersonas: allPersonas,
        sentiment,
        topConcerns: this.extractTopConcerns(focusGroupReactions),
        topSuggestions: this.extractTopSuggestions(focusGroupReactions),
        viralCoefficient,
        globalDeployment
      };
      
      console.log('=== TUNNEL SERVICE: AI analysis complete ===');
      return result;
      
    } catch (error) {
      console.error('AI analysis failed, falling back to mock analysis:', error);
      
      // Fallback to mock analysis if AI fails
      return this.fallbackAnalysis(userId, idea);
    }
  }

  // Fallback analysis method
  private async fallbackAnalysis(userId: string, idea: string): Promise<MarketAnalysis> {
    console.log('Using fallback mock analysis...');
    
    const allPersonas = await this.initializePersonas();
    const focusGroupPersonas = this.personaService.selectFocusGroup(idea, 5);
    const analyzedPersonas = this.personaService.analyzePersonasWithIdea(idea);
    
    const focusGroupReactions: PersonaReaction[] = [];
    
    focusGroupPersonas.forEach(persona => {
      const analyzedPersona = analyzedPersonas.find(ap => ap.persona.id === persona.id);
      
      const reaction: PersonaReaction = {
        personaId: persona.id,
        reaction: analyzedPersona?.sentiment || 'neutral',
        reasoning: analyzedPersona?.feedback || analyzedPersona?.reasoning || 'No specific reasoning provided.',
        suggestions: this.generateSuggestions(persona, idea),
        concerns: this.generateConcerns(persona, idea)
      };
      focusGroupReactions.push(reaction);
    });
    
    const sentiment = this.calculateSentiment(focusGroupReactions);
    const globalDeployment = await this.simulateGlobalDeployment(idea, allPersonas);
    
    return {
      sessionId: `fallback-${Date.now()}`,
      idea,
      reactions: focusGroupReactions,
      insights: 'Fallback analysis: AI services temporarily unavailable. Using mock persona responses.',
      focusGroupPersonas,
      globalPersonas: allPersonas,
      sentiment,
      topConcerns: this.extractTopConcerns(focusGroupReactions),
      topSuggestions: this.extractTopSuggestions(focusGroupReactions),
      viralCoefficient: this.calculateMockViralCoefficient(focusGroupReactions),
      globalDeployment
    };
  }

  // Helper methods
  private calculateSentiment(reactions: PersonaReaction[]) {
    const positive = reactions.filter(r => r.reaction === 'positive').length;
    const negative = reactions.filter(r => r.reaction === 'negative').length;
    const neutral = reactions.filter(r => r.reaction === 'neutral').length;
    
    return { positive, negative, neutral };
  }

  private extractTopConcerns(reactions: PersonaReaction[]): string[] {
    return reactions
      .filter(r => r.concerns && r.concerns.length > 0)
      .flatMap(r => r.concerns || [])
      .slice(0, 3);
  }

  private extractTopSuggestions(reactions: PersonaReaction[]): string[] {
    return reactions
      .filter(r => r.suggestions && r.suggestions.length > 0)
      .flatMap(r => r.suggestions || [])
      .slice(0, 3);
  }

  private calculateMockViralCoefficient(reactions: PersonaReaction[]): number {
    const positiveRatio = reactions.filter(r => r.reaction === 'positive').length / reactions.length;
    return Math.round((positiveRatio * 8 + Math.random() * 2) * 10) / 10;
  }

  private async simulateGlobalDeployment(idea: string, personas: any[]) {
    const totalReactions = personas.length;
    const continentBreakdown: { [key: string]: number } = {};
    const industryBreakdown: { [key: string]: number } = {};
    
    personas.forEach(persona => {
      const continent = persona.demographics.location.continent || 'Unknown';
      const industry = persona.demographics.industry || 'Unknown';
      
      continentBreakdown[continent] = (continentBreakdown[continent] || 0) + 1;
      industryBreakdown[industry] = (industryBreakdown[industry] || 0) + 1;
    });
    
    return {
      totalReactions,
      continentBreakdown,
      industryBreakdown
    };
  }

  private generateSuggestions(persona: any, idea: string): string[] {
    const suggestions = [
      "Consider user privacy implications",
      "Focus on mobile-first design",
      "Build a strong community feature",
      "Ensure scalability from day one"
    ];
    return suggestions.slice(0, 2);
  }

  private generateConcerns(persona: any, idea: string): string[] {
    const concerns = [
      "Market saturation risk",
      "Technical complexity",
      "User adoption challenges",
      "Regulatory compliance issues"
    ];
    return concerns.slice(0, 2);
  }

  // Voice call methods (simplified)
  async startVoiceConversation(personaId: string, idea: string, reaction?: PersonaReaction): Promise<VapiCall> {
    // Mock implementation
    return {
      id: `call-${Date.now()}`,
      status: 'active',
      personaId,
      transcript: ''
    };
  }

  async getVoiceCallStatus(callId: string): Promise<VapiCall> {
    // Mock implementation
    return {
      id: callId,
      status: 'completed',
      personaId: '',
      transcript: 'Mock transcript'
    };
  }

  async endVoiceCall(callId: string): Promise<void> {
    // Mock implementation
    console.log('Ending call:', callId);
  }

  async getCallTranscript(callId: string): Promise<string> {
    return 'Mock transcript for call: ' + callId;
  }

  async getCallRecording(callId: string): Promise<string> {
    return 'mock-recording-url-' + callId;
  }

  // Session management
  async getUserSessions(userId: string): Promise<Session[]> {
    // Mock implementation - would use database in real app
    return [];
  }

  async getSession(sessionId: string): Promise<Session | null> {
    // Mock implementation
    return null;
  }

  async getUserStats(userId: string) {
    return {
      totalSessions: 0,
      totalReactions: 0,
      averageReactionsPerSession: 0
    };
  }

  // Auto-save functionality
  async autoSaveSession(sessionId: string, data: any): Promise<void> {
    // Mock implementation
    console.log('Auto-saving session:', sessionId, data);
  }
}

export const tunnelService = new TunnelService();
