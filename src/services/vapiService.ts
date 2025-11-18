import Vapi from '@vapi-ai/web';

export interface VapiCallConfig {
  assistantConfig: any;
  personaName: string;
  productIdea: string;
  publicKey: string;
}

export interface VapiCallCallbacks {
  onCallStart?: () => void;
  onCallEnd?: () => void;
  onSpeechStart?: () => void;
  onSpeechEnd?: () => void;
  onMessage?: (message: any) => void;
  onTranscript?: (transcript: string, role: 'user' | 'assistant') => void;
  onError?: (error: any) => void;
}

class VapiService {
  private vapi: Vapi | null = null;
  private currentCallId: string | null = null;
  private callbacks: VapiCallCallbacks = {};

  /**
   * Initialize Vapi with public key
   */
  initialize(publicKey: string) {
    if (!publicKey) {
      throw new Error('Vapi public key is required');
    }
    
    if (!this.vapi) {
      try {
        this.vapi = new Vapi(publicKey);
        this.setupEventListeners();
        console.log('Vapi initialized successfully');
      } catch (error) {
        console.error('Failed to initialize Vapi:', error);
        throw new Error(`Vapi initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
  }

  /**
   * Setup event listeners for Vapi events
   */
  private setupEventListeners() {
    if (!this.vapi) return;

    // Call started
    this.vapi.on('call-start', () => {
      console.log('Vapi: Call started');
      this.callbacks.onCallStart?.();
    });

    // Call ended
    this.vapi.on('call-end', () => {
      console.log('Vapi: Call ended');
      this.currentCallId = null;
      this.callbacks.onCallEnd?.();
    });

    // Speech started (user or assistant started speaking)
    this.vapi.on('speech-start', () => {
      console.log('Vapi: Speech started');
      this.callbacks.onSpeechStart?.();
    });

    // Speech ended
    this.vapi.on('speech-end', () => {
      console.log('Vapi: Speech ended');
      this.callbacks.onSpeechEnd?.();
    });

    // Message received (includes transcripts, function calls, etc.)
    this.vapi.on('message', (message: any) => {
      console.log('Vapi message:', message);
      this.callbacks.onMessage?.(message);

      // Handle transcript updates
      if (message.type === 'transcript') {
        const transcript = message.transcript;
        const role = message.role; // 'user' or 'assistant'
        this.callbacks.onTranscript?.(transcript, role);
      }
    });

    // Errors
    this.vapi.on('error', (error: any) => {
      console.error('Vapi error:', error);
      this.callbacks.onError?.(error);
    });

    // Volume level (can be used for visualizations)
    this.vapi.on('volume-level', (volume: number) => {
      // You can use this for audio visualizations
      // console.log('Volume level:', volume);
    });
  }

  /**
   * Start a voice call with an assistant
   */
  async startCall(config: VapiCallConfig, callbacks: VapiCallCallbacks): Promise<boolean> {
    try {
      if (!this.vapi) {
        throw new Error('Vapi not initialized. Please call initialize() first.');
      }

      // Validate config
      if (!config.assistantConfig) {
        throw new Error('Assistant configuration is required');
      }

      if (!config.publicKey) {
        throw new Error('Vapi public key is required in configuration');
      }

      // Store callbacks
      this.callbacks = callbacks;

      console.log('Starting Vapi call with config:', config);

      // Start the call with assistant configuration
      await this.vapi.start(config.assistantConfig);
      
      console.log('Call started successfully with persona:', config.personaName);
      
      return true;
    } catch (error) {
      console.error('Failed to start Vapi call:', error);
      
      // Provide more specific error messages
      let errorMessage = 'Failed to start voice call';
      if (error instanceof Error) {
        if (error.message.includes('<!DOCTYPE')) {
          errorMessage = 'Vapi API authentication failed. Please check your Vapi API key.';
        } else if (error.message.includes('401') || error.message.includes('403')) {
          errorMessage = 'Vapi API key is invalid or expired.';
        } else if (error.message.includes('network') || error.message.includes('fetch')) {
          errorMessage = 'Network error. Please check your internet connection.';
        } else {
          errorMessage = `Voice call error: ${error.message}`;
        }
      }
      
      this.callbacks.onError?.(new Error(errorMessage));
      throw new Error(errorMessage);
    }
  }

  /**
   * End the current call
   */
  async endCall() {
    try {
      if (!this.vapi) {
        throw new Error('Vapi not initialized');
      }

      await this.vapi.stop();
      this.currentCallId = null;
      
      console.log('Call ended');
      
      return true;
    } catch (error) {
      console.error('Failed to end Vapi call:', error);
      throw error;
    }
  }

  /**
   * Check if currently in a call
   */
  isInCall(): boolean {
    return this.currentCallId !== null;
  }

  /**
   * Send a message to the assistant (text input)
   */
  async sendMessage(message: string) {
    try {
      if (!this.vapi) {
        throw new Error('Vapi not initialized');
      }

      await this.vapi.send({
        type: 'add-message',
        message: {
          role: 'user',
          content: message
        }
      });
      
      return true;
    } catch (error) {
      console.error('Failed to send message:', error);
      throw error;
    }
  }

  /**
   * Toggle mute
   */
  setMuted(muted: boolean) {
    try {
      if (!this.vapi) {
        throw new Error('Vapi not initialized');
      }

      this.vapi.setMuted(muted);
      
      return true;
    } catch (error) {
      console.error('Failed to set mute:', error);
      throw error;
    }
  }

  /**
   * Check if muted
   */
  isMuted(): boolean {
    if (!this.vapi) return false;
    return this.vapi.isMuted();
  }

  /**
   * Cleanup
   */
  cleanup() {
    this.vapi = null;
    this.currentCallId = null;
    this.callbacks = {};
  }
}

// Export singleton instance
export const vapiService = new VapiService();
