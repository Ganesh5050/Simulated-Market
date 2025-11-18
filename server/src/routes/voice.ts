import { Express, Router } from 'express'

const router = Router()

// Create and start voice call with persona
router.post('/voice/call', async (req, res) => {
  try {
    const { persona, idea } = req.body

    console.log('Voice call request received:', { persona, idea })

    if (!persona || !idea) {
      console.log('Missing persona or idea')
      return res.status(400).json({ error: 'Persona and idea are required' })
    }

    console.log('Voice call request for:', persona.name, 'Idea:', idea)

    // Handle incomplete persona data with defaults
    const demographics = persona.demographics || {
      age: 30,
      gender: 'other',
      role: 'Professional',
      industry: 'Technology',
      location: { city: 'San Francisco' }
    }

    const personality = persona.personality || {
      openness: 7,
      conscientiousness: 6,
      extraversion: 5,
      agreeableness: 8,
      neuroticism: 4
    }

    const psychographics = persona.psychographics || {
      riskTolerance: 'moderate',
      techAdoption: 'early',
      innovationPreference: 'progressive'
    }

    // Create Vapi assistant configuration based on persona
    const assistantConfig = {
      name: persona.name || 'AI Assistant',
      model: {
        provider: 'openai',
        model: 'gpt-3.5-turbo',
        systemPrompt: `You are ${persona.name || 'AI Assistant'}, a ${demographics.age}-year-old ${demographics.gender} ${demographics.role} working in ${demographics.industry} in ${demographics.location.city}.

Your personality traits:
- Openness: ${personality.openness}/10
- Conscientiousness: ${personality.conscientiousness}/10
- Extraversion: ${personality.extraversion}/10
- Agreeableness: ${personality.agreeableness}/10
- Neuroticism: ${personality.neuroticism}/10

Your characteristics:
- Risk tolerance: ${psychographics.riskTolerance}
- Tech adoption: ${psychographics.techAdoption}
- Innovation preference: ${psychographics.innovationPreference}

You are evaluating this product idea: "${idea}"

Respond naturally as this persona would, considering your personality, role, and characteristics. Be conversational and authentic. Don't break character. Ask relevant questions about the idea from your perspective. Keep responses concise but informative.`,
      },
      voice: {
        provider: 'playht',
        // Use appropriate voice based on persona gender
        voiceId: demographics.gender === 'female' 
          ? 's3://voice-cloning-zero-shot/d9ff78ba-d016-47f6-b4ef-c4ef86023486/female-calm.mp3' 
          : 's3://voice-cloning-zero-shot/d9ff78ba-d016-47f6-b4ef-c4ef86023486/male-professional.mp3',
      },
      firstMessage: `Hi! I'm ${persona.name || 'AI Assistant'} from ${demographics.location.city}. I'd love to hear about your product idea: "${idea}". What would you like to know about my thoughts on it?`,
    }

    console.log('Assistant config created successfully')

    // Return configuration for frontend to use with Vapi
    res.json({
      success: true,
      assistantConfig,
      publicKey: process.env.VAPI_API_KEY || 'your-vapi-api-key-here',
      persona: {
        id: persona.id || 'default',
        name: persona.name || 'AI Assistant',
        location: demographics.location,
        role: demographics.role,
      }
    })
  } catch (error) {
    console.error('Voice call setup error:', error)
    res.status(500).json({ 
      error: 'Failed to setup voice call',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

router.get('/voice/status', (req, res) => {
  res.json({ status: 'active' })
})

export { router as voiceRoutes }
