import { useEffect, useRef } from 'react'
import { tunnelService } from '@/services/tunnelService'

export function useAutoSave(sessionId: string | null, data: any, delay: number = 2000) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const lastSavedDataRef = useRef<any>(null)

  useEffect(() => {
    if (!sessionId || !data) return

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    // Check if data has changed
    if (JSON.stringify(data) === JSON.stringify(lastSavedDataRef.current)) {
      return
    }

    // Set new timeout for auto-save
    timeoutRef.current = setTimeout(async () => {
      try {
        await tunnelService.autoSaveSession(sessionId, data)
        lastSavedDataRef.current = data
        console.log('Auto-saved session:', sessionId)
      } catch (error) {
        console.error('Auto-save failed:', error)
      }
    }, delay)

    // Cleanup function
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [sessionId, data, delay])

  // Manual save function
  const saveNow = async () => {
    if (!sessionId || !data) return

    try {
      await tunnelService.autoSaveSession(sessionId, data)
      lastSavedDataRef.current = data
      console.log('Manually saved session:', sessionId)
    } catch (error) {
      console.error('Manual save failed:', error)
    }
  }

  return { saveNow }
}
