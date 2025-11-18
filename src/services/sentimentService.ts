// src/services/sentimentService.ts
import { analyze as sentiment } from 'sentiment';

interface SentimentResult {
  score: number;
  comparative: number;
  tokens: string[];
  words: string[];
  positive: string[];
  negative: string[];
}

export class SentimentService {
  private static instance: SentimentService;

  private constructor() {}

  public static getInstance(): SentimentService {
    if (!SentimentService.instance) {
      SentimentService.instance = new SentimentService();
    }
    return SentimentService.instance;
  }

  public analyzeText(text: string): SentimentResult {
    return sentiment(text) as SentimentResult;
  }

  public getSentimentScore(text: string): number {
    const result = this.analyzeText(text);
    return this.normalizeScore(result.score, result.comparative);
  }

  public getSentimentLabel(score: number): string {
    if (score > 0.5) return 'Very Positive';
    if (score > 0.1) return 'Positive';
    if (score < -0.5) return 'Very Negative';
    if (score < -0.1) return 'Negative';
    return 'Neutral';
  }

  public analyzePersonaSentiment(persona: any, content: string): any {
    const result = this.analyzeText(content);
    const normalizedScore = this.normalizeScore(result.score, result.comparative);
    
    // Adjust score based on persona's personality traits
    const adjustedScore = this.adjustScoreForPersona(normalizedScore, persona.personalityTraits);
    
    return {
      ...result,
      adjustedScore,
      label: this.getSentimentLabel(adjustedScore),
      personaId: persona.id,
      personaName: persona.name
    };
  }

  public analyzeMarketSentiment(feedback: Array<{ content: string; weight?: number }>): {
    overallScore: number;
    sentiment: string;
    positiveFeedback: string[];
    negativeFeedback: string[];
    neutralFeedback: string[];
  } {
    let totalScore = 0;
    let totalWeight = 0;
    const positive: string[] = [];
    const negative: string[] = [];
    const neutral: string[] = [];

    feedback.forEach(item => {
      const weight = item.weight || 1;
      const result = this.analyzeText(item.content);
      const score = this.normalizeScore(result.score, result.comparative);
      
      totalScore += score * weight;
      totalWeight += weight;

      if (score > 0.1) {
        positive.push(item.content);
      } else if (score < -0.1) {
        negative.push(item.content);
      } else {
        neutral.push(item.content);
      }
    });

    const overallScore = totalWeight > 0 ? totalScore / totalWeight : 0;

    return {
      overallScore,
      sentiment: this.getSentimentLabel(overallScore),
      positiveFeedback: positive,
      negativeFeedback: negative,
      neutralFeedback: neutral
    };
  }

  private normalizeScore(score: number, comparative: number): number {
    // Normalize score to range [-1, 1]
    const normalized = Math.tanh(score / 5);
    return Math.max(-1, Math.min(1, normalized));
  }

  private adjustScoreForPersona(score: number, traits: any): number {
    // Adjust score based on personality traits
    // Neuroticism makes negative scores more negative
    // Agreeableness makes positive scores more positive
    // Openness can amplify the absolute score
    const adjustment = 
      (traits.neuroticism / 100) * (score < 0 ? -0.3 : 0) +
      (traits.agreeableness / 100) * (score > 0 ? 0.2 : 0) +
      (traits.openness / 100) * 0.1 * Math.sign(score);

    return Math.max(-1, Math.min(1, score + adjustment));
  }

  public getSentimentEmoji(score: number): string {
    if (score > 0.5) return '😊';
    if (score > 0.1) return '🙂';
    if (score < -0.5) return '😠';
    if (score < -0.1) return '😕';
    return '😐';
  }

  public getSentimentColor(score: number): string {
    if (score > 0.5) return '#10B981'; // green-500
    if (score > 0.1) return '#34D399'; // emerald-400
    if (score < -0.5) return '#EF4444'; // red-500
    if (score < -0.1) return '#F59E0B'; // amber-500
    return '#9CA3AF'; // gray-400
  }

  public getSentimentGradient(score: number): string {
    if (score > 0) {
      const opacity = Math.min(0.2 + (score * 0.8), 1);
      return `rgba(16, 185, 129, ${opacity})`; // green with variable opacity
    } else if (score < 0) {
      const opacity = Math.min(0.2 + (Math.abs(score) * 0.8), 1);
      return `rgba(239, 68, 68, ${opacity})`; // red with variable opacity
    }
    return 'rgba(156, 163, 175, 0.5)'; // gray
  }

  // Methods for compatibility with hooks
  public getMarketInsights(countries: any[]): string[] {
    const insights = [
      'Market shows strong potential in tech-savvy demographics',
      'Early adopters are more receptive to innovative solutions',
      'Price sensitivity varies across different regions',
      'Clear value proposition needed for enterprise adoption'
    ];
    return insights;
  }

  public getRecommendations(countries: any[]): string[] {
    const recommendations = [
      'Focus on tech-forward markets first',
      'Develop tiered pricing strategy',
      'Emphasize ROI and efficiency gains',
      'Build partnerships with industry influencers'
    ];
    return recommendations;
  }
}

// Singleton instance
export const sentimentService = SentimentService.getInstance();

// Utility function for simple sentiment analysis
export function analyzeSentiment(text: string): { score: number; comparative: number; analysis: string } {
  const service = SentimentService.getInstance();
  const result = service.analyzeText(text);
  const normalizedScore = service.normalizeScore(result.score, result.comparative);
  
  return {
    score: normalizedScore,
    comparative: result.comparative,
    analysis: service.getSentimentLabel(normalizedScore)
  };
}
