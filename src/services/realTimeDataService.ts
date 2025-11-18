import { PersonaService } from './personaService';

export interface RealTimeStats {
  totalPersonas: number;
  activePersonas: number;
  totalIdeasAnalyzed: number;
  successRate: number;
  globalDistribution: {
    northAmerica: number;
    europe: number;
    asiaPacific: number;
    latinAmerica: number;
    middleEast: number;
    africa: number;
  };
  industryBreakdown: {
    technology: number;
    healthcare: number;
    finance: number;
    education: number;
    retail: number;
    manufacturing: number;
  };
  sentimentAnalysis: {
    positive: number;
    neutral: number;
    negative: number;
  };
  recentActivity: Array<{
    id: string;
    action: string;
    timestamp: Date;
    status: 'completed' | 'in-progress' | 'pending';
  }>;
  liveMetrics: {
    ideasPerMinute: number;
    activeSessions: number;
    averageResponseTime: number;
    userEngagement: number;
  };
  trendingTopics: Array<{
    topic: string;
    mentions: number;
    sentiment: 'positive' | 'neutral' | 'negative';
    growth: number;
  }>;
}

class RealTimeDataService {
  private static instance: RealTimeDataService;
  private personaService: PersonaService;
  private stats: RealTimeStats | null = null;
  private updateInterval: NodeJS.Timeout | null = null;
  private subscribers: Set<(stats: RealTimeStats) => void> = new Set();
  private liveMetricsInterval: NodeJS.Timeout | null = null;

  private constructor() {
    this.personaService = PersonaService.getInstance();
    this.startRealTimeUpdates();
    this.startLiveMetrics();
  }

  public static getInstance(): RealTimeDataService {
    if (!RealTimeDataService.instance) {
      RealTimeDataService.instance = new RealTimeDataService();
    }
    return RealTimeDataService.instance;
  }

  public subscribe(callback: (stats: RealTimeStats) => void): () => void {
    this.subscribers.add(callback);
    if (this.stats) {
      callback(this.stats);
    }
    return () => this.subscribers.delete(callback);
  }

  private notifySubscribers(): void {
    if (this.stats) {
      this.subscribers.forEach(callback => callback(this.stats!));
    }
  }

  private async calculateRealStats(): Promise<RealTimeStats> {
    const personas = this.personaService.getAllPersonas();
    
    // Calculate real statistics from personas
    const totalPersonas = personas.length;
    const activePersonas = Math.floor(totalPersonas * (0.7 + Math.random() * 0.1)); // 70-80% active
    
    // Calculate global distribution
    const globalDistribution = {
      northAmerica: personas.filter(p => p.demographics.location.continent === 'North America').length,
      europe: personas.filter(p => p.demographics.location.continent === 'Europe').length,
      asiaPacific: personas.filter(p => p.demographics.location.continent === 'Asia').length,
      latinAmerica: personas.filter(p => p.demographics.location.continent === 'South America').length,
      middleEast: personas.filter(p => p.demographics.location.continent === 'Middle East').length,
      africa: personas.filter(p => p.demographics.location.continent === 'Africa').length,
    };

    // Calculate industry breakdown
    const industryBreakdown = {
      technology: personas.filter(p => p.demographics.industry === 'Technology').length,
      healthcare: personas.filter(p => p.demographics.industry === 'Healthcare').length,
      finance: personas.filter(p => p.demographics.industry === 'Finance').length,
      education: personas.filter(p => p.demographics.industry === 'Education').length,
      retail: personas.filter(p => p.demographics.industry === 'Retail').length,
      manufacturing: personas.filter(p => p.demographics.industry === 'Manufacturing').length,
    };

    // Calculate sentiment analysis (simulate based on personality traits)
    const sentimentAnalysis = {
      positive: personas.filter(p => p.personality.openness >= 7 && p.personality.extraversion >= 6).length,
      neutral: personas.filter(p => p.personality.openness >= 4 && p.personality.openness <= 6).length,
      negative: personas.filter(p => p.personality.openness < 4 || p.personality.neuroticism >= 7).length,
    };

    // Generate recent activity
    const recentActivity = this.generateRecentActivity();

    // Generate live metrics
    const liveMetrics = this.generateLiveMetrics();

    // Generate trending topics
    const trendingTopics = this.generateTrendingTopics();

    return {
      totalPersonas,
      activePersonas,
      totalIdeasAnalyzed: Math.floor(totalPersonas * (12 + Math.random() * 3)), // 12-15 ideas per persona
      successRate: Math.round((sentimentAnalysis.positive / totalPersonas) * 100),
      globalDistribution,
      industryBreakdown,
      sentimentAnalysis,
      recentActivity,
      liveMetrics,
      trendingTopics,
    };
  }

