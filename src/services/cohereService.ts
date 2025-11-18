const COHERE_API_KEY = import.meta.env.VITE_COHERE_API_KEY || 'your-cohere-api-key-here'
const COHERE_API_URL = 'https://api.cohere.ai/v1'

export interface PersonaProfile {
  id: string
  name: string
  age: number
  location: string
  industry: string
  role: string
  demographics: {
    gender: string
    education: string
    income: string
  }
  psychographics: {
    riskTolerance: string
    techAdoption: string
    innovation: string
  }
  personality: {
    openness: number
    conscientiousness: number
    extraversion: number
    agreeableness: number
    neuroticism: number
  }
}

export interface PersonaReaction {
  personaId: string
  reaction: 'positive' | 'neutral' | 'negative'
  reasoning: string
  suggestions?: string[]
  concerns?: string[]
}

export class CohereService {
  private async makeRequest(endpoint: string, data: any) {
    const response = await fetch(`${COHERE_API_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${COHERE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      throw new Error(`Cohere API error: ${response.status} ${response.statusText}`)
    }

    return response.json()
  }

  async generatePersonaReaction(persona: PersonaProfile, idea: string): Promise<PersonaReaction> {
    const prompt = `
You are ${persona.name}, a ${persona.age}-year-old ${persona.demographics.gender} ${persona.role} in the ${persona.industry} industry based in ${persona.location}.

Your personality traits:
- Openness: ${persona.personality.openness}/10
- Conscientiousness: ${persona.personality.conscientiousness}/10
- Extraversion: ${persona.personality.extraversion}/10
- Agreeableness: ${persona.personality.agreeableness}/10
- Neuroticism: ${persona.personality.neuroticism}/10

Your characteristics:
- Risk tolerance: ${persona.psychographics.riskTolerance}
- Tech adoption: ${persona.psychographics.techAdoption}
- Innovation level: ${persona.psychographics.innovation}

Product idea: "${idea}"

Please respond as ${persona.name} would, considering your personality, role, and characteristics. Provide:
1. Your reaction (positive/neutral/negative)
2. Your reasoning for this reaction
3. Any suggestions for improvement
4. Any concerns you have

Respond in JSON format:
{
  "reaction": "positive|neutral|negative",
  "reasoning": "Your detailed reasoning...",
  "suggestions": ["suggestion1", "suggestion2"],
  "concerns": ["concern1", "concern2"]
}
`

    try {
      const response = await this.makeRequest('/generate', {
        model: 'command',
        prompt: prompt,
        max_tokens: 500,
        temperature: 0.7,
      })

      const generatedText = response.generations[0].text
      
      // Try to parse JSON from the response
      const jsonMatch = generatedText.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0])
        return {
          personaId: persona.id,
          reaction: parsed.reaction,
          reasoning: parsed.reasoning,
          suggestions: parsed.suggestions || [],
          concerns: parsed.concerns || [],
        }
      }

      // Fallback if JSON parsing fails
      return {
        personaId: persona.id,
        reaction: 'neutral',
        reasoning: generatedText,
        suggestions: [],
        concerns: [],
      }
    } catch (error) {
      console.error('Error generating persona reaction:', error)
      return {
        personaId: persona.id,
        reaction: 'neutral',
        reasoning: 'Unable to generate reaction at this time.',
        suggestions: [],
        concerns: [],
      }
    }
  }

  async rerankPersonas(idea: string, personas: PersonaProfile[]): Promise<PersonaProfile[]> {
    try {
      const documents = personas.map(persona => 
        `${persona.name} - ${persona.role} in ${persona.industry}, ${persona.age} years old, ${persona.location}. Risk tolerance: ${persona.psychographics.riskTolerance}, Tech adoption: ${persona.psychographics.techAdoption}`
      )

      const response = await this.makeRequest('/rerank', {
        model: 'rerank-english-v2.0',
        query: idea,
        documents: documents,
        top_k: 5,
      })

      // Sort personas by rerank score
      const rerankedPersonas = response.results
        .map((result: any, index: number) => ({
          persona: personas[index],
          score: result.relevance_score,
        }))
        .sort((a: any, b: any) => b.score - a.score)
        .map((item: any) => item.persona)

      return rerankedPersonas.slice(0, 5) // Return top 5
    } catch (error) {
      console.error('Error reranking personas:', error)
      // Fallback: return first 5 personas
      return personas.slice(0, 5)
    }
  }

  async generateInsights(reactions: PersonaReaction[]): Promise<string> {
    const prompt = `
Analyze the following persona reactions to a product idea:

${reactions.map(r => `
Persona ${r.personaId}:
- Reaction: ${r.reaction}
- Reasoning: ${r.reasoning}
- Suggestions: ${r.suggestions?.join(', ') || 'None'}
- Concerns: ${r.concerns?.join(', ') || 'None'}
`).join('\n')}

Provide a comprehensive analysis including:
1. Overall market sentiment
2. Common themes in positive reactions
3. Common concerns or objections
4. Key suggestions for improvement
5. Market potential assessment

Keep the analysis concise but insightful.
`

    try {
      const response = await this.makeRequest('/generate', {
        model: 'command',
        prompt: prompt,
        max_tokens: 800,
        temperature: 0.5,
      })

      return response.generations[0].text
    } catch (error) {
      console.error('Error generating insights:', error)
      return 'Unable to generate insights at this time.'
    }
  }
}

export const cohereService = new CohereService()
