import { useState, useEffect } from 'react';
import { SentimentService } from '@/services/sentimentService';
import { Country } from '@/types/country';

export function useSimulation() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [marketInsights, setMarketInsights] = useState<string[]>([]);
  const [recommendations, setRecommendations] = useState<string[]>([]);

  const sentimentService = SentimentService.getInstance();

  const startAnalysis = async (countries: Country[]) => {
    setIsAnalyzing(true);
    setAnalysisComplete(false);

    // Simulate analysis delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    const insights = sentimentService.getMarketInsights(countries);
    const recs = sentimentService.getRecommendations(countries);

    setMarketInsights(insights);
    setRecommendations(recs);
    setIsAnalyzing(false);
    setAnalysisComplete(true);
  };

  const resetAnalysis = () => {
    setIsAnalyzing(false);
    setAnalysisComplete(false);
    setMarketInsights([]);
    setRecommendations([]);
  };

  return {
    isAnalyzing,
    analysisComplete,
    marketInsights,
    recommendations,
    actions: {
      startAnalysis,
      resetAnalysis,
    }
  };
}
