export interface Persona {
  id: string;
  name: string;
  demographics: {
    age: number;
    gender: 'male' | 'female' | 'non-binary';
    location: {
      city: string;
      country: string;
      continent: string;
      coordinates: {
        lat: number;
        lon: number;
      };
    };
    industry: string;
    role: string;
    companySize: 'startup' | 'small' | 'medium' | 'enterprise';
    income: number;
  };
  psychographics: {
    riskTolerance: 'low' | 'medium' | 'high';
    techAdoption: 'early-adopter' | 'early-majority' | 'late-majority' | 'laggard';
    innovationPreference: 'cutting-edge' | 'proven' | 'traditional';
    communicationStyle: 'direct' | 'diplomatic' | 'analytical' | 'creative';
  };
  personality: {
    openness: number; // 0-100
    conscientiousness: number; // 0-100
    extraversion: number; // 0-100
    agreeableness: number; // 0-100
    neuroticism: number; // 0-100
  };
  interests: string[];
  painPoints: string[];
  goals: string[];
  sentiment?: 'positive' | 'neutral' | 'negative';
  feedback?: string;
  reasoning?: string;
  voiceId?: string;
  lastInteraction?: Date;
}

export interface TunnelSession {
  id: string;
  userId: string;
  idea: string;
  personas: Persona[];
  focusGroup: string[]; // persona IDs
  globalDeployment: boolean;
  createdAt: Date;
  updatedAt: Date;
  version: number;
}

export interface MarketAnalysis {
  totalPersonas: number;
  positiveReactions: number;
  neutralReactions: number;
  negativeReactions: number;
  viralCoefficient: number;
  marketPenetration: number;
  geographicDistribution: Record<string, number>;
  demographicInsights: Record<string, any>;
  recommendations: string[];
}
