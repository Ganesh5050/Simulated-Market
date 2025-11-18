import { supabase, Country, Persona, ProjectPersonaNode } from '@/lib/supabase';

export class AIPersonaService {
  private static instance: AIPersonaService;

  public static getInstance(): AIPersonaService {
    if (!AIPersonaService.instance) {
      AIPersonaService.instance = new AIPersonaService();
    }
    return AIPersonaService.instance;
  }

  // Get all countries from database
  async getCountries(): Promise<Country[]> {
    const { data, error } = await supabase
      .from('countries')
      .select('*')
      .order('name');

    if (error) {
      throw new Error(`Failed to fetch countries: ${error.message}`);
    }

    return data || [];
  }

  // Generate personas for a specific project based on prompt
  async generatePersonasForProject(projectId: string, prompt: string): Promise<ProjectPersonaNode[]> {
    // Get countries
    const countries = await this.getCountries();
    
    // Generate 200 personas (one per country, cycling if needed)
    const personas = await Promise.all(
      Array.from({ length: 200 }, async (_, index) => {
        const country = countries[index % countries.length];
        return await this.generatePersonaForCountry(country, prompt, index);
      })
    );

    // Create project persona nodes
    const projectPersonaNodes = await this.createProjectPersonaNodes(projectId, personas);

    return projectPersonaNodes;
  }

