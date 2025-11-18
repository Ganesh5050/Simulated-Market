export interface VoiceRecording {
  id: string
  audioBlob: Blob
  audioUrl: string
  duration: number
  transcript?: string
  createdAt: Date
}

export interface VoiceCall {
  id: string
  personaId: string
  personaName: string
  status: 'idle' | 'recording' | 'processing' | 'completed' | 'error'
  recording?: VoiceRecording
  transcript?: string
  personaResponse?: string
  error?: string
}

class VoiceRecordingService {
  private mediaRecorder: MediaRecorder | null = null
  private audioChunks: Blob[] = []
  private stream: MediaStream | null = null
  private currentCall: VoiceCall | null = null
  private startTime: number = 0

  async requestMicrophonePermission(): Promise<boolean> {
    try {
      // Ensure we're in a secure context; browsers block mic on non-secure origins
      if (typeof window !== 'undefined' && !window.isSecureContext) {
        throw new Error('Microphone requires a secure context (use http://localhost or HTTPS)')
      }

      const constraints: MediaStreamConstraints = {
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      }

      // Modern API
      if (typeof navigator !== 'undefined' && navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        this.stream = await navigator.mediaDevices.getUserMedia(constraints)
        return true
      }

      // Legacy getUserMedia fallbacks
      const legacyGetUserMedia: any = (navigator as any).getUserMedia || (navigator as any).webkitGetUserMedia || (navigator as any).mozGetUserMedia
      if (legacyGetUserMedia) {
        this.stream = await new Promise<MediaStream>((resolve, reject) => {
          legacyGetUserMedia.call(navigator, constraints, resolve, reject)
        })
        return true
      }

      throw new Error('getUserMedia is not available in this browser')
    } catch (error) {
      console.error('Microphone permission denied:', error)
      return false
    }
  }

  // Generate mock persona response based on persona characteristics
  private generatePersonaResponse(personaId: string, personaName: string, transcript?: string): string {
    const responses = {
      // Technology personas
      'tech-lead': [
        "From a technical perspective, this has potential but I'd need to see the architecture first.",
        "Interesting concept. Have you considered scalability and performance implications?",
        "I like the innovation, but we'd need to evaluate the technical feasibility carefully."
      ],
      'developer': [
        "This could work! What tech stack are you planning to use?",
        "Cool idea! I'd be interested in helping build the MVP.",
        "As a developer, I see some challenges but nothing insurmountable."
      ],
      
      // Business personas
      'ceo': [
        "What's the ROI timeline? I need to see the business case.",
        "Interesting. How does this scale to enterprise level?",
        "I like the vision, but let's discuss market strategy first."
      ],
      'manager': [
        "How would this integrate with our current workflows?",
        "I need to understand the implementation timeline and resource requirements.",
        "This could benefit my team, but I need more details on training."
      ],
      
      // Healthcare personas
      'doctor': [
        "How does this comply with HIPAA regulations?",
        "Patient privacy would be my primary concern here.",
        "This could improve patient outcomes if implemented correctly."
      ],
      'nurse': [
        "Would this reduce administrative burden or add to it?",
        "I need something that's intuitive and doesn't disrupt patient care.",
        "If it saves time and improves care, I'm interested."
      ],
      
      // Finance personas
      'analyst': [
        "What are the security implications and compliance requirements?",
        "I'd need to see a detailed risk assessment before proceeding.",
        "The financial projections look promising but need more validation."
      ],
      'investor': [
        "What's your competitive advantage and market size?",
        "I need to see the unit economics and customer acquisition cost.",
        "Interesting space, but what's your go-to-market strategy?"
      ],
      
      // Default responses
      'default': [
        "This is an interesting concept. I'd like to learn more.",
        "I can see potential here. What problem does this solve specifically?",
        "How does this compare to existing solutions in the market?",
        "I'm intrigued. What makes your approach unique?",
        "This could work. Have you tested it with real users yet?"
      ]
    }

    // Determine persona type based on persona name
    let personaType = 'default'
    if (personaName.toLowerCase().includes('tech') || personaName.toLowerCase().includes('developer')) {
      personaType = 'developer'
    } else if (personaName.toLowerCase().includes('ceo') || personaName.toLowerCase().includes('executive')) {
      personaType = 'ceo'
    } else if (personaName.toLowerCase().includes('manager') || personaName.toLowerCase().includes('director')) {
      personaType = 'manager'
    } else if (personaName.toLowerCase().includes('doctor') || personaName.toLowerCase().includes('medical')) {
      personaType = 'doctor'
    } else if (personaName.toLowerCase().includes('nurse') || personaName.toLowerCase().includes('healthcare')) {
      personaType = 'nurse'
    } else if (personaName.toLowerCase().includes('analyst') || personaName.toLowerCase().includes('finance')) {
      personaType = 'analyst'
    } else if (personaName.toLowerCase().includes('investor') || personaName.toLowerCase().includes('venture')) {
      personaType = 'investor'
    }

    const responseList = responses[personaType as keyof typeof responses] || responses.default
    const randomResponse = responseList[Math.floor(Math.random() * responseList.length)]
    
    // Add context based on transcript if available
    if (transcript && transcript.length > 0) {
      return `${randomResponse} Based on what you said about "${transcript.substring(0, 50)}...", I think this deserves further consideration.`
    }
    
    return randomResponse
  }