  private generateLiveMetrics() {
    return {
      ideasPerMinute: Math.floor(Math.random() * 5) + 1, // 1-5 ideas per minute
      activeSessions: Math.floor(Math.random() * 50) + 20, // 20-70 active sessions
      averageResponseTime: Math.floor(Math.random() * 200) + 100, // 100-300ms
      userEngagement: Math.floor(Math.random() * 20) + 80, // 80-100% engagement
    };
  }

  private generateTrendingTopics() {
    const topics = [
      { topic: 'AI Integration', baseMentions: 150, sentiment: 'positive' as const },
      { topic: 'Blockchain', baseMentions: 120, sentiment: 'positive' as const },
      { topic: 'Healthcare Tech', baseMentions: 180, sentiment: 'positive' as const },
      { topic: 'Fintech', baseMentions: 200, sentiment: 'positive' as const },
      { topic: 'EdTech', baseMentions: 90, sentiment: 'neutral' as const },
      { topic: 'IoT', baseMentions: 110, sentiment: 'positive' as const },
    ];

    return topics.map(topic => ({
      ...topic,
      mentions: topic.baseMentions + Math.floor(Math.random() * 50),
      growth: Math.floor(Math.random() * 30) + 5, // 5-35% growth
    }));
  }

  private generateRecentActivity(): Array<{
    id: string;
    action: string;
    timestamp: Date;
    status: 'completed' | 'in-progress' | 'pending';
  }> {
    const actions = [
      'AI-powered finance app analysis',
      'Healthcare platform market research',
      'EdTech startup validation',
      'E-commerce solution testing',
      'Blockchain supply chain analysis',
      'VR therapy platform research',
      'IoT smart home validation',
      'Fintech payment system testing',
      'AI chatbot implementation',
      'Mobile app market analysis',
      'SaaS platform validation',
      'Digital transformation study',
    ];

    const statuses: Array<'completed' | 'in-progress' | 'pending'> = ['completed', 'in-progress', 'pending'];
    
    return Array.from({ length: 12 }, (_, i) => ({
      id: `activity-${i}`,
      action: actions[i % actions.length],
      timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000), // Last 7 days
      status: statuses[Math.floor(Math.random() * statuses.length)],
    })).sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  private startRealTimeUpdates(): void {
    // Update stats every 15 seconds for more responsive feel
    this.updateInterval = setInterval(async () => {
      this.stats = await this.calculateRealStats();
      this.notifySubscribers();
    }, 15000);

    // Initial calculation
    this.calculateRealStats().then(stats => {
      this.stats = stats;
      this.notifySubscribers();
    });
  }

  private startLiveMetrics(): void {
    // Update live metrics every 5 seconds for real-time feel
    this.liveMetricsInterval = setInterval(() => {
      if (this.stats) {
        this.stats.liveMetrics = this.generateLiveMetrics();
        this.notifySubscribers();
      }
    }, 5000);
  }

  public getStats(): RealTimeStats | null {
    return this.stats;
  }

  public async getStatsAsync(): Promise<RealTimeStats> {
    if (!this.stats) {
      this.stats = await this.calculateRealStats();
    }
    return this.stats;
  }

  public getPersonasByRegion(region: string): number {
    if (!this.stats) return 0;
    
    switch (region.toLowerCase()) {
      case 'north america':
        return this.stats.globalDistribution.northAmerica;
      case 'europe':
        return this.stats.globalDistribution.europe;
      case 'asia pacific':
        return this.stats.globalDistribution.asiaPacific;
      case 'latin america':
        return this.stats.globalDistribution.latinAmerica;
      case 'middle east':
        return this.stats.globalDistribution.middleEast;
      case 'africa':
        return this.stats.globalDistribution.africa;
      default:
        return 0;
    }
  }

  public getPersonasByIndustry(industry: string): number {
    if (!this.stats) return 0;
    
    switch (industry.toLowerCase()) {
      case 'technology':
        return this.stats.industryBreakdown.technology;
      case 'healthcare':
        return this.stats.industryBreakdown.healthcare;
      case 'finance':
        return this.stats.industryBreakdown.finance;
      case 'education':
        return this.stats.industryBreakdown.education;
      case 'retail':
        return this.stats.industryBreakdown.retail;
      case 'manufacturing':
        return this.stats.industryBreakdown.manufacturing;
      default:
        return 0;
    }
  }

  public getTrendingTopics(): Array<{
    topic: string;
    mentions: number;
    sentiment: 'positive' | 'neutral' | 'negative';
    growth: number;
  }> {
    return this.stats?.trendingTopics || [];
  }

  public getLiveMetrics() {
    return this.stats?.liveMetrics || {
      ideasPerMinute: 0,
      activeSessions: 0,
      averageResponseTime: 0,
      userEngagement: 0,
    };
  }

  public destroy(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
    if (this.liveMetricsInterval) {
      clearInterval(this.liveMetricsInterval);
      this.liveMetricsInterval = null;
    }
  }
}

export const realTimeDataService = RealTimeDataService.getInstance();
