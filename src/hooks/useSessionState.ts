import { useState, useEffect, useCallback, useRef } from 'react';
import { SessionStateService, SessionState, UserPreferences } from '@/services/sessionStateService';

export const useSessionState = (projectId: string, sessionName?: string) => {
  const [sessionState, setSessionState] = useState<SessionState | null>(null);
  const [userPreferences, setUserPreferences] = useState<UserPreferences | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [sessionService] = useState(() => SessionStateService.getInstance());
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Load session state and user preferences
  useEffect(() => {
    loadSessionData();
  }, [projectId, sessionName]);

  const loadSessionData = async () => {
    try {
      setIsLoading(true);
      
      // Load user preferences
      const preferences = await sessionService.getUserPreferences();
      setUserPreferences(preferences);
      
      // Load session state
      const state = await sessionService.getSessionState(projectId, sessionName);
      setSessionState(state);
      
    } catch (error) {
      console.error('Failed to load session data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-save function with debouncing
  const autoSave = useCallback(async (updates: Partial<SessionState>) => {
    if (!userPreferences?.auto_save) return;

    // Clear existing timeout
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }

    // Set new timeout for auto-save
    autoSaveTimeoutRef.current = setTimeout(async () => {
      try {
        await sessionService.autoSaveSessionState(projectId, updates);
      } catch (error) {
        console.warn('Auto-save failed:', error);
      }
    }, 2000); // Auto-save after 2 seconds of inactivity
  }, [projectId, userPreferences?.auto_save, sessionService]);

  // Manual save function
  const saveSessionState = async (updates: Partial<SessionState>) => {
    try {
      setIsSaving(true);
      const savedState = await sessionService.saveSessionState(projectId, updates, sessionName);
      setSessionState(savedState);
      return savedState;
    } catch (error) {
      console.error('Failed to save session state:', error);
      throw error;
    } finally {
      setIsSaving(false);
    }
  };

  // Update session state (triggers auto-save)
  const updateSessionState = useCallback(async (updates: Partial<SessionState>, immediate = false) => {
    // Update local state immediately
    setSessionState(prev => prev ? { ...prev, ...updates } : null);

    if (immediate) {
      // Save immediately
      await saveSessionState(updates);
    } else {
      // Trigger auto-save
      await autoSave(updates);
    }
  }, [autoSave, saveSessionState]);

  // Create new session
  const createSession = async (newSessionName: string, description?: string) => {
    try {
      const newSession = await sessionService.createSession(projectId, newSessionName, description);
      setSessionState(newSession);
      return newSession;
    } catch (error) {
      console.error('Failed to create session:', error);
      throw error;
    }
  };

  // Get all sessions for the project
  const getProjectSessions = async () => {
    try {
      return await sessionService.getProjectSessions(projectId);
    } catch (error) {
      console.error('Failed to get project sessions:', error);
      throw error;
    }
  };

  // Delete session
  const deleteSession = async (sessionId: string) => {
    try {
      await sessionService.deleteSession(sessionId);
      if (sessionState?.id === sessionId) {
        setSessionState(null);
      }
    } catch (error) {
      console.error('Failed to delete session:', error);
      throw error;
    }
  };

  // Resume session
  const resumeSession = async (sessionId: string) => {
    try {
      const resumedSession = await sessionService.resumeSession(sessionId);
      setSessionState(resumedSession);
      return resumedSession;
    } catch (error) {
      console.error('Failed to resume session:', error);
      throw error;
    }
  };

  // Update user preferences
  const updateUserPreferences = async (preferences: Partial<UserPreferences>) => {
    try {
      const updatedPreferences = await sessionService.upsertUserPreferences(preferences);
      setUserPreferences(updatedPreferences);
      return updatedPreferences;
    } catch (error) {
      console.error('Failed to update user preferences:', error);
      throw error;
    }
  };

  // Cleanup auto-save timeout on unmount
  useEffect(() => {
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, []);

  return {
    sessionState,
    userPreferences,
    isLoading,
    isSaving,
    updateSessionState,
    saveSessionState,
    createSession,
    getProjectSessions,
    deleteSession,
    resumeSession,
    updateUserPreferences,
    loadSessionData
  };
};
