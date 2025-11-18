import { Express } from 'express'
import OpenAI from 'openai'

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'your-openai-api-key-here',
})

export function registerAiRoutes(app: Express) {
  // Chat with persona endpoint
  app.post('/ai/chat', async (req, res) => {
    try {
      const { persona, userInput } = req.body

      if (!persona || !userInput) {
        return res.status(400).json({ error: 'Persona and userInput are required' })
      }

      // Create persona-specific prompt
      const prompt = `You are ${persona.name}, a ${persona.demographics.age}-year-old ${persona.demographics.gender} ${persona.demographics.role} working in ${persona.demographics.industry} in ${persona.demographics.location.city}.

Your personality traits:
- Openness: ${persona.personality.openness}/10
- Conscientiousness: ${persona.personality.conscientiousness}/10
- Extraversion: ${persona.personality.extraversion}/10
- Agreeableness: ${persona.personality.agreeableness}/10
- Neuroticism: ${persona.personality.neuroticism}/10

Your characteristics:
- Risk tolerance: ${persona.psychographics.riskTolerance}
- Tech adoption: ${persona.psychographics.techAdoption}
- Innovation preference: ${persona.psychographics.innovationPreference}

Respond naturally as this persona would, considering your personality, role, and characteristics. Be conversational and authentic. Don't break character. Keep responses concise but informative.`

      // Call OpenAI API
      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: prompt
          },
          {
            role: 'user',
            content: userInput
          }
        ],
        max_tokens: 150,
        temperature: 0.7
      })

      const personaResponse = response.choices[0]?.message?.content || 'No response received'

      if (!personaResponse || personaResponse.trim() === '') {
        throw new Error('Empty response from OpenAI API')
      }

      res.json({ response: personaResponse })
    } catch (error) {
      console.error('AI chat error:', error)
      res.status(500).json({ 
        error: 'Failed to get AI response',
        details: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  })
  
  // Analyze idea endpoint
  app.post('/ai/analyze', async (req, res) => {
    try {
      const { idea } = req.body

      if (!idea) {
        return res.status(400).json({ error: 'Idea is required' })
      }

      // This would implement the full analysis logic
      res.json({ message: 'AI analysis endpoint - to be implemented' })
    } catch (error) {
      console.error('AI analysis error:', error)
      res.status(500).json({ error: 'Failed to analyze idea' })
    }
  })
}
