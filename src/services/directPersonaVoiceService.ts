import { Persona } from '@/types/persona';

export interface DirectVoiceCall {
  id: string;
  personaId: string;
  personaName: string;
  status: 'idle' | 'connecting' | 'speaking' | 'listening' | 'ended';
  transcript?: string;
  personaResponse?: string;
  error?: string;
  duration?: number;
}

export interface DirectVoiceCallbacks {
  onCallStart?: () => void;
  onCallEnd?: () => void;
  onSpeechStart?: () => void;
  onSpeechEnd?: () => void;
  onTranscript?: (transcript: string, role: 'user' | 'assistant') => void;
  onError?: (error: any) => void;
}

/**
 * Direct Persona Voice Service - Uses OpenAI GPT-3.5 directly like your previous project
 */
class DirectPersonaVoiceService {
  private currentCall: DirectVoiceCall | null = null;
  private callStartTime: number = 0;
  private recognition: any = null;
  private synthesis: SpeechSynthesis = window.speechSynthesis;
  private isListening: boolean = false;

  constructor() {
    // Initialize Web Speech API
    if ('webkitSpeechRecognition' in window) {
      this.recognition = new (window as any).webkitSpeechRecognition();
    } else if ('SpeechRecognition' in window) {
      this.recognition = new (window as any).SpeechRecognition();
    }
  }

