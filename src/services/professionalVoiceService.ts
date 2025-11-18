import { vapiService, VapiCallConfig, VapiCallCallbacks } from './vapiService';
import { Persona } from '@/types/persona';

export interface ProfessionalVoiceCall {
  id: string;
  personaId: string;
  personaName: string;
  status: 'idle' | 'calling' | 'connected' | 'speaking' | 'listening' | 'ended';
  transcript?: string;
  personaResponse?: string;
  error?: string;
  duration?: number;
}

class ProfessionalVoiceService {
  private currentCall: ProfessionalVoiceCall | null = null;
  private callStartTime: number = 0;

  constructor() {
    // vapiService is already a singleton instance
  }

  /**
   * Initialize the service with Vapi API key
   */
  initialize(vapiKey: string) {
    vapiService.initialize(vapiKey);
    console.log('Professional Voice Service initialized with Vapi');
  }

  /**
   * Start a professional voice call with a persona
   */
  async startVoiceCall(
    persona: Persona, 
    idea: string, 
    callbacks: VapiCallCallbacks
  ): Promise<ProfessionalVoiceCall> {
    try {
      if (!persona) {
        throw new Error('Persona is required');
      }

      // Get Vapi configuration from backend
      const response = await fetch('http://localhost:5050/voice/call', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          persona,
          idea
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Backend API error: ${response.status}`);
      }

      const configData = await response.json();
      
      // Create call object
      const call: ProfessionalVoiceCall = {
        id: `voice-call-${Date.now()}`,
        personaId: persona.id,
        personaName: persona.name,
        status: 'calling'
      };
      
      this.currentCall = call;
      this.callStartTime = Date.now();

      // Setup enhanced callbacks
      const enhancedCallbacks = {
        ...callbacks,
        onCallStart: () => {
          call.status = 'connected';
          callbacks.onCallStart?.();
        },
        onSpeechStart: () => {
          call.status = 'speaking';
          callbacks.onSpeechStart?.();
        },
        onSpeechEnd: () => {
          call.status = 'listening';
          callbacks.onSpeechEnd?.();
        },
        onTranscript: (transcript: string, role: 'user' | 'assistant') => {
          if (role === 'user') {
            call.transcript = transcript;
          } else {
            call.personaResponse = transcript;
          }
          callbacks.onTranscript?.(transcript, role);
        },
        onCallEnd: () => {
          call.status = 'ended';
          call.duration = (Date.now() - this.callStartTime) / 1000;
          callbacks.onCallEnd?.();
        },
        onError: (error: any) => {
          call.status = 'ended';
          call.error = error.message || 'Call failed';
          callbacks.onError?.(error);
        }
      };

      // Start the Vapi call with backend configuration
      const vapiConfig = {
        assistantConfig: configData.assistantConfig,
        personaName: persona.name,
        productIdea: idea,
        publicKey: configData.publicKey
      };
      
      await vapiService.startCall(vapiConfig, enhancedCallbacks);
      
      return call;
    } catch (error) {
      console.error('Failed to start professional voice call:', error);
      if (this.currentCall) {
        this.currentCall.status = 'ended';
        this.currentCall.error = error instanceof Error ? error.message : 'Call failed';
      }
      throw error;
    }
  }

  /**
   * End the current voice call
   */
  async endCall(): Promise<void> {
    try {
      await vapiService.endCall();
      if (this.currentCall) {
        this.currentCall.status = 'ended';
        this.currentCall.duration = (Date.now() - this.callStartTime) / 1000;
      }
    } catch (error) {
      console.error('Failed to end voice call:', error);
      throw error;
    }
  }

  /**
   * Get the current call status
   */
  getCurrentCall(): ProfessionalVoiceCall | null {
    return this.currentCall;
  }

  /**
   * Check if currently in a call
   */
  isInCall(): boolean {
    return vapiService.isInCall();
  }

  /**
   * Create persona-specific voice configuration
   */
  private createPersonaVoiceConfig(persona: Persona, idea: string): VapiCallConfig {
    // Select voice based on persona demographics
    const voiceId = this.selectVoiceForPersona(persona);
    
    // Create persona-specific system prompt
    const systemPrompt = this.createPersonaPrompt(persona, idea);

    // Vapi assistant configuration
    const assistantConfig = {
      name: persona.name,
      model: {
        provider: 'openai',
        model: 'gpt-4',
        temperature: 0.7,
        systemPrompt,
      },
      voice: {
        provider: 'elevenlabs',
        voiceId: voiceId,
        speed: 1.0,
      },
      firstMessage: `Hi, I'm ${persona.name}. I heard about your idea: "${idea}". I'd like to share my thoughts on it from my perspective as a ${persona.demographics.role} in ${persona.demographics.location.city}.`,
    };

    return {
      assistantConfig,
      personaName: persona.name,
      productIdea: idea,
      publicKey: import.meta.env.VITE_VAPI_API_KEY || '',
    };
  }

  /**
   * Select appropriate voice based on persona demographics
   */
  private selectVoiceForPersona(persona: Persona): string {
    const { gender, age } = persona.demographics;
    
    // ElevenLabs voice IDs mapped to persona demographics
    const voiceMap = {
      'male-young': 'pNInz6obpgDQGcFmaJgB', // Young male voice
      'male-middle': 'onwK4e9ZLuTAKqWW03Fg', // Middle-aged male voice
      'male-older': '21m00Tcm4TlvDq8ikWAM',  // Older male voice
      'female-young': 'AZnzlk1XvdvUeBnXmlld', // Young female voice
      'female-middle': 'EXAVITQu4vr4xnSDxMaL', // Middle-aged female voice
      'female-older': 'LcfcDJNUP1GQjkzn1xUU',  // Older female voice
    };

    let ageGroup = 'middle';
    if (age < 35) ageGroup = 'young';
    else if (age > 55) ageGroup = 'older';

    const voiceKey = `${gender}-${ageGroup}` as keyof typeof voiceMap;
    return voiceMap[voiceKey] || voiceMap['female-middle']; // Default to female middle-aged
  }

  /**
   * Create persona-specific system prompt
   */
  private createPersonaPrompt(persona: Persona, idea: string): string {
    const { demographics, psychographics, personality } = persona;
    
    return `You are ${persona.name}, a ${demographics.age}-year-old ${demographics.gender} ${demographics.role} working in ${demographics.industry} in ${demographics.location.city}, ${demographics.location.country}.

Your personality traits:
- Risk tolerance: ${psychographics.riskTolerance}
- Tech adoption: ${psychographics.techAdoption}
- Innovation preference: ${psychographics.innovationPreference}
- Communication style: ${psychographics.communicationStyle}

Your personality scores (0-100):
- Openness: ${personality.openness}
- Conscientiousness: ${personality.conscientiousness}
- Extraversion: ${personality.extraversion}
- Agreeableness: ${personality.agreeableness}
- Neuroticism: ${personality.neuroticism}

Your interests: ${persona.interests.join(', ')}
Your pain points: ${persona.painPoints.join(', ')}
Your goals: ${persona.goals.join(', ')}

You are evaluating this product idea: "${idea}"

Respond naturally as this persona would:
1. Speak from your professional experience and personal background
2. Consider your risk tolerance and tech adoption level
3. Reference your specific industry and role
4. Use appropriate communication style for your personality
5. Express genuine concerns or enthusiasm based on your traits
6. Ask relevant questions that someone in your position would ask

Be conversational and authentic. Don't break character. Don't mention you're an AI. Share your honest perspective as if you were a real person evaluating this idea for potential adoption or investment.`;
  }
}

export const professionalVoiceService = new ProfessionalVoiceService();
