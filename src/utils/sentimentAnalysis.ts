import { Persona } from '@/types/persona';
import { Country } from '@/types/country';

export interface SentimentAnalysis {
  sentiment: 'positive' | 'negative' | 'neutral';
  confidence: number;
  reasoning: string;
  feedback: string;
  score: number;
}

export function analyzeSentiment(persona: Persona, idea: string): SentimentAnalysis {
  let score = 0;
  const ideaKeywords = idea.toLowerCase().split(' ');
  
  // Factor in personality traits
  score += (persona.personality.openness - 50) * 0.1;
  score += (persona.personality.extraversion - 50) * 0.05;
  score += (persona.personality.conscientiousness - 50) * 0.03;
  
  // Factor in tech adoption
  switch (persona.psychographics.techAdoption) {
    case 'early-adopter':
      score += 25;
      break;
    case 'early-majority':
      score += 10;
      break;
    case 'late-majority':
      score -= 10;
      break;
    case 'laggard':
      score -= 25;
      break;
  }
  
  // Factor in risk tolerance
  switch (persona.psychographics.riskTolerance) {
    case 'high':
      score += 20;
      break;
    case 'medium':
      score += 5;
      break;
    case 'low':
      score -= 15;
      break;
  }
  
  // Factor in innovation preference
  switch (persona.psychographics.innovationPreference) {
    case 'cutting-edge':
      score += 15;
      break;
    case 'proven':
      score += 5;
      break;
    case 'traditional':
      score -= 10;
      break;
  }
  
  // Factor in interests matching
  persona.interests.forEach(interest => {
    if (ideaKeywords.some(keyword => interest.toLowerCase().includes(keyword))) {
      score += 15;
    }
  });
  
  // Factor in industry relevance
  if (ideaKeywords.some(keyword => persona.demographics.industry.toLowerCase().includes(keyword))) {
    score += 20;
  }
  
  // Factor in role relevance
  if (ideaKeywords.some(keyword => persona.demographics.role.toLowerCase().includes(keyword))) {
    score += 18;
  }
  
  // Factor in company size
  switch (persona.demographics.companySize) {
    case 'startup':
      score += 10;
      break;
    case 'small':
      score += 5;
      break;
    case 'medium':
      score += 0;
      break;
    case 'enterprise':
      score -= 5;
      break;
  }
  
  // Add some randomness for realism
  score += (Math.random() - 0.5) * 30;
  
  // Determine sentiment
  let sentiment: 'positive' | 'negative' | 'neutral';
  let confidence: number;
  
  if (score > 30) {
    sentiment = 'positive';
    confidence = Math.min(0.9, (score - 30) / 70);
  } else if (score < -30) {
    sentiment = 'negative';
    confidence = Math.min(0.9, Math.abs(score + 30) / 70);
  } else {
    sentiment = 'neutral';
    confidence = Math.min(0.8, (30 - Math.abs(score)) / 30);
  }
  
  // Generate feedback and reasoning
  const { feedback, reasoning } = generateFeedback(persona, idea, sentiment, score);
  
  return {
    sentiment,
    confidence,
    reasoning,
    feedback,
    score,
  };
}

