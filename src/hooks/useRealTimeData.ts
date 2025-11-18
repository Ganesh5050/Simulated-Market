import { useState, useEffect } from 'react';
import { realTimeDataService, RealTimeStats } from '@/services/realTimeDataService';

export const useRealTimeData = () => {
  const [stats, setStats] = useState<RealTimeStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadStats = async () => {
      try {
        setIsLoading(true);
        const realStats = await realTimeDataService.getStatsAsync();
        setStats(realStats);
        setError(null);
      } catch (err) {
        setError('Failed to load real-time data');
        console.error('Error loading real-time data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadStats();

    // Subscribe to real-time updates
    const unsubscribe = realTimeDataService.subscribe((newStats) => {
      setStats(newStats);
      setError(null);
    });

    return unsubscribe;
  }, []);

  return {
    stats,
    isLoading,
    error,
    getPersonasByRegion: (region: string) => realTimeDataService.getPersonasByRegion(region),
    getPersonasByIndustry: (industry: string) => realTimeDataService.getPersonasByIndustry(industry),
    getTrendingTopics: () => realTimeDataService.getTrendingTopics(),
    getLiveMetrics: () => realTimeDataService.getLiveMetrics(),
  };
};
