import { Persona } from '@/types/persona';

// Major cities with coordinates
const cities = [
  { city: 'New York', country: 'United States', continent: 'North America', lat: 40.7128, lon: -74.0060 },
  { city: 'London', country: 'United Kingdom', continent: 'Europe', lat: 51.5074, lon: -0.1278 },
  { city: 'Tokyo', country: 'Japan', continent: 'Asia', lat: 35.6762, lon: 139.6503 },
  { city: 'Paris', country: 'France', continent: 'Europe', lat: 48.8566, lon: 2.3522 },
  { city: 'Sydney', country: 'Australia', continent: 'Oceania', lat: -33.8688, lon: 151.2093 },
  { city: 'Mumbai', country: 'India', continent: 'Asia', lat: 19.0760, lon: 72.8777 },
  { city: 'São Paulo', country: 'Brazil', continent: 'South America', lat: -23.5505, lon: -46.6333 },
  { city: 'Moscow', country: 'Russia', continent: 'Europe', lat: 55.7558, lon: 37.6173 },
  { city: 'Beijing', country: 'China', continent: 'Asia', lat: 39.9042, lon: 116.4074 },
  { city: 'Cairo', country: 'Egypt', continent: 'Africa', lat: 30.0444, lon: 31.2357 },
  { city: 'Los Angeles', country: 'United States', continent: 'North America', lat: 34.0522, lon: -118.2437 },
  { city: 'Singapore', country: 'Singapore', continent: 'Asia', lat: 1.3521, lon: 103.8198 },
  { city: 'Dubai', country: 'UAE', continent: 'Asia', lat: 25.2048, lon: 55.2708 },
  { city: 'Berlin', country: 'Germany', continent: 'Europe', lat: 52.5200, lon: 13.4050 },
  { city: 'Toronto', country: 'Canada', continent: 'North America', lat: 43.6532, lon: -79.3832 },
  { city: 'Mexico City', country: 'Mexico', continent: 'North America', lat: 19.4326, lon: -99.1332 },
  { city: 'Buenos Aires', country: 'Argentina', continent: 'South America', lat: -34.6118, lon: -58.3960 },
  { city: 'Lagos', country: 'Nigeria', continent: 'Africa', lat: 6.5244, lon: 3.3792 },
  { city: 'Seoul', country: 'South Korea', continent: 'Asia', lat: 37.5665, lon: 126.9780 },
  { city: 'Bangkok', country: 'Thailand', continent: 'Asia', lat: 13.7563, lon: 100.5018 },
];

const industries = [
  'Technology', 'Healthcare', 'Finance', 'Education', 'Retail', 'Manufacturing',
  'Real Estate', 'Media', 'Transportation', 'Energy', 'Agriculture', 'Consulting',
  'Legal', 'Marketing', 'Design', 'Engineering', 'Sales', 'Operations'
];

const roles = [
  'CEO', 'CTO', 'CFO', 'CMO', 'VP Engineering', 'Product Manager', 'Marketing Director',
  'Sales Director', 'Operations Manager', 'HR Director', 'Data Scientist', 'Designer',
  'Developer', 'Analyst', 'Consultant', 'Entrepreneur', 'Investor', 'Advisor'
];

const interests = [
  'AI/ML', 'Blockchain', 'Sustainability', 'Remote Work', 'Digital Transformation',
  'Customer Experience', 'Data Analytics', 'Cybersecurity', 'Mobile Apps', 'Cloud Computing',
  'Automation', 'IoT', 'AR/VR', 'Fintech', 'Healthtech', 'Edtech', 'E-commerce', 'Social Media'
];

const painPoints = [
  'High operational costs', 'Manual processes', 'Data silos', 'Poor customer engagement',
  'Inefficient workflows', 'Security concerns', 'Scalability issues', 'Integration challenges',
  'Talent acquisition', 'Market competition', 'Regulatory compliance', 'Technology debt',
  'Customer retention', 'Revenue growth', 'Team collaboration', 'Decision making'
];

const goals = [
  'Increase efficiency', 'Reduce costs', 'Improve customer satisfaction', 'Scale operations',
  'Enhance security', 'Drive innovation', 'Expand market reach', 'Optimize processes',
  'Improve team productivity', 'Increase revenue', 'Better data insights', 'Streamline workflows',
  'Enhance user experience', 'Reduce manual work', 'Improve decision making', 'Faster time to market'
];