  /**
   * Start a direct voice conversation with persona using GPT-3.5
   */
  async startVoiceCall(
    persona: Persona, 
    idea: string, 
    callbacks: DirectVoiceCallbacks
  ): Promise<DirectVoiceCall> {
    try {
      if (!persona) {
        throw new Error('Persona is required');
      }

      // Create call object
      const call: DirectVoiceCall = {
        id: `direct-voice-${Date.now()}`,
        personaId: persona.id,
        personaName: persona.name,
        status: 'connecting'
      };
      
      this.currentCall = call;
      this.callStartTime = Date.now();

      // Setup callbacks
      const enhancedCallbacks = {
        ...callbacks,
        onCallStart: () => {
          call.status = 'speaking';
          callbacks.onCallStart?.();
        },
        onCallEnd: () => {
          call.status = 'ended';
          call.duration = (Date.now() - this.callStartTime) / 1000;
          this.stopListening();
          callbacks.onCallEnd?.();
        },
        onSpeechStart: () => {
          call.status = 'listening';
          callbacks.onSpeechStart?.();
        },
        onSpeechEnd: () => {
          call.status = 'speaking';
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
        onError: (error: any) => {
          call.status = 'ended';
          call.error = error.message || 'Call failed';
          callbacks.onError?.(error);
        }
      };

      // Start the conversation
      await this.startDirectConversation(persona, idea, enhancedCallbacks);
      
      return call;
    } catch (error) {
      console.error('Failed to start direct voice call:', error);
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
      this.stopListening();
      this.synthesis.cancel();
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
  getCurrentCall(): DirectVoiceCall | null {
    return this.currentCall;
  }

  /**
   * Check if currently in a call
   */
  isInCall(): boolean {
    return this.currentCall !== null && this.currentCall.status !== 'ended';
  }

  /**
   * Start direct conversation with persona using GPT-3.5
   */
  private async startDirectConversation(
    persona: Persona, 
    idea: string, 
    callbacks: DirectVoiceCallbacks
  ): Promise<void> {
    try {
      callbacks.onCallStart?.();

      // Create persona introduction
      const introduction = `Hi, I'm ${persona.name}, a ${persona.demographics.age}-year-old ${persona.demographics.role} working in ${persona.demographics.industry} in ${persona.demographics.location.city}. I heard about your idea: "${idea}". I'd like to share my thoughts from my professional perspective.`;

      // Speak introduction
      await this.speak(introduction, callbacks);

      // Start listening for user response
      setTimeout(() => {
        this.startListening(callbacks, persona);
      }, 1000);

    } catch (error) {
      console.error('Failed to start direct conversation:', error);
      callbacks.onError?.(error);
    }
  }

  /**
   * Speak text using browser speech synthesis
   */
  private async speak(text: string, callbacks: DirectVoiceCallbacks): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.synthesis) {
        reject(new Error('Speech synthesis not supported'));
        return;
      }

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;

      // Select voice based on persona gender
      const voices = this.synthesis.getVoices();
      const femaleVoices = voices.filter(voice => voice.name.includes('Female') || voice.name.includes('female'));
      const maleVoices = voices.filter(voice => voice.name.includes('Male') || voice.name.includes('male'));
      
      if (voices.length > 0) {
        // Use first available voice as fallback
        utterance.voice = voices[0];
      }

      utterance.onstart = () => {
        callbacks.onSpeechStart?.();
      };

      utterance.onend = () => {
        callbacks.onSpeechEnd?.();
        resolve();
      };

      utterance.onerror = (error) => {
        reject(error);
      };

      this.synthesis.speak(utterance);
    });
  }

  /**
   * Start listening for user speech
   */
  private startListening(callbacks: DirectVoiceCallbacks, persona: Persona): void {
    if (!this.recognition) {
      callbacks.onError?.(new Error('Speech recognition not supported'));
      return;
    }

    this.recognition.continuous = false;
    this.recognition.interimResults = false;
    this.recognition.lang = 'en-US';

    this.recognition.onstart = () => {
      this.isListening = true;
      callbacks.onSpeechStart?.();
    };

    this.recognition.onresult = async (event: any) => {
      const transcript = event.results[0][0].transcript;
      callbacks.onTranscript?.(transcript, 'user');

      // Get persona response using GPT-3.5
      await this.getPersonaResponse(transcript, callbacks, persona);
    };

    this.recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      callbacks.onError?.(new Error(`Speech recognition error: ${event.error}`));
    };

    this.recognition.onend = () => {
      this.isListening = false;
      callbacks.onSpeechEnd?.();
    };

    this.recognition.start();
  }

  /**
   * Stop listening for user speech
   */
  private stopListening(): void {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
      this.isListening = false;
    }
  }

  /**
   * Get persona response using backend API
   */
  private async getPersonaResponse(userInput: string, callbacks: DirectVoiceCallbacks, persona: Persona): Promise<void> {
    try {
      // Call backend API instead of OpenAI directly
      const response = await fetch('https://pipe-it-backend.onrender.com/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          persona,
          userInput
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Backend API error: ${response.status}`);
      }

      const data = await response.json();
      const personaResponse = data.response;

      if (!personaResponse) {
        throw new Error('No response received from AI');
      }

      callbacks.onTranscript?.(personaResponse, 'assistant');

      // Speak the response
      await this.speak(personaResponse, callbacks);

      // Listen for next user input
      setTimeout(() => {
        if (this.isInCall()) {
          this.startListening(callbacks, persona);
        }
      }, 500);

    } catch (error) {
      console.error('Failed to get persona response:', error);
      callbacks.onError?.(error);
    }
  }

  /**
   * Create persona-specific prompt for GPT-3.5
   */
  private createPersonaPrompt(persona: Persona, userInput: string): string {
    return `You are ${persona.name}, a ${persona.demographics.age}-year-old ${persona.demographics.gender} ${persona.demographics.role} working in ${persona.demographics.industry} in ${persona.demographics.location.city}.

Your personality traits:
- Openness: ${persona.personality.openness}/10
- Conscientiousness: ${persona.personality.conscientiousness}/10
- Extraversion: ${persona.personality.extraversion}/10
- Agreeableness: ${persona.personality.agreeableness}/10
- Neuroticism: ${persona.personality.neuroticism}/10

Your characteristics:
- Risk tolerance: ${persona.psychographics.riskTolerance}
- Tech adoption: ${persona.psychographics.techAdoption}
- Innovation preference: ${persona.psychographics.innovationPreference}

Respond naturally as this persona would, considering your personality, role, and characteristics. Be conversational and authentic. Don't break character. Keep responses concise but informative.`;
  }

  /**
   * Get persona by ID (mock implementation - in real app this would come from state)
   */
  private getPersonaById(personaId: string): Persona | null {
    // This is a mock implementation - in real usage, you'd pass the persona object
    // or get it from your state management
    return null;
  }
}

export const directPersonaVoiceService = new DirectPersonaVoiceService();
