import { useState, useEffect } from 'react'
import { tunnelService } from '@/services/tunnelService'
import type { MarketAnalysis, Session, PersonaProfile, VapiCall } from '@/services/tunnelService'

export interface UseTunnelReturn {
  // Analysis state
  analysis: MarketAnalysis | null
  isLoading: boolean
  error: string | null
  
  // Voice call state
  activeCall: VapiCall | null
  isCallLoading: boolean
  callError: string | null
  
  // Session state
  sessions: Session[]
  currentSession: Session | null
  
  // Actions
  analyzeIdea: (userId: string, idea: string) => Promise<void>
  startVoiceCall: (personaId: string, idea: string, reaction?: any) => Promise<void>
  endVoiceCall: (callId: string) => Promise<void>
  getCallStatus: (callId: string) => Promise<void>
  loadSessions: (userId: string) => Promise<void>
  loadSession: (sessionId: string) => Promise<void>
  clearError: () => void
}

export function useTunnel(): UseTunnelReturn {
  // Analysis state
  const [analysis, setAnalysis] = useState<MarketAnalysis | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Voice call state
  const [activeCall, setActiveCall] = useState<VapiCall | null>(null)
  const [isCallLoading, setIsCallLoading] = useState(false)
  const [callError, setCallError] = useState<string | null>(null)
  
  // Session state
  const [sessions, setSessions] = useState<Session[]>([])
  const [currentSession, setCurrentSession] = useState<Session | null>(null)

  // Analyze an idea
  const analyzeIdea = async (userId: string, idea: string) => {
    setIsLoading(true)
    setError(null)
    
    try {
      console.log('=== USE TUNNEL: Starting analysis ===');
      const result = await tunnelService.analyzeIdea(userId, idea)
      console.log('=== USE TUNNEL: Analysis result received ===');
      console.log('Result:', result);
      setAnalysis(result)
      
      // Create a mock session since we're not using real database
      const mockSession: Session = {
        id: result.sessionId,
        user_id: userId,
        idea: result.idea,
        reactions: result.reactions,
        insights: result.insights,
        viral_coefficient: result.viralCoefficient,
        global_deployment: result.globalDeployment,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      setCurrentSession(mockSession);
      console.log('=== USE TUNNEL: Session set ===');
    } catch (err) {
      console.error('=== USE TUNNEL: Error ===', err);
      setError(err instanceof Error ? err.message : 'Failed to analyze idea')
    } finally {
      setIsLoading(false)
    }
  }

  // Start voice conversation
  const startVoiceCall = async (personaId: string, idea: string, reaction?: any) => {
    setIsCallLoading(true)
    setCallError(null)
    
    try {
      const call = await tunnelService.startVoiceConversation(personaId, idea, reaction)
      setActiveCall(call)
    } catch (err) {
      setCallError(err instanceof Error ? err.message : 'Failed to start voice call')
    } finally {
      setIsCallLoading(false)
    }
  }

  // End voice call
  const endVoiceCall = async (callId: string) => {
    try {
      await tunnelService.endVoiceCall(callId)
      setActiveCall(null)
    } catch (err) {
      setCallError(err instanceof Error ? err.message : 'Failed to end call')
    }
  }

  // Get call status
  const getCallStatus = async (callId: string) => {
    try {
      const call = await tunnelService.getVoiceCallStatus(callId)
      setActiveCall(call)
    } catch (err) {
      setCallError(err instanceof Error ? err.message : 'Failed to get call status')
    }
  }

  // Load user sessions
  const loadSessions = async (userId: string) => {
    try {
      const userSessions = await tunnelService.getUserSessions(userId)
      setSessions(userSessions)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load sessions')
    }
  }

  // Load specific session
  const loadSession = async (sessionId: string) => {
    try {
      const session = await tunnelService.getSession(sessionId)
      setCurrentSession(session)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load session')
    }
  }

  // Clear errors
  const clearError = () => {
    setError(null)
    setCallError(null)
  }

  // Poll call status if there's an active call
  useEffect(() => {
    if (!activeCall || activeCall.status === 'completed' || activeCall.status === 'failed') {
      return
    }

    const interval = setInterval(async () => {
      try {
        const call = await tunnelService.getVoiceCallStatus(activeCall.id)
        setActiveCall(call)
        
        if (call.status === 'completed' || call.status === 'failed') {
          clearInterval(interval)
        }
      } catch (err) {
        console.error('Error polling call status:', err)
        clearInterval(interval)
      }
    }, 2000) // Poll every 2 seconds

    return () => clearInterval(interval)
  }, [activeCall?.id, activeCall?.status])

  return {
    // Analysis state
    analysis,
    isLoading,
    error,
    
    // Voice call state
    activeCall,
    isCallLoading,
    callError,
    
    // Session state
    sessions,
    currentSession,
    
    // Actions
    analyzeIdea,
    startVoiceCall,
    endVoiceCall,
    getCallStatus,
    loadSessions,
    loadSession,
    clearError,
  }
}

// Hook for managing personas
export function usePersonas() {
  const [personas, setPersonas] = useState<PersonaProfile[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadPersonas = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const allPersonas = await tunnelService.initializePersonas()
      setPersonas(allPersonas)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load personas')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadPersonas()
  }, [])

  return {
    personas,
    isLoading,
    error,
    reloadPersonas: loadPersonas,
  }
}