  // Enhanced startRecording with persona response simulation
  async startRecording(personaId: string, personaName: string): Promise<VoiceCall> {
    try {
      // Request microphone permission
      const hasPermission = await this.requestMicrophonePermission()
      if (!hasPermission) {
        throw new Error('Microphone permission denied')
      }

      // Create new call
      const callId = `call-${Date.now()}`
      this.currentCall = {
        id: callId,
        personaId,
        personaName,
        status: 'recording'
      }

      // Setup media recorder
      this.mediaRecorder = new MediaRecorder(this.stream!)
      this.audioChunks = []
      this.startTime = Date.now()

      // Handle data available
      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data)
        }
      }

      // Handle recording stop
      this.mediaRecorder.onstop = async () => {
        try {
          // Create audio blob
          const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' })
          const audioUrl = URL.createObjectURL(audioBlob)
          const duration = (Date.now() - this.startTime) / 1000

          // Create recording object
          const recording: VoiceRecording = {
            id: `recording-${Date.now()}`,
            audioBlob,
            audioUrl,
            duration,
            createdAt: new Date()
          }

          // Update call with recording
          if (this.currentCall) {
            this.currentCall.recording = recording
            this.currentCall.status = 'processing'
            
            // Simulate processing time
            setTimeout(() => {
              if (this.currentCall) {
                // Generate mock transcript (simulated)
                this.currentCall.transcript = this.generateMockTranscript()
                
                // Generate persona response
                this.currentCall.personaResponse = this.generatePersonaResponse(
                  personaId, 
                  personaName, 
                  this.currentCall.transcript
                )
                
                this.currentCall.status = 'completed'
              }
            }, 2000) // 2 second processing delay
          }
        } catch (error) {
          if (this.currentCall) {
            this.currentCall.status = 'error'
            this.currentCall.error = error instanceof Error ? error.message : 'Processing failed'
          }
        }
      }

      // Start recording
      this.mediaRecorder.start()
      return this.currentCall

    } catch (error) {
      if (this.currentCall) {
        this.currentCall.status = 'error'
        this.currentCall.error = error instanceof Error ? error.message : 'Failed to start recording'
      }
      throw error
    }
  }

  // Generate mock transcript (since we're not using real speech recognition)
  private generateMockTranscript(): string {
    const mockTranscripts = [
      "I think this idea has a lot of potential, especially in the current market.",
      "This could really solve some important problems we're facing.",
      "I'm interested in learning more about the technical implementation.",
      "The business model seems sound, but I'd like to see more details.",
      "This innovation could disrupt the industry if executed properly.",
      "I have some concerns about the scalability and market adoption.",
      "The concept is solid, but the execution will be key.",
      "I believe this could work well with the right team and resources."
    ]
    
    return mockTranscripts[Math.floor(Math.random() * mockTranscripts.length)]
  }

  // Stop recording and return the call
  async stopRecording(): Promise<VoiceCall | null> {
    if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
      this.mediaRecorder.stop()
    }
    return this.currentCall
  }

  /**
   * Get the current voice call
   */
  getCurrentCall(): VoiceCall | null {
    return this.currentCall;
  }

  /**
   * Play a recorded voice call
   */
  playRecording(call: VoiceCall): void {
    if (call.recording && call.recording.audioUrl) {
      const audio = new Audio(call.recording.audioUrl);
      audio.play().catch(error => {
        console.error('Failed to play recording:', error);
      });
    }
  }

  /**
   * Download a recorded voice call
   */
  downloadRecording(call: VoiceCall): void {
    if (call.recording && call.recording.audioUrl) {
      const link = document.createElement('a');
      link.href = call.recording.audioUrl;
      link.download = `persona-voice-${call.personaId}.wav`;
      link.click();
    }
  }

  /**
   * Process the recorded audio with AI (mock implementation)
   */
  async processAudioWithAI(recording: VoiceRecording): Promise<string> {
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 1000))
    return this.generateMockTranscript()
  }

  // Get transcript from recording (mock implementation)
  async getTranscript(recording: VoiceRecording): Promise<string> {
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 1000))
    return this.generateMockTranscript()
  }

  // Get persona response for a call
  getPersonaResponse(call: VoiceCall): string | null {
    return call.personaResponse || null
  }
}

export const voiceRecordingService = new VoiceRecordingService()