function generateFeedback(
  persona: Persona,
  idea: string,
  sentiment: 'positive' | 'negative' | 'neutral',
  score: number
): { feedback: string; reasoning: string } {
  const templates = {
    positive: {
      feedback: [
        `This idea aligns perfectly with my goals of ${persona.goals[0]}. I can see immediate value for my ${persona.demographics.industry} team.`,
        `As someone who's always looking for ${persona.interests[0]} solutions, this really excites me. The potential impact is huge.`,
        `This addresses exactly what I've been struggling with regarding ${persona.painPoints[0]}. Count me in!`,
        `Finally, a solution that understands the ${persona.demographics.industry} market. This could revolutionize how we work.`,
        `I've been waiting for something like this. The ${persona.demographics.role} perspective makes this very compelling.`
      ],
      reasoning: [
        `My experience in ${persona.demographics.role} has taught me that ${persona.interests[0]} solutions like this are exactly what the market needs.`,
        `Given my ${persona.psychographics.riskTolerance} risk tolerance and focus on ${persona.goals[0]}, this is a perfect fit.`,
        `I've been looking for something to help with ${persona.painPoints[0]}, and this addresses it directly.`,
        `The ${persona.demographics.industry} industry needs innovation, and this delivers exactly what we've been missing.`,
        `As an early adopter, I can see the potential here. This could be a game-changer for ${persona.demographics.companySize} companies.`
      ]
    },
    neutral: {
      feedback: [
        `Interesting concept. I'd need to see more details about how it integrates with our current ${persona.demographics.industry} processes.`,
        `I can see the potential, but I'm not sure if it's the right fit for our ${persona.demographics.companySize} company at this time.`,
        `The idea has merit, but I'd want to understand the implementation timeline and costs better.`,
        `It's an intriguing approach to ${persona.painPoints[0]}, though I'd need to see how it compares to existing solutions.`,
        `There's definitely a need for this type of solution, but I'd want to see more validation before committing.`
      ],
      reasoning: [
        `I need more information about how this would work in practice for someone in my ${persona.demographics.role} position.`,
        `The concept is sound, but I'd need to see how it integrates with our existing ${persona.demographics.industry} workflows.`,
        `I'm cautiously optimistic but would want to see a pilot program first.`,
        `Given our current focus on ${persona.goals[0]}, I'd need to understand how this fits into our priorities.`,
        `The ${persona.demographics.industry} market is complex, and I'd want to see more evidence of success before investing.`
      ]
    },
    negative: {
      feedback: [
        `I'm not convinced this solves our core problem of ${persona.painPoints[0]}. The approach seems too complex.`,
        `Given our current challenges with ${persona.painPoints[1]}, this doesn't seem like the right priority right now.`,
        `I've seen similar solutions fail before. The market isn't ready for this type of ${persona.demographics.industry} innovation.`,
        `This feels like a solution looking for a problem. We need something more practical for our ${persona.demographics.companySize} company.`,
        `The concept is interesting, but I don't see how it addresses the real issues we face in ${persona.demographics.industry}.`
      ],
      reasoning: [
        `Based on my experience with ${persona.demographics.industry} solutions, this approach has fundamental flaws.`,
        `I'm concerned about the complexity and whether it truly addresses ${persona.painPoints[0]} effectively.`,
        `Given our current focus on ${persona.goals[0]}, this doesn't align with our priorities.`,
        `The ${persona.demographics.industry} market has specific needs that this doesn't seem to understand.`,
        `I've been burned by similar ${persona.interests[0]} solutions before. I need something more proven.`
      ]
    }
  };
  
  const sentimentTemplates = templates[sentiment];
  const feedback = sentimentTemplates.feedback[Math.floor(Math.random() * sentimentTemplates.feedback.length)];
  const reasoning = sentimentTemplates.reasoning[Math.floor(Math.random() * sentimentTemplates.reasoning.length)];
  
  return { feedback, reasoning };
}

export function calculateMarketSentiment(countries: Country[]): {
  positive: number;
  neutral: number;
  negative: number;
  total: number;
  percentage: {
    positive: number;
    neutral: number;
    negative: number;
  };
} {
  const total = countries.length;
  const positive = countries.filter(c => c.sentiment === 'positive').length;
  const neutral = countries.filter(c => c.sentiment === 'neutral').length;
  const negative = countries.filter(c => c.sentiment === 'negative').length;
  
  return {
    positive,
    neutral,
    negative,
    total,
    percentage: {
      positive: (positive / total) * 100,
      neutral: (neutral / total) * 100,
      negative: (negative / total) * 100,
    }
  };
}

export function getSentimentColor(sentiment: 'positive' | 'negative' | 'neutral'): string {
  switch (sentiment) {
    case 'positive':
      return '#10b981'; // Green
    case 'negative':
      return '#ef4444'; // Red
    case 'neutral':
      return '#f59e0b'; // Yellow/Orange
    default:
      return '#6b7280'; // Gray
  }
}

export function getSentimentOpacity(sentiment: 'positive' | 'negative' | 'neutral'): number {
  switch (sentiment) {
    case 'positive':
      return 0.8;
    case 'negative':
      return 0.7;
    case 'neutral':
      return 0.6;
    default:
      return 0.5;
  }
}
