import { Persona } from '@/types/persona';
import { Country } from '@/types/country';
import { countryData } from '@/utils/countryData';
import { analyzeSentiment } from '@/utils/sentimentAnalysis';

export class PersonaService {
  private static instance: PersonaService;
  private personas: Persona[] = [];

  private constructor() {
    this.generatePersonas();
  }

  public static getInstance(): PersonaService {
    if (!PersonaService.instance) {
      PersonaService.instance = new PersonaService();
    }
    return PersonaService.instance;
  }

  private generatePersonas(): void {
    this.personas = countryData.map((country, index) => {
      const persona: Persona = {
        id: `persona-${country.id}`,
        name: `${this.generateName()} (${country.name})`,
        demographics: {
          age: Math.floor(Math.random() * 35) + 25,
          gender: Math.random() < 0.4 ? 'male' : Math.random() < 0.7 ? 'female' : 'non-binary',
          location: {
            city: country.name,
            country: country.name,
            continent: country.region,
            coordinates: country.coordinates,
          },
          industry: this.getRandomIndustry(),
          role: this.getRandomRole(),
          companySize: this.getRandomCompanySize(),
          income: Math.floor(Math.random() * 200000) + 50000,
        },
        psychographics: {
          riskTolerance: this.getRandomRiskTolerance(),
          techAdoption: this.getRandomTechAdoption(),
          innovationPreference: this.getRandomInnovationPreference(),
          communicationStyle: this.getRandomCommunicationStyle(),
        },
        personality: {
          openness: Math.floor(Math.random() * 40) + 30,
          conscientiousness: Math.floor(Math.random() * 40) + 30,
          extraversion: Math.floor(Math.random() * 40) + 30,
          agreeableness: Math.floor(Math.random() * 40) + 30,
          neuroticism: Math.floor(Math.random() * 40) + 20,
        },
        interests: this.getRandomInterests(),
        painPoints: this.getRandomPainPoints(),
        goals: this.getRandomGoals(),
      };
      return persona;
    });
  }

  private generateName(): string {
    const names = {
      male: ['Alex', 'James', 'Michael', 'David', 'John', 'Robert', 'William', 'Richard', 'Thomas', 'Christopher'],
      female: ['Sarah', 'Emily', 'Jessica', 'Ashley', 'Jennifer', 'Amanda', 'Lisa', 'Michelle', 'Kimberly', 'Nicole'],
      nonBinary: ['Jordan', 'Taylor', 'Casey', 'Morgan', 'Riley', 'Avery', 'Quinn', 'Sage', 'River', 'Phoenix']
    };
    
    const gender = Math.random() < 0.4 ? 'male' : Math.random() < 0.7 ? 'female' : 'nonBinary';
    const nameList = names[gender];
    return nameList[Math.floor(Math.random() * nameList.length)];
  }

  private getRandomIndustry(): string {
    const industries = ['Technology', 'Healthcare', 'Finance', 'Education', 'Retail', 'Manufacturing', 'Real Estate', 'Media', 'Transportation', 'Energy'];
    return industries[Math.floor(Math.random() * industries.length)];
  }

  private getRandomRole(): string {
    const roles = ['CEO', 'CTO', 'CFO', 'CMO', 'VP Engineering', 'Product Manager', 'Marketing Director', 'Sales Director', 'Operations Manager', 'HR Director'];
    return roles[Math.floor(Math.random() * roles.length)];
  }

  private getRandomCompanySize(): 'startup' | 'small' | 'medium' | 'enterprise' {
    const sizes = ['startup', 'small', 'medium', 'enterprise'];
    return sizes[Math.floor(Math.random() * sizes.length)] as any;
  }

  private getRandomRiskTolerance(): 'low' | 'medium' | 'high' {
    const tolerances = ['low', 'medium', 'high'];
    return tolerances[Math.floor(Math.random() * tolerances.length)] as any;
  }

  private getRandomTechAdoption(): 'early-adopter' | 'early-majority' | 'late-majority' | 'laggard' {
    const adoptions = ['early-adopter', 'early-majority', 'late-majority', 'laggard'];
    return adoptions[Math.floor(Math.random() * adoptions.length)] as any;
  }

  private getRandomInnovationPreference(): 'cutting-edge' | 'proven' | 'traditional' {
    const preferences = ['cutting-edge', 'proven', 'traditional'];
    return preferences[Math.floor(Math.random() * preferences.length)] as any;
  }