const names = {
  male: ['Alex', 'James', 'Michael', 'David', 'John', 'Robert', 'William', 'Richard', 'Thomas', 'Christopher'],
  female: ['Sarah', 'Emily', 'Jessica', 'Ashley', 'Jennifer', 'Amanda', 'Lisa', 'Michelle', 'Kimberly', 'Nicole'],
  nonBinary: ['Jordan', 'Taylor', 'Casey', 'Morgan', 'Riley', 'Avery', 'Quinn', 'Sage', 'River', 'Phoenix']
};

export function generatePersonas(count: number = 200): Persona[] {
  const personas: Persona[] = [];
  
  for (let i = 0; i < count; i++) {
    const city = cities[Math.floor(Math.random() * cities.length)];
    const industry = industries[Math.floor(Math.random() * industries.length)];
    const role = roles[Math.floor(Math.random() * roles.length)];
    const gender = Math.random() < 0.4 ? 'male' : Math.random() < 0.7 ? 'female' : 'non-binary';
    const nameList = names[gender];
    const name = nameList[Math.floor(Math.random() * nameList.length)];
    
    // Generate personality scores (realistic distribution)
    const personality = {
      openness: Math.floor(Math.random() * 40) + 30, // 30-70
      conscientiousness: Math.floor(Math.random() * 40) + 30,
      extraversion: Math.floor(Math.random() * 40) + 30,
      agreeableness: Math.floor(Math.random() * 40) + 30,
      neuroticism: Math.floor(Math.random() * 40) + 20, // Slightly lower
    };
    
    // Generate demographics
    const age = Math.floor(Math.random() * 35) + 25; // 25-60
    const income = Math.floor(Math.random() * 200000) + 50000; // $50k-$250k
    
    // Generate psychographics based on personality
    const riskTolerance = personality.openness > 60 ? 'high' : personality.openness > 40 ? 'medium' : 'low';
    const techAdoption = personality.openness > 65 ? 'early-adopter' : 
                        personality.openness > 45 ? 'early-majority' : 
                        personality.openness > 25 ? 'late-majority' : 'laggard';
    
    const communicationStyle = personality.extraversion > 60 ? 'direct' :
                             personality.agreeableness > 60 ? 'diplomatic' :
                             personality.conscientiousness > 60 ? 'analytical' : 'creative';
    
    // Select random interests, pain points, and goals
    const selectedInterests = interests
      .sort(() => Math.random() - 0.5)
      .slice(0, Math.floor(Math.random() * 5) + 3); // 3-7 interests
    
    const selectedPainPoints = painPoints
      .sort(() => Math.random() - 0.5)
      .slice(0, Math.floor(Math.random() * 3) + 2); // 2-4 pain points
    
    const selectedGoals = goals
      .sort(() => Math.random() - 0.5)
      .slice(0, Math.floor(Math.random() * 3) + 2); // 2-4 goals
    
    const persona: Persona = {
      id: `persona-${i}`,
      name: `${name} ${city.city}`,
      demographics: {
        age,
        gender,
        location: {
          city: city.city,
          country: city.country,
          continent: city.continent,
          coordinates: {
            lat: city.lat + (Math.random() - 0.5) * 2, // Add some variation
            lon: city.lon + (Math.random() - 0.5) * 2,
          },
        },
        industry,
        role,
        companySize: Math.random() < 0.3 ? 'startup' : 
                   Math.random() < 0.6 ? 'small' : 
                   Math.random() < 0.8 ? 'medium' : 'enterprise',
        income,
      },
      psychographics: {
        riskTolerance,
        techAdoption,
        innovationPreference: personality.openness > 60 ? 'cutting-edge' : 
                             personality.openness > 40 ? 'proven' : 'traditional',
        communicationStyle,
      },
      personality,
      interests: selectedInterests,
      painPoints: selectedPainPoints,
      goals: selectedGoals,
    };
    
    personas.push(persona);
  }
  
  return personas;
}