  // Generate a persona for a specific country
  private async generatePersonaForCountry(
    country: Country, 
    prompt: string, 
    nodeIndex: number
  ): Promise<{
    persona: Persona;
    nodeId: string;
    sentiment: 'positive' | 'negative' | 'neutral';
    feedback: string;
    lat: number;
    lon: number;
  }> {
    // Generate persona demographics based on country
    const demographics = this.generateDemographics(country);
    
    // Generate personality traits
    const personalityTraits = this.generatePersonalityTraits();
    
    // Generate feedback based on prompt and country context
    const feedback = await this.generateFeedbackForPersona(demographics, country, prompt);
    
    // Analyze sentiment
    const sentiment = this.analyzeSentiment(feedback);
    
    // Generate coordinates for globe positioning
    const { lat, lon } = this.generateCoordinates(country, nodeIndex);

    // Create persona in database
    const { data: persona, error } = await supabase
      .from('personas')
      .insert({
        name: demographics.name,
        country_id: country.id,
        age: demographics.age,
        gender: demographics.gender,
        income_level: demographics.income_level,
        education_level: demographics.education_level,
        occupation: demographics.occupation,
        tech_savviness: demographics.tech_savviness,
        personality_traits: personalityTraits,
        demographics: demographics
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create persona: ${error.message}`);
    }

    return {
      persona,
      nodeId: `node-${nodeIndex + 1}`,
      sentiment,
      feedback,
      lat,
      lon
    };
  }

  // Generate demographics based on country data
  private generateDemographics(country: Country) {
    const names = this.getNamesForCountry(country.name);
    const name = names[Math.floor(Math.random() * names.length)];
    
    // Age distribution based on country demographics
    const age = this.generateAge(country);
    
    // Gender distribution
    const gender = Math.random() < 0.5 ? 'male' : 'female';
    
    // Income level based on GDP per capita
    const incomeLevel = this.generateIncomeLevel(country.gdp_per_capita);
    
    // Education level
    const educationLevel = this.generateEducationLevel(country.tech_adoption_index);
    
    // Occupation
    const occupation = this.generateOccupation(country.tech_adoption_index);
    
    // Tech savviness based on internet penetration and tech adoption
    const techSavviness = Math.floor(
      (country.internet_penetration / 100) * 5 + 
      (country.tech_adoption_index / 10) * 5
    );

    return {
      name,
      age,
      gender,
      income_level: incomeLevel,
      education_level: educationLevel,
      occupation,
      tech_savviness: Math.min(10, Math.max(1, techSavviness))
    };
  }

  // Generate personality traits
  private generatePersonalityTraits() {
    return {
      openness: Math.floor(Math.random() * 10) + 1,
      conscientiousness: Math.floor(Math.random() * 10) + 1,
      extraversion: Math.floor(Math.random() * 10) + 1,
      agreeableness: Math.floor(Math.random() * 10) + 1,
      neuroticism: Math.floor(Math.random() * 10) + 1
    };
  }

  // Generate feedback for persona
  private async generateFeedbackForPersona(
    demographics: any, 
    country: Country, 
    prompt: string
  ): Promise<string> {
    // This would integrate with Cohere AI in a real implementation
    // For now, we'll generate realistic feedback based on demographics
    
    const feedbackTemplates = this.getFeedbackTemplates(demographics, country);
    const template = feedbackTemplates[Math.floor(Math.random() * feedbackTemplates.length)];
    
    return template.replace('{prompt}', prompt);
  }

  // Analyze sentiment of feedback
  private analyzeSentiment(feedback: string): 'positive' | 'negative' | 'neutral' {
    const positiveWords = ['great', 'amazing', 'excellent', 'love', 'fantastic', 'wonderful', 'perfect', 'brilliant'];
    const negativeWords = ['terrible', 'awful', 'hate', 'disgusting', 'horrible', 'worst', 'bad', 'disappointing'];
    
    const lowerFeedback = feedback.toLowerCase();
    
    const positiveCount = positiveWords.filter(word => lowerFeedback.includes(word)).length;
    const negativeCount = negativeWords.filter(word => lowerFeedback.includes(word)).length;
    
    if (positiveCount > negativeCount) return 'positive';
    if (negativeCount > positiveCount) return 'negative';
    return 'neutral';
  }

  // Generate coordinates for globe positioning
  private generateCoordinates(country: Country, nodeIndex: number) {
    // This is a simplified version - in reality, you'd use actual country coordinates
    const baseLat = (Math.random() - 0.5) * 180;
    const baseLon = (Math.random() - 0.5) * 360;
    
    return {
      lat: baseLat,
      lon: baseLon
    };
  }

  // Create project persona nodes in database
  private async createProjectPersonaNodes(
    projectId: string, 
    personaData: Array<{
      persona: Persona;
      nodeId: string;
      sentiment: 'positive' | 'negative' | 'neutral';
      feedback: string;
      lat: number;
      lon: number;
    }>
  ): Promise<ProjectPersonaNode[]> {
    const nodesToInsert = personaData.map(data => ({
      project_id: projectId,
      node_id: data.nodeId,
      persona_id: data.persona.id,
      sentiment: data.sentiment,
      feedback: data.feedback,
      confidence_score: Math.random() * 0.3 + 0.7, // 0.7-1.0 confidence
      lat: data.lat,
      lon: data.lon
    }));

    const { data, error } = await supabase
      .from('project_persona_nodes')
      .insert(nodesToInsert)
      .select(`
        *,
        persona:personas(
          *,
          country:countries(*)
        )
      `);

    if (error) {
      throw new Error(`Failed to create project persona nodes: ${error.message}`);
    }

    return data || [];
  }

  // Helper methods
  private getNamesForCountry(countryName: string): string[] {
    // Simplified name generation - in reality, you'd have country-specific names
    const names = [
      'Alex Johnson', 'Maria Garcia', 'Ahmed Hassan', 'Li Wei', 'Priya Patel',
      'Hans Mueller', 'Yuki Tanaka', 'Jean Dubois', 'Carlos Silva', 'Emma Wilson'
    ];
    return names;
  }

  private generateAge(country: Country): number {
    // Age distribution based on country demographics
    const baseAge = 25 + Math.floor(Math.random() * 40); // 25-65
    return Math.min(80, Math.max(18, baseAge));
  }

  private generateIncomeLevel(gdpPerCapita: number): string {
    if (gdpPerCapita > 50000) return 'high';
    if (gdpPerCapita > 20000) return 'medium';
    return 'low';
  }

  private generateEducationLevel(techAdoption: number): string {
    if (techAdoption > 8) return 'graduate';
    if (techAdoption > 6) return 'bachelor';
    if (techAdoption > 4) return 'high_school';
    return 'primary';
  }

  private generateOccupation(techAdoption: number): string {
    const techJobs = ['Software Engineer', 'Data Scientist', 'Product Manager', 'UX Designer'];
    const traditionalJobs = ['Teacher', 'Doctor', 'Lawyer', 'Accountant', 'Sales Manager'];
    
    if (techAdoption > 7) {
      return techJobs[Math.floor(Math.random() * techJobs.length)];
    }
    return traditionalJobs[Math.floor(Math.random() * traditionalJobs.length)];
  }

  private getFeedbackTemplates(demographics: any, country: Country): string[] {
    const positiveTemplates = [
      "This {prompt} idea sounds amazing! As a {age}-year-old from {country}, I think this could really work in our market.",
      "I love the concept of {prompt}! It addresses a real need I see in {country}.",
      "This {prompt} is brilliant! I would definitely use this product.",
      "As someone from {country}, I think {prompt} has great potential here."
    ];

    const negativeTemplates = [
      "I'm not sure about {prompt}. The market in {country} might not be ready for this.",
      "This {prompt} doesn't really appeal to me. I don't see the value.",
      "I think {prompt} is too complicated for the average person in {country}.",
      "This {prompt} idea seems unrealistic for our market conditions."
    ];

    const neutralTemplates = [
      "The {prompt} concept is interesting. I'd need to see more details before deciding.",
      "I'm curious about {prompt}. How would this work in {country}?",
      "This {prompt} idea has potential, but I have some concerns about implementation.",
      "I'm not sure about {prompt}. I'd like to learn more about it."
    ];

    return [...positiveTemplates, ...negativeTemplates, ...neutralTemplates];
  }
}