  private getRandomCommunicationStyle(): 'direct' | 'diplomatic' | 'analytical' | 'creative' {
    const styles = ['direct', 'diplomatic', 'analytical', 'creative'];
    return styles[Math.floor(Math.random() * styles.length)] as any;
  }

  private getRandomInterests(): string[] {
    const interests = ['AI/ML', 'Blockchain', 'Sustainability', 'Remote Work', 'Digital Transformation', 'Customer Experience', 'Data Analytics', 'Cybersecurity', 'Mobile Apps', 'Cloud Computing'];
    const count = Math.floor(Math.random() * 5) + 3;
    return interests.sort(() => Math.random() - 0.5).slice(0, count);
  }

  private getRandomPainPoints(): string[] {
    const painPoints = ['High operational costs', 'Manual processes', 'Data silos', 'Poor customer engagement', 'Inefficient workflows', 'Security concerns', 'Scalability issues', 'Integration challenges'];
    const count = Math.floor(Math.random() * 3) + 2;
    return painPoints.sort(() => Math.random() - 0.5).slice(0, count);
  }

  private getRandomGoals(): string[] {
    const goals = ['Increase efficiency', 'Reduce costs', 'Improve customer satisfaction', 'Scale operations', 'Enhance security', 'Drive innovation', 'Expand market reach', 'Optimize processes'];
    const count = Math.floor(Math.random() * 3) + 2;
    return goals.sort(() => Math.random() - 0.5).slice(0, count);
  }

  public getAllPersonas(): Persona[] {
    return [...this.personas];
  }

  public getPersonaById(id: string): Persona | undefined {
    return this.personas.find(p => p.id === id);
  }

  public getPersonasByRegion(region: string): Persona[] {
    return this.personas.filter(p => p.demographics.location.continent === region);
  }

  public getPersonasByIndustry(industry: string): Persona[] {
    return this.personas.filter(p => p.demographics.industry === industry);
  }

  public analyzePersonasWithIdea(idea: string): Country[] {
    return this.personas.map(persona => {
      const analysis = analyzeSentiment(persona, idea);
      return {
        id: persona.id,
        name: persona.demographics.location.country,
        sentiment: analysis.sentiment,
        color: this.getSentimentColor(analysis.sentiment),
        opacity: this.getSentimentOpacity(analysis.sentiment),
        region: persona.demographics.location.continent,
        coordinates: persona.demographics.location.coordinates,
        persona: {
          ...persona,
          sentiment: analysis.sentiment,
          feedback: analysis.feedback,
          reasoning: analysis.reasoning,
        },
        feedback: analysis.feedback,
        reasoning: analysis.reasoning,
      };
    });
  }

  public selectFocusGroup(idea: string, count: number = 5): Persona[] {
    const analyzedPersonas = this.analyzePersonasWithIdea(idea);
    const scoredPersonas = analyzedPersonas.map(country => {
      let score = 0;
      const ideaKeywords = idea.toLowerCase().split(' ');
      
      // Score based on interests matching
      country.persona.interests.forEach(interest => {
        if (ideaKeywords.some(keyword => interest.toLowerCase().includes(keyword))) {
          score += 10;
        }
      });
      
      // Score based on industry relevance
      if (ideaKeywords.some(keyword => country.persona.demographics.industry.toLowerCase().includes(keyword))) {
        score += 15;
      }
      
      // Score based on role relevance
      if (ideaKeywords.some(keyword => country.persona.demographics.role.toLowerCase().includes(keyword))) {
        score += 12;
      }
      
      // Add some randomness
      score += Math.random() * 20;
      
      return { persona: country.persona, score };
    });
    
    return scoredPersonas
      .sort((a, b) => b.score - a.score)
      .slice(0, count)
      .map(item => item.persona);
  }

  private getSentimentColor(sentiment: 'positive' | 'negative' | 'neutral'): string {
    switch (sentiment) {
      case 'positive': return '#10b981';
      case 'negative': return '#ef4444';
      case 'neutral': return '#f59e0b';
      default: return '#6b7280';
    }
  }

  private getSentimentOpacity(sentiment: 'positive' | 'negative' | 'neutral'): number {
    switch (sentiment) {
      case 'positive': return 0.8;
      case 'negative': return 0.7;
      case 'neutral': return 0.6;
      default: return 0.5;
    }
  }
}