export function selectFocusGroup(personas: Persona[], idea: string, count: number = 5): Persona[] {
  // Simple relevance scoring based on interests and industry
  const scoredPersonas = personas.map(persona => {
    let score = 0;
    
    // Score based on interests matching idea keywords
    const ideaKeywords = idea.toLowerCase().split(' ');
    persona.interests.forEach(interest => {
      if (ideaKeywords.some(keyword => interest.toLowerCase().includes(keyword))) {
        score += 10;
      }
    });
    
    // Score based on industry relevance
    if (ideaKeywords.some(keyword => persona.demographics.industry.toLowerCase().includes(keyword))) {
      score += 15;
    }
    
    // Score based on role relevance
    if (ideaKeywords.some(keyword => persona.demographics.role.toLowerCase().includes(keyword))) {
      score += 12;
    }
    
    // Add some randomness
    score += Math.random() * 20;
    
    return { persona, score };
  });
  
  // Sort by score and return top personas
  return scoredPersonas
    .sort((a, b) => b.score - a.score)
    .slice(0, count)
    .map(item => item.persona);
}

export function generatePersonaFeedback(persona: Persona, idea: string): { sentiment: 'positive' | 'neutral' | 'negative', feedback: string, reasoning: string } {
  // Simple sentiment analysis based on persona characteristics
  let sentimentScore = 0;
  
  // Factor in personality traits
  sentimentScore += (persona.personality.openness - 50) * 0.1;
  sentimentScore += (persona.personality.extraversion - 50) * 0.05;
  
  // Factor in tech adoption
  if (persona.psychographics.techAdoption === 'early-adopter') sentimentScore += 20;
  else if (persona.psychographics.techAdoption === 'early-majority') sentimentScore += 10;
  else if (persona.psychographics.techAdoption === 'late-majority') sentimentScore -= 10;
  else sentimentScore -= 20;
  
  // Factor in risk tolerance
  if (persona.psychographics.riskTolerance === 'high') sentimentScore += 15;
  else if (persona.psychographics.riskTolerance === 'medium') sentimentScore += 5;
  else sentimentScore -= 10;
  
  // Add randomness
  sentimentScore += (Math.random() - 0.5) * 40;
  
  const sentiment: 'positive' | 'neutral' | 'negative' = 
    sentimentScore > 20 ? 'positive' : 
    sentimentScore > -20 ? 'neutral' : 'negative';
  
  // Generate feedback based on sentiment and persona
  const feedbackTemplates = {
    positive: [
      `This idea aligns perfectly with my goals of ${persona.goals[0]}. I can see immediate value for my ${persona.demographics.industry} team.`,
      `As someone who's always looking for ${persona.interests[0]} solutions, this really excites me. The potential impact is huge.`,
      `This addresses exactly what I've been struggling with regarding ${persona.painPoints[0]}. Count me in!`
    ],
    neutral: [
      `Interesting concept. I'd need to see more details about how it integrates with our current ${persona.demographics.industry} processes.`,
      `I can see the potential, but I'm not sure if it's the right fit for our ${persona.demographics.companySize} company at this time.`,
      `The idea has merit, but I'd want to understand the implementation timeline and costs better.`
    ],
    negative: [
      `I'm not convinced this solves our core problem of ${persona.painPoints[0]}. The approach seems too complex.`,
      `Given our current challenges with ${persona.painPoints[1]}, this doesn't seem like the right priority right now.`,
      `I've seen similar solutions fail before. The market isn't ready for this type of ${persona.demographics.industry} innovation.`
    ]
  };
  
  const reasoningTemplates = {
    positive: [
      `My experience in ${persona.demographics.role} has taught me that ${persona.interests[0]} solutions like this are exactly what the market needs.`,
      `Given my ${persona.psychographics.riskTolerance} risk tolerance and focus on ${persona.goals[0]}, this is a perfect fit.`,
      `I've been looking for something to help with ${persona.painPoints[0]}, and this addresses it directly.`
    ],
    neutral: [
      `I need more information about how this would work in practice for someone in my ${persona.demographics.role} position.`,
      `The concept is sound, but I'd need to see how it integrates with our existing ${persona.demographics.industry} workflows.`,
      `I'm cautiously optimistic but would want to see a pilot program first.`
    ],
    negative: [
      `Based on my experience with ${persona.demographics.industry} solutions, this approach has fundamental flaws.`,
      `I'm concerned about the complexity and whether it truly addresses ${persona.painPoints[0]} effectively.`,
      `Given our current focus on ${persona.goals[0]}, this doesn't align with our priorities.`
    ]
  };
  
  const feedback = feedbackTemplates[sentiment][Math.floor(Math.random() * feedbackTemplates[sentiment].length)];
  const reasoning = reasoningTemplates[sentiment][Math.floor(Math.random() * reasoningTemplates[sentiment].length)];
  
  return { sentiment, feedback, reasoning };
}